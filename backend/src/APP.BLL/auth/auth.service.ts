import { Injectable } from '@nestjs/common';
import { AuthUsecase } from './auth.usecase';
import { RegisterDto } from '../../APP.Shared/dto/register.dto';
import { LoginDto } from '../../APP.Shared/dto/login.dto';
import { AdminLoginDto } from '../../APP.Shared/dto/admin-login.dto';
import { VerifyOtpDto } from '../../APP.Shared/dto/verify-otp.dto';
import { TokenResponseDto } from '../../APP.Shared/dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(private authUsecase: AuthUsecase) {}

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    return this.authUsecase.register(dto);
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    return this.authUsecase.login(dto);
  }

  async adminLogin(dto: AdminLoginDto): Promise<{ message: string }> {
    return this.authUsecase.adminLogin(dto);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    return this.authUsecase.verifyOtp(dto);
  }

  async refreshUserToken(refreshToken: string): Promise<TokenResponseDto> {
    return this.authUsecase.refreshUserToken(refreshToken);
  }

  async refreshAdminToken(refreshToken: string): Promise<TokenResponseDto> {
    return this.authUsecase.refreshAdminToken(refreshToken);
  }
}
