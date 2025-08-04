import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'no-reply@gurtar.com',
    );
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
    name: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_DOMAIN')}/verify-email?token=${verificationToken}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Gurtar!</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationUrl}">Verify Email Address</a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_DOMAIN')}/reset-password?token=${resetToken}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}">Reset Password</a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      `,
    });
  }
}
