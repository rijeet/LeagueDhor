import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  }

  generateRefreshToken(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): any {
    return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
  }
}
