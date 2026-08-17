import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { join } from "path";
import * as crypto from "crypto";
import { promises as fs } from "fs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// Magic byte signatures for image validation
const IMAGE_SIGNATURES: Array<{ mime: string; bytes: Buffer; offset: number }> =
  [
    { mime: "image/jpeg", bytes: Buffer.from([0xff, 0xd8, 0xff]), offset: 0 },
    {
      mime: "image/png",
      bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      offset: 0,
    },
    { mime: "image/gif", bytes: Buffer.from("GIF87a"), offset: 0 },
    { mime: "image/gif", bytes: Buffer.from("GIF89a"), offset: 0 },
    { mime: "image/webp", bytes: Buffer.from("RIFF"), offset: 0 },
  ];

function validateImageMagicBytes(buffer: Buffer, claimedMime: string): boolean {
  if (buffer.length < 12) return false;
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.mime === claimedMime) {
      if (sig.mime === "image/webp") {
        // WebP: starts with RIFF....WEBP
        if (
          buffer.subarray(0, 4).equals(sig.bytes) &&
          buffer.subarray(8, 12).toString("ascii") === "WEBP"
        ) {
          return true;
        }
      } else {
        if (
          buffer
            .subarray(sig.offset, sig.offset + sig.bytes.length)
            .equals(sig.bytes)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Deeply scans the uploaded image buffer for embedded scripts, HTML, PHP tags,
 * and polyglot payload signatures. Truncates trailing payload data appended
 * past valid image EOF markers (e.g. JPEG EOI or PNG IEND chunks).
 */
function sanitizeAndTruncateImageBuffer(buffer: Buffer, mimetype: string): Buffer {
  // 1. Scan for forbidden script tags or executable signatures
  const textContent = buffer.toString("binary");
  const FORBIDDEN_PATTERNS = [
    /<\s*script/i,
    /<\s*\?php/i,
    /<\s*html/i,
    /<\s*svg/i,
    /javascript\s*:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /<!ENTITY/i,
    /<\s*iframe/i,
    /<\s*object/i,
    /<\s*embed/i,
    /eval\s*\(/i,
  ];

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(textContent)) {
      throw new BadRequestException(
        "File content rejected due to embedded script or code tags",
      );
    }
  }

  // 2. Truncate trailing polyglot payload data past official EOF markers
  if (mimetype === "image/jpeg") {
    // JPEG ends with FF D9 (EOI marker)
    const eoiIndex = buffer.lastIndexOf(Buffer.from([0xff, 0xd9]));
    if (eoiIndex !== -1 && eoiIndex + 2 < buffer.length) {
      return buffer.subarray(0, eoiIndex + 2);
    }
  } else if (mimetype === "image/png") {
    // PNG ends with IEND chunk: 49 45 4E 44 AE 42 60 82
    const iendMarker = Buffer.from([
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const iendIndex = buffer.lastIndexOf(iendMarker);
    if (iendIndex !== -1 && iendIndex + 8 < buffer.length) {
      return buffer.subarray(0, iendIndex + 8);
    }
  }

  return buffer;
}

const storage = memoryStorage();

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Handles file upload requests.
 * Only ADMIN and OPERATOR roles may upload files.
 * Files are stored in the local `uploads/` directory with randomised names
 * derived from their validated MIME type (never the user-supplied filename).
 */
@ApiTags("upload")
@Controller("upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
  @Post("image")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Upload an image file" })
  @ApiConsumes("multipart/form-data")
  /**
   * Accepts a single image upload (JPEG, PNG, GIF, or WebP).
   *
   * Security & Sanitization:
   * - File size is capped at 5 MB (well within the 10 MB body-parser limit).
   * - MIME type is checked via both the `Content-Type` header and magic-byte
   *   inspection of the raw buffer — preventing MIME confusion attacks.
   * - Deep binary sanitization checks for embedded scripts or HTML/PHP code.
   * - Polyglot payload data past EOF markers is automatically truncated.
   * - Saved filename is a cryptographically random hex string; the
   *   original filename is discarded entirely.
   */
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: MulterFile | undefined) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // 1. Validate magic bytes perfectly match claimed mimetype
    if (!validateImageMagicBytes(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        "File content does not match the claimed image format",
      );
    }

    // 2. Deep content sanitization & polyglot payload truncation
    const sanitizedBuffer = sanitizeAndTruncateImageBuffer(
      file.buffer,
      file.mimetype,
    );

    // Determine extension from validated MIME type (never user-supplied filename)
    const ext = MIME_TO_EXT[file.mimetype] || ".bin";
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filepath, sanitizedBuffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      size: sanitizedBuffer.length,
    };
  }
}
