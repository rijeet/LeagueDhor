import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../APP.Entity/admin.entity';

@Injectable()
export class AdminRepository {
  private readonly logger = new Logger(AdminRepository.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    this.logger.debug(`Finding admin by email: ${email}`);
    try {
      const admin = await this.adminRepository.findOne({ where: { email } });
      this.logger.debug(`Admin lookup result: ${admin ? `Found (${admin.id})` : 'Not found'}`);
      return admin;
    } catch (error: any) {
      this.logger.error(`Error finding admin by email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(data: { id: string; email: string; passwordHash: string; role: any }): Promise<Admin> {
    this.logger.debug(`Creating admin: ${data.email}`);
    try {
      const admin = this.adminRepository.create(data);
      const savedAdmin = await this.adminRepository.save(admin);
      this.logger.log(`Admin created successfully: ${savedAdmin.id}`);
      return savedAdmin;
    } catch (error: any) {
      this.logger.error(`Error creating admin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateOtp(email: string, otpHash: string, otpExpiresAt: Date): Promise<void> {
    this.logger.debug(`Updating OTP for admin: ${email}`);
    try {
      await this.adminRepository.update({ email }, { otpHash, otpExpiresAt });
      this.logger.debug(`OTP updated successfully for: ${email}`);
    } catch (error: any) {
      this.logger.error(`Error updating OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clearOtp(email: string): Promise<void> {
    this.logger.debug(`Clearing OTP for admin: ${email}`);
    try {
      await this.adminRepository.update({ email }, { otpHash: undefined, otpExpiresAt: undefined });
      this.logger.debug(`OTP cleared successfully for: ${email}`);
    } catch (error: any) {
      this.logger.error(`Error clearing OTP: ${error.message}`, error.stack);
      throw error;
    }
  }
}
