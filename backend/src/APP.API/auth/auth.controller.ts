import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../APP.BLL/auth/auth.service';
import { RegisterDto } from '../../APP.Shared/dto/register.dto';
import { LoginDto } from '../../APP.Shared/dto/login.dto';
import { AdminLoginDto } from '../../APP.Shared/dto/admin-login.dto';
import { VerifyOtpDto } from '../../APP.Shared/dto/verify-otp.dto';
import { RefreshTokenDto } from '../../APP.Shared/dto/refresh-token.dto';
import { TokenResponseDto } from '../../APP.Shared/dto/token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: TokenResponseDto })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login - Request OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent to email', schema: { example: { status: 'success', message: 'OTP sent to email', statusCode: 200, data: { message: 'OTP sent to email' } } } })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    this.logger.log(`Admin login request received for: ${adminLoginDto.email}`);
    return this.authService.adminLogin(adminLoginDto);
  }

  @Post('admin/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get admin token' })
  @ApiResponse({ status: 200, description: 'OTP verified, token returned', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(`OTP verification request received for: ${verifyOtpDto.email}`);
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh user access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('User token refresh request received');
    return this.authService.refreshUserToken(refreshTokenDto.refreshToken);
  }

  @Post('admin/refresh')
  @ApiOperation({ summary: 'Refresh admin access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refreshAdminToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Admin token refresh request received');
    return this.authService.refreshAdminToken(refreshTokenDto.refreshToken);
  }
}
