import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { validate as uuidValidate } from "uuid";
import * as bcrypt from "bcrypt";
import { Parser } from "@json2csv/plainjs";
import PDFDocument from "pdfkit";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "./schemas/user.schema";
import { toOpaqueRole, toInternalRole } from "../../common/utils/role-obfuscator";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Returns all users, excluding sensitive fields (password hash, reset tokens).
   * Accessible by admins only.
   */
  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel
      .find()
      .select("-password -passwordResetToken -passwordResetExpires")
      .exec();
    return users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: toOpaqueRole(user.role),
      status: user.status,
    }));
  }

  /**
   * Returns a single user by their ID, excluding sensitive fields.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if no user exists with the given ID.
   */
  async findOne(id: string): Promise<UserDto> {
    this.validateId(id);
    const user = await this.userModel
      .findOne(this.buildIdQuery(id))
      .select("-password -passwordResetToken -passwordResetExpires")
      .exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: toOpaqueRole(user.role),
      status: user.status,
    };
  }

  /**
   * Creates a new user account with a bcrypt-hashed password.
   * Only the `operator` role may be created; admin creation is blocked.
   *
   * @param payload      - Validated create-user DTO.
   * @param currentUserId - ID of the admin performing the action (for audit trail).
   * @throws ForbiddenException if trying to create an admin account.
   * @throws BadRequestException if the email is already registered.
   */
  async create(
    payload: CreateUserDto,
    currentUserId?: string,
  ): Promise<UserDto> {
    // Prevent creation of admin users — there is only one admin
    if (payload.role === "admin") {
      throw new ForbiddenException(
        "Cannot create admin users via this endpoint",
      );
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    const created = new this.userModel({
      ...payload,
      password: hashedPassword,
      audit: {
        createdBy: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    try {
      const saved = await created.save();
      return {
        id: saved._id.toString(),
        fullName: saved.fullName,
        email: saved.email,
        role: toOpaqueRole(saved.role),
        status: saved.status,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("A user with this email already exists");
      }
      throw err;
    }
  }

  /**
   * Updates an existing user's profile fields.
   * Enforces role-escalation protection and invalidates all sessions when
   * the user's role or status changes.
   *
   * @param id            - Target user ID.
   * @param payload       - Validated update-user DTO (partial).
   * @param currentUserId - ID of the admin performing the action.
   * @throws BadRequestException if the ID format is invalid.
   * @throws ForbiddenException on privilege-escalation or self-demotion attempts.
   */
  async update(
    id: string,
    payload: UpdateUserDto,
    currentUserId: string,
  ): Promise<UserDto> {
    this.validateId(id);
    const targetUser = await this.findOne(id);
    const targetRole = toInternalRole(targetUser.role);
    const requestedRole = payload.role ? toInternalRole(payload.role) : undefined;

    // Prevent admin from editing another admin
    if (targetRole === "admin" && currentUserId !== id) {
      throw new ForbiddenException("Cannot edit another admin account");
    }

    // Prevent admin from demoting themselves (only one admin allowed)
    if (
      targetRole === "admin" &&
      currentUserId === id &&
      requestedRole &&
      requestedRole !== "admin"
    ) {
      throw new ForbiddenException("Cannot demote your own admin account");
    }

    // Prevent privilege escalation: no non-admin should ever set role to admin
    if (requestedRole && requestedRole !== targetRole) {
      if (requestedRole === "admin") {
        throw new ForbiddenException(
          "Cannot promote users to admin via this endpoint",
        );
      }

      // Prevent demoting the last admin
      if (targetRole === "admin") {
        const adminCount = await this.userModel
          .countDocuments({ role: "admin" })
          .exec();
        if (adminCount <= 1) {
          throw new ForbiddenException("Cannot demote the only admin account");
        }
      }
    }

    const updateData: Record<string, unknown> = {
      ...payload,
      ...(requestedRole ? { role: requestedRole } : {}),
      "audit.updatedAt": new Date(),
    };

    // Invalidate all sessions if critical fields (role, status) are updated
    if (
      (requestedRole && requestedRole !== targetRole) ||
      (payload.status !== undefined && payload.status !== targetUser.status)
    ) {
      const userDoc = await this.userModel
        .findOne(this.buildIdQuery(id))
        .select("tokenVersion")
        .exec();
      const currentTokenVersion = userDoc?.tokenVersion ?? 0;
      updateData.tokenVersion = currentTokenVersion + 1;
    }

    try {
      const updated = await this.userModel
        .findOneAndUpdate(this.buildIdQuery(id), { $set: updateData }, { returnDocument: "after" })
        .exec();
      if (!updated) {
        throw new NotFoundException("User not found");
      }
      return {
        id: updated._id.toString(),
        fullName: updated.fullName,
        email: updated.email,
        role: toOpaqueRole(updated.role),
        status: updated.status,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("A user with this email already exists");
      }
      throw err;
    }
  }

  /**
   * Allows a user to change their own password after verifying the current one.
   * Increments tokenVersion on success to invalidate all existing sessions.
   *
   * @throws ForbiddenException if the user tries to change another user's password.
   * @throws BadRequestException if the current password is incorrect.
   */
  async changePassword(
    id: string,
    currentUserId: string,
    payload: ChangePasswordDto,
  ): Promise<void> {
    if (id !== currentUserId) {
      throw new ForbiddenException("You can only change your own password");
    }

    const user = await this.userModel.findOne(this.buildIdQuery(id)).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValid = await bcrypt.compare(
      payload.currentPassword,
      user.password,
    );
    if (!isValid) {
      throw new BadRequestException("Invalid current password");
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    user.password = await bcrypt.hash(payload.newPassword, saltRounds);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.audit.updatedAt = new Date();
    await user.save();
  }

  /**
   * Permanently deletes a user account.
   * An admin cannot delete their own account.
   *
   * @throws ForbiddenException if the admin tries to delete themselves.
   * @throws NotFoundException if no user exists with the given ID.
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    this.validateId(id);
    if (id === currentUserId) {
      throw new ForbiddenException("Cannot delete your own account");
    }

    const result = await this.userModel.findOneAndDelete(this.buildIdQuery(id)).exec();
    if (!result) {
      throw new NotFoundException("User not found");
    }
  }

  private buildIdQuery(id: string): Record<string, unknown> {
    const isObjId = Types.ObjectId.isValid(id);
    return isObjId
      ? { $or: [{ _id: id }, { _id: new Types.ObjectId(id) }] }
      : { _id: id };
  }

  /**
   * Validates that an ID string is a proper MongoDB ObjectId (24 hex chars)
   * or a valid UUID v4.
   *
   * Security (S3): `Types.ObjectId.isValid()` returns true for any 12-byte
   * string, which is overly permissive. We require the canonical 24-character
   * hex representation to prevent ambiguous matches.
   *
   * @throws BadRequestException if the ID does not match either format.
   */
  private validateId(id: string): void {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId && !uuidValidate(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  /**
   * Exports a list of users to CSV format.
   *
   * Security (B6): Values starting with formula-injection characters
   * (=, +, -, @, TAB, CR) are prefixed with a single quote to prevent
   * spreadsheet formula injection when the CSV is opened in Excel or Sheets.
   */
  exportToCsv(users: UserDto[]): string {
    const fields = ["id", "fullName", "email", "role", "status"];
    // Sanitize each user record before passing to the parser.
    const sanitized = users.map((u) => {
      const record: Record<string, string> = {};
      for (const field of fields) {
        const str = String((u as unknown as Record<string, unknown>)[field] ?? "");
        record[field] = /^\s*[=+\-@\t\r|%]/.test(str) ? "'" + str : str;
      }
      return record;
    });
    const parser = new Parser({ fields });
    return parser.parse(sanitized);
  }

  /**
   * Exports a list of users to a PDF buffer.
   * Generates one entry per user with a separator between entries.
   * Automatically paginates when content would overflow the page.
   */
  exportToPdf(users: UserDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(24).text("Users List", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      users.forEach((user, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${user.fullName}`, { continued: false });
        doc.moveDown(0.5);

        doc.fontSize(12).font("Helvetica").text(`Email: ${user.email}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Role: ${user.role}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Status: ${user.status ? "Active" : "Inactive"}`);
        doc.moveDown(1);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      });

      doc.end();
    });
  }
}
