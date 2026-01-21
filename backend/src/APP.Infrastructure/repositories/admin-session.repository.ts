import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminSession } from '../../APP.Entity/admin-session.entity';

@Injectable()
export class AdminSessionRepository {
  private readonly logger = new Logger(AdminSessionRepository.name);

  constructor(
    @InjectRepository(AdminSession)
    private readonly sessionRepository: Repository<AdminSession>,
  ) {}

  async create(data: {
    id: string;
    adminId: string;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<AdminSession> {
    this.logger.debug(`Creating admin session for adminId: ${data.adminId}`);
    try {
      const session = this.sessionRepository.create({
        ...data,
        lastUsedAt: new Date(),
      });
      const savedSession = await this.sessionRepository.save(session);
      this.logger.log(`Admin session created: ${savedSession.id} for adminId: ${data.adminId}`);
      return savedSession;
    } catch (error: any) {
      this.logger.error(`Error creating admin session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<any | null> {
    return this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.admin', 'admin')
      .where('session.refreshToken = :refreshToken', { refreshToken })
      .getOne();
  }

  async findByAdminId(adminId: string): Promise<AdminSession[]> {
    return this.sessionRepository.find({
      where: { adminId },
      order: { lastUsedAt: 'DESC' },
    });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.sessionRepository.update(id, { lastUsedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }

  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ refreshToken });
  }

  async deleteExpired(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async deleteAllByAdminId(adminId: string): Promise<void> {
    await this.sessionRepository.delete({ adminId });
  }
}
