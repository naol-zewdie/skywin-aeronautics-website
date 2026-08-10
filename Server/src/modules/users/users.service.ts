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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel
      .find()
      .select("-password -passwordResetToken -passwordResetExpires")
      .exec();
    return users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    }));
  }

  async findOne(id: string): Promise<UserDto> {
    this.validateId(id);
    const user = await this.userModel
      .findById(id)
      .select("-password -passwordResetToken -passwordResetExpires")
      .exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

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
        role: saved.role,
        status: saved.status,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("A user with this email already exists");
      }
      throw err;
    }
  }

  async update(
    id: string,
    payload: UpdateUserDto,
    currentUserId: string,
  ): Promise<UserDto> {
    this.validateId(id);
    const targetUser = await this.findOne(id);

    // Prevent admin from editing another admin
    if (targetUser.role === "admin" && currentUserId !== id) {
      throw new ForbiddenException("Cannot edit another admin account");
    }

    // Prevent admin from demoting themselves (only one admin allowed)
    if (
      targetUser.role === "admin" &&
      currentUserId === id &&
      payload.role &&
      payload.role !== "admin"
    ) {
      throw new ForbiddenException("Cannot demote your own admin account");
    }

    // Prevent privilege escalation: no non-admin should ever set role to admin
    if (payload.role && payload.role !== targetUser.role) {
      if (payload.role === "admin") {
        throw new ForbiddenException(
          "Cannot promote users to admin via this endpoint",
        );
      }

      // Prevent demoting the last admin
      if (targetUser.role === "admin") {
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
      "audit.updatedAt": new Date(),
    };

    // Invalidate all sessions if critical fields (role, status) are updated
    if (
      (payload.role && payload.role !== targetUser.role) ||
      (payload.status !== undefined && payload.status !== targetUser.status)
    ) {
      const userDoc = await this.userModel
        .findById(id)
        .select("tokenVersion")
        .exec();
      const currentTokenVersion = userDoc?.tokenVersion ?? 0;
      updateData.tokenVersion = currentTokenVersion + 1;
    }

    try {
      const updated = await this.userModel
        .findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .exec();
      if (!updated) {
        throw new NotFoundException("User not found");
      }
      return {
        id: updated._id.toString(),
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("A user with this email already exists");
      }
      throw err;
    }
  }

  async changePassword(
    id: string,
    currentUserId: string,
    payload: ChangePasswordDto,
  ): Promise<void> {
    if (id !== currentUserId) {
      throw new ForbiddenException("You can only change your own password");
    }

    const user = await this.userModel.findById(id).exec();
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

  async remove(id: string, currentUserId: string): Promise<void> {
    this.validateId(id);
    if (id === currentUserId) {
      throw new ForbiddenException("Cannot delete your own account");
    }

    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("User not found");
    }
  }

  private validateId(id: string): void {
    if (!uuidValidate(id) && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  exportToCsv(users: UserDto[]): string {
    const fields = ["id", "fullName", "email", "role", "status"];
    const opts = {
      fields,
      // C2 FIX: Prevent CSV formula injection by prefixing dangerous characters
      transforms: [
        (field: { label: string }, value: unknown) => {
          const str = String(value ?? "");
          if (/^[=+\-@\t\r]/.test(str)) {
            return { [field.label]: "'" + str };
          }
          return { [field.label]: str };
        },
      ],
    };
    const parser = new Parser(opts as any);
    return parser.parse(users);
  }

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
