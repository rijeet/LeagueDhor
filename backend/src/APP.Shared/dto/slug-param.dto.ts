import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for validating slug parameters in URLs
 * Ensures slugs are safe and follow expected format
 */
export class SlugParamDto {
  @IsString({ message: 'Slug must be a string' })
  @MinLength(1, { message: 'Slug cannot be empty' })
  @MaxLength(100, { message: 'Slug cannot exceed 100 characters' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;
}
