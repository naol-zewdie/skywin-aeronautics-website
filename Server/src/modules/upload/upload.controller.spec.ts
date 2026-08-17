import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UploadController } from "./upload.controller";

describe("UploadController Security & Validation", () => {
  let controller: UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it("should throw BadRequestException when no file is uploaded", async () => {
    await expect(controller.uploadImage(undefined)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should throw BadRequestException for invalid magic bytes", async () => {
    const fakeFile = {
      fieldname: "file",
      originalname: "fake.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      size: 100,
      buffer: Buffer.from("NOT_A_REAL_JPEG_BUFFER"),
    };

    await expect(controller.uploadImage(fakeFile)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should reject image containing embedded script tags", async () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const scriptPayload = Buffer.from("<script>alert(1)</script>");
    const maliciousBuffer = Buffer.concat([jpegHeader, scriptPayload]);

    const fakeFile = {
      fieldname: "file",
      originalname: "malicious.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      size: maliciousBuffer.length,
      buffer: maliciousBuffer,
    };

    await expect(controller.uploadImage(fakeFile)).rejects.toThrow(
      "File content rejected due to embedded script or code tags",
    );
  });

  it("should successfully process and sanitize valid JPEG image", async () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const eoi = Buffer.from([0xff, 0xd9]);
    const validBuffer = Buffer.concat([jpegHeader, Buffer.from("clean image data"), eoi]);

    const fakeFile = {
      fieldname: "file",
      originalname: "test.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      size: validBuffer.length,
      buffer: validBuffer,
    };

    const result = await controller.uploadImage(fakeFile);

    expect(result).toHaveProperty("url");
    expect(result.url).toMatch(/^\/uploads\/[a-f0-9]{32}\.jpg$/);
    expect(result.filename).toMatch(/^[a-f0-9]{32}\.jpg$/);
  });

  it("should successfully process and sanitize valid PNG image", async () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const iendChunk = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
    const validBuffer = Buffer.concat([pngHeader, Buffer.from("clean png data"), iendChunk]);

    const fakeFile = {
      fieldname: "file",
      originalname: "test.png",
      encoding: "7bit",
      mimetype: "image/png",
      size: validBuffer.length,
      buffer: validBuffer,
    };

    const result = await controller.uploadImage(fakeFile);

    expect(result).toHaveProperty("url");
    expect(result.url).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);
    expect(result.filename).toMatch(/^[a-f0-9]{32}\.png$/);
  });
});
