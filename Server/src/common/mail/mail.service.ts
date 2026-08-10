import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>("SMTP_HOST");
    const port = this.configService.get<number>("SMTP_PORT", 587);
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASS");

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail transporter configured: ${host}:${port}`);
    } else {
      this.logger.warn(
        "SMTP not configured — emails will be logged to console only",
      );
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    const from = this.configService.get<string>(
      "SMTP_FROM",
      "noreply@skywin.aero",
    );

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, ...options });
        this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${options.to}`, error);
        this.logger.warn(`Falling back to console log for: ${options.to}`);
        this.logToConsole(options);
      }
    } else {
      this.logToConsole(options);
    }
  }

  private logToConsole(options: MailOptions): void {
    this.logger.warn(`========== EMAIL (SMTP not configured) ==========`);
    this.logger.warn(`To: ${options.to}`);
    this.logger.warn(`Subject: ${options.subject}`);
    this.logger.warn(`Body content omitted from logs for security`);
    this.logger.warn(`==================================================`);
  }
}
