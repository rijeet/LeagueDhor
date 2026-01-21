import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { VerificationStatus } from '../enums/verification-status.enum';

export class UpdateCrimeStatusDto {
  @ApiProperty({ enum: VerificationStatus, example: 'VERIFIED' })
  @IsEnum(VerificationStatus, { message: 'Status must be a valid verification status' })
  status!: VerificationStatus;
}
