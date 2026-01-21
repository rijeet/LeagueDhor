import { IsString, IsUUID } from 'class-validator';

/**
 * DTO for validating UUID parameters in URLs
 * Ensures UUIDs are in correct format
 */
export class UuidParamDto {
  @IsString({ message: 'ID must be a string' })
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  id!: string;
}
