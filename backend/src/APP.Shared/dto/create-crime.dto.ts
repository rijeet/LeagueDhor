import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { VerificationStatus } from '../enums/verification-status.enum';
import { IsProfileUrl } from '../validators/profile-url.validator';

export class CreateCrimeDto {
  // Note: id is NOT included here - it will be generated in the usecase
  
  @ApiProperty({ example: 'uuid-here' })
  @IsString()
  personId!: string;

  @ApiProperty({ example: 'Bangladesh' })
  @IsString({ message: 'Location is required' })
  location!: string;

  @ApiProperty({ type: [String], example: ['https://imagekit.io/image1.jpg'] })
  @IsArray()
  crimeImages!: string[];

  @ApiProperty({ type: [String], example: ['https://source1.com', 'https://source2.com'] })
  @IsArray({ message: 'Sources must be an array' })
  @ArrayMinSize(1, { message: 'At least one source/evidence link is required' })
  sources!: string[];

  @ApiProperty({ example: 'facebook:https://www.facebook.com/profile,instagram:https://instagram.com/profile' })
  @IsString({ message: 'Profile URL must be a string' })
  @IsProfileUrl({ message: 'Profile URL must be a valid URL or in format "platform:url"' })
  profileUrl!: string;

  @ApiProperty({ type: [String], example: ['BAL', 'Shahbagi'] })
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMinSize(1, { message: 'At least one tag is required' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags!: string[];

  // Note: verificationStatus will be set to default in repository
  verificationStatus?: VerificationStatus;
}
