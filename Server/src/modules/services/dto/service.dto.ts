import { ApiProperty } from "@nestjs/swagger";

export class AuditInfo {
  @ApiProperty({ required: false })
  createdBy?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  updatedBy?: string;

  @ApiProperty()
  updatedAt: string;
}

export class ServiceDto {
  @ApiProperty({ example: "s_001" })
  id: string;

  @ApiProperty({ example: "Precision CNC Machining" })
  name: string;

  @ApiProperty({
    example: "High-accuracy machining for aerospace-grade components.",
  })
  description: string;

  @ApiProperty({ example: "https://example.com/image.jpg", required: false })
  image?: string;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ required: false })
  audit?: AuditInfo;
}
