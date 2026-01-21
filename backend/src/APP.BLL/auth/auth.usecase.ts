import { Injectable, Logger } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ServerException } from '../../common/exceptions/server.exception';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { AdminRepository } from '../../APP.Infrastructure/repositories/admin.repository';
import { UserSessionRepository } from '../../APP.Infrastructure/repositories/user-session.repository';
import { AdminSessionRepository } from '../../APP.Infrastructure/repositories/admin-session.repository';
import { JwtAuthService } from '../../APP.Infrastructure/jwt/jwt.service';
import { EmailService } from '../../APP.Infrastructure/email/email.service';
import { RegisterDto } from '../../APP.Shared/dto/register.dto';
import { LoginDto } from '../../APP.Shared/dto/login.dto';
import { AdminLoginDto } from '../../APP.Shared/dto/admin-login.dto';
import { VerifyOtpDto } from '../../APP.Shared/dto/verify-otp.dto';
import { TokenResponseDto } from '../../APP.Shared/dto/token-response.dto';
import { UserRole } from '../../APP.Shared/enums/user-role.enum';

@Injectable()
export class AuthUsecase {
  private readonly logger = new Logger(AuthUsecase.name);

  constructor(
    private userRepository: UserRepository,
    private adminRepository: AdminRepository,
    private userSessionRepository: UserSessionRepository,
    private adminSessionRepository: AdminSessionRepository,
    private jwtAuthService: JwtAuthService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    this.logger.log(`Register attempt for email: ${dto.email}`);
    try {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        this.logger.warn(`Registration failed: Email already exists - ${dto.email}`);
        throw new BusinessException('Email already registered', 409);
      }

      this.logger.debug('Hashing password...');
      const passwordHash = await argon2.hash(dto.password);
      this.logger.debug('Creating user...');
      const user = await this.userRepository.create({
        id: randomUUID(),
        anonymousName: dto.anonymous_name,
        email: dto.email,
        passwordHash,
        role: UserRole.USER,
      });

      this.logger.log(`User registered successfully: ${user.id}`);
      
      const refreshToken = this.jwtAuthService.generateRefreshToken({
        sub: user.id,
        email: user.email,
      });
      
      // Create user session
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      this.logger.debug('Creating user session...');
      await this.userSessionRepository.create({
        id: randomUUID(),
        userId: user.id,
        refreshToken,
        expiresAt: refreshTokenExpiry,
      });
      this.logger.debug('User session created successfully');

      return {
        accessToken: this.jwtAuthService.generateAccessToken({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        refreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Registration error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    this.logger.log(`Login attempt for email: ${dto.email}`);
    try {
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        this.logger.warn(`Login failed: User not found - ${dto.email}`);
        throw new BusinessException('Invalid credentials', 401);
      }

      this.logger.debug(`Verifying password for user: ${user.id}`);
      const valid = await argon2.verify(user.passwordHash, dto.password);
      if (!valid) {
        this.logger.warn(`Login failed: Invalid password - ${dto.email}`);
        throw new BusinessException('Invalid credentials', 401);
      }

      this.logger.log(`User logged in successfully: ${user.id}`);
      
      const refreshToken = this.jwtAuthService.generateRefreshToken({
        sub: user.id,
        email: user.email,
      });
      
      // Create user session
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      this.logger.debug('Creating user session...');
      await this.userSessionRepository.create({
        id: randomUUID(),
        userId: user.id,
        refreshToken,
        expiresAt: refreshTokenExpiry,
      });
      this.logger.debug('User session created successfully');

      return {
        accessToken: this.jwtAuthService.generateAccessToken({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        refreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Login error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async adminLogin(dto: AdminLoginDto): Promise<{ message: string }> {
    this.logger.log(`Admin login attempt for email: ${dto.email}`);
    try {
      this.logger.debug('Looking up admin in database...');
      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin) {
        this.logger.warn(`Admin login failed: Admin not found - ${dto.email}`);
        throw new BusinessException('Invalid credentials', 401);
      }

      this.logger.debug(`Admin found: ${admin.id}, verifying password...`);
      const valid = await argon2.verify(admin.passwordHash, dto.password);
      if (!valid) {
        this.logger.warn(`Admin login failed: Invalid password - ${dto.email}`);
        throw new BusinessException('Invalid credentials', 401);
      }

      this.logger.debug('Password verified, generating OTP...');
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      this.logger.debug(`OTP generated: ${otp} (will be hashed)`);
      const otpHash = await argon2.hash(otp);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      this.logger.debug(`OTP expires at: ${otpExpiresAt.toISOString()}`);

      this.logger.debug('Updating admin OTP in database...');
      await this.adminRepository.updateOtp(dto.email, otpHash, otpExpiresAt);
      
      this.logger.debug('Sending OTP email...');
      await this.emailService.sendOtp(dto.email, otp);
      this.logger.log(`OTP sent successfully to admin: ${dto.email}`);

      return { message: 'OTP sent to email' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Admin login error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    this.logger.log(`OTP verification attempt for email: ${dto.email}`);
    try {
      this.logger.debug('Looking up admin with OTP...');
      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin || !admin.otpHash || !admin.otpExpiresAt) {
        this.logger.warn(`OTP verification failed: No OTP found for - ${dto.email}`);
        throw new BusinessException('Invalid OTP', 401);
      }

      this.logger.debug(`OTP expires at: ${admin.otpExpiresAt.toISOString()}, current time: ${new Date().toISOString()}`);
      if (new Date() > admin.otpExpiresAt) {
        this.logger.warn(`OTP verification failed: OTP expired for - ${dto.email}`);
        throw new BusinessException('OTP expired', 401);
      }

      this.logger.debug('Verifying OTP hash...');
      const valid = await argon2.verify(admin.otpHash, dto.otp);
      if (!valid) {
        this.logger.warn(`OTP verification failed: Invalid OTP for - ${dto.email}`);
        throw new BusinessException('Invalid OTP', 401);
      }

      this.logger.debug('OTP verified, clearing OTP and generating tokens...');
      await this.adminRepository.clearOtp(dto.email);

      const refreshToken = this.jwtAuthService.generateRefreshToken({
        sub: admin.id,
        email: admin.email,
      });
      
      // Create admin session
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      this.logger.debug('Creating admin session...');
      await this.adminSessionRepository.create({
        id: randomUUID(),
        adminId: admin.id,
        refreshToken,
        expiresAt: refreshTokenExpiry,
      });
      this.logger.debug('Admin session created successfully');

      this.logger.log(`Admin OTP verified successfully: ${admin.id}`);
      return {
        accessToken: this.jwtAuthService.generateAccessToken({
          sub: admin.id,
          email: admin.email,
          role: admin.role,
        }),
        refreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OTP verification error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async refreshUserToken(refreshToken: string): Promise<TokenResponseDto> {
    this.logger.log('User token refresh attempt');
    try {
      // Find session by refresh token
      const session = await this.userSessionRepository.findByRefreshToken(refreshToken);
      if (!session) {
        this.logger.warn('Token refresh failed: Session not found');
        throw new BusinessException('Invalid refresh token', 401);
      }

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.logger.warn('Token refresh failed: Session expired');
        await this.userSessionRepository.deleteByRefreshToken(refreshToken);
        throw new BusinessException('Refresh token expired', 401);
      }

      // Verify refresh token is valid
      let decoded: any;
      try {
        decoded = this.jwtAuthService.verifyToken(refreshToken);
      } catch (error) {
        this.logger.warn('Token refresh failed: Invalid token');
        await this.userSessionRepository.deleteByRefreshToken(refreshToken);
        throw new BusinessException('Invalid refresh token', 401);
      }

      const user = session.user;
      if (!user) {
        this.logger.warn('Token refresh failed: User not found in session');
        throw new BusinessException('Invalid session', 401);
      }

      // Update last used timestamp
      await this.userSessionRepository.updateLastUsed(session.id);

      // Generate new tokens
      const newRefreshToken = this.jwtAuthService.generateRefreshToken({
        sub: user.id,
        email: user.email,
      });

      // Update session with new refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.userSessionRepository.deleteByRefreshToken(refreshToken);
      await this.userSessionRepository.create({
        id: randomUUID(),
        userId: user.id,
        refreshToken: newRefreshToken,
        expiresAt: refreshTokenExpiry,
      });

      this.logger.log(`User token refreshed successfully: ${user.id}`);
      return {
        accessToken: this.jwtAuthService.generateAccessToken({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        refreshToken: newRefreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Token refresh error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async refreshAdminToken(refreshToken: string): Promise<TokenResponseDto> {
    this.logger.log('Admin token refresh attempt');
    try {
      // Find session by refresh token
      const session = await this.adminSessionRepository.findByRefreshToken(refreshToken);
      if (!session) {
        this.logger.warn('Token refresh failed: Session not found');
        throw new BusinessException('Invalid refresh token', 401);
      }

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.logger.warn('Token refresh failed: Session expired');
        await this.adminSessionRepository.deleteByRefreshToken(refreshToken);
        throw new BusinessException('Refresh token expired', 401);
      }

      // Verify refresh token is valid
      let decoded: any;
      try {
        decoded = this.jwtAuthService.verifyToken(refreshToken);
      } catch (error) {
        this.logger.warn('Token refresh failed: Invalid token');
        await this.adminSessionRepository.deleteByRefreshToken(refreshToken);
        throw new BusinessException('Invalid refresh token', 401);
      }

      const admin = session.admin;
      if (!admin) {
        this.logger.warn('Token refresh failed: Admin not found in session');
        throw new BusinessException('Invalid session', 401);
      }

      // Update last used timestamp
      await this.adminSessionRepository.updateLastUsed(session.id);

      // Generate new tokens
      const newRefreshToken = this.jwtAuthService.generateRefreshToken({
        sub: admin.id,
        email: admin.email,
      });

      // Update session with new refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.adminSessionRepository.deleteByRefreshToken(refreshToken);
      await this.adminSessionRepository.create({
        id: randomUUID(),
        adminId: admin.id,
        refreshToken: newRefreshToken,
        expiresAt: refreshTokenExpiry,
      });

      this.logger.log(`Admin token refreshed successfully: ${admin.id}`);
      return {
        accessToken: this.jwtAuthService.generateAccessToken({
          sub: admin.id,
          email: admin.email,
          role: admin.role,
        }),
        refreshToken: newRefreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Token refresh error: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
