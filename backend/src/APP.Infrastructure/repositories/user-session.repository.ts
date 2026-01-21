import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../APP.Entity/user-session.entity';

@Injectable()
export class UserSessionRepository {
  private readonly logger = new Logger(UserSessionRepository.name);

  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async create(data: {
    id: string;
    userId: string;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    this.logger.debug(`Creating user session for userId: ${data.userId}`);
    try {
      const session = this.sessionRepository.create({
        ...data,
        lastUsedAt: new Date(),
      });
      const savedSession = await this.sessionRepository.save(session);
      this.logger.log(`User session created: ${savedSession.id} for userId: ${data.userId}`);
      return savedSession;
    } catch (error: any) {
      this.logger.error(`Error creating user session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<any | null> {
    return this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.refreshToken = :refreshToken', { refreshToken })
      .getOne();
  }

  async findByUserId(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId },
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

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }
}
