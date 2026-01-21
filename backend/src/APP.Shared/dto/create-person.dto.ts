import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, Matches, MinLength, MaxLength } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(200, { message: 'Name must be less than 200 characters' })
  @Matches(/^[\p{L}\s'.-]+$/u, {
    message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods. No numbers, special characters, or emojis allowed.',
  })
  name!: string;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
