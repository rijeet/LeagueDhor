import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set in environment variables');
      throw new Error('RESEND_API_KEY is required');
    }
    this.logger.debug('Initializing Resend email service...');
    this.resend = new Resend(apiKey);
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    this.logger.log(`Sending OTP email to: ${email}`);
    try {
      const result: any = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'League Dhor <onboarding@resend.dev>',
        to: email,
        subject: 'Admin Login OTP',
        html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      });
      // Resend API response structure may vary
      const emailId = result?.data?.id || result?.id || 'N/A';
      this.logger.log(`OTP email sent successfully. Resend ID: ${emailId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send OTP email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
