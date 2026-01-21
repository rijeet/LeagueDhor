import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ required: false, example: 'SilentTiger91' })
  @IsOptional()
  @IsString()
  anonymous_name?: string;

  @ApiProperty({ required: true, example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: true, example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
