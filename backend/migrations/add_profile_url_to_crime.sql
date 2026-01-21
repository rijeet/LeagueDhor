-- Migration: Add profileUrl column to Crime table
-- Date: 2026-01-20

-- Add profileUrl column to Crime table
ALTER TABLE "Crime" 
ADD COLUMN IF NOT EXISTS "profileUrl" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Crime"."profileUrl" IS 'URL to the person''s profile (e.g., Facebook, LinkedIn)';
