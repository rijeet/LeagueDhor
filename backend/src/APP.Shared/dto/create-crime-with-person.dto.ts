import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, MinLength, MaxLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDto } from './create-person.dto';
import { IsProfileUrl } from '../validators/profile-url.validator';

export class CreateCrimeWithPersonDto {
  @ApiProperty({ required: false, description: 'Existing person ID (if adding crime to existing person)' })
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({ required: false, description: 'Person details (if creating new person)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person?: CreatePersonDto;

  @ApiProperty({ example: 'Bangladesh', maxLength: 200 })
  @IsString({ message: 'Location is required' })
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
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
}
