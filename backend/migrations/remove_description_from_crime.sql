-- Migration: Remove description column from Crime table
-- Date: 2025-01-21
-- Description: Description field is no longer needed in the Crime entity

-- Drop the description column from the Crime table
ALTER TABLE "Crime" DROP COLUMN IF EXISTS "description";
