import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769030452099 implements MigrationInterface {
    name = 'Init1769030452099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_sessions" ("id" uuid NOT NULL, "userId" uuid NOT NULL, "refreshToken" character varying NOT NULL, "deviceInfo" character varying, "ipAddress" character varying, "userAgent" character varying, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUsedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_56ca06637d897e5d0b970ef5255" UNIQUE ("refreshToken"), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55fa4db8406ed66bc704432842" ON "user_sessions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_56ca06637d897e5d0b970ef525" ON "user_sessions" ("refreshToken") `);
        await queryRunner.query(`CREATE TYPE "public"."User_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL, "anonymousName" character varying, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."User_role_enum" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Crime_verificationstatus_enum" AS ENUM('UNVERIFIED', 'VERIFIED', 'FALSE', 'AI_GENERATED')`);
        await queryRunner.query(`CREATE TABLE "Crime" ("id" uuid NOT NULL, "personId" uuid NOT NULL, "location" character varying, "crimeImages" text array NOT NULL, "sources" text array NOT NULL, "profileUrl" character varying, "tags" jsonb, "verificationStatus" "public"."Crime_verificationstatus_enum" NOT NULL DEFAULT 'UNVERIFIED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4865bde733a55ff69ad72a1e78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Person" ("id" uuid NOT NULL, "name" character varying NOT NULL, "imageUrl" character varying, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d2b80b685fe2328edd6bd1e92ea" UNIQUE ("slug"), CONSTRAINT "PK_5c3ede2b2959b65c86663e58180" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin_sessions" ("id" uuid NOT NULL, "adminId" uuid NOT NULL, "refreshToken" character varying NOT NULL, "deviceInfo" character varying, "ipAddress" character varying, "userAgent" character varying, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUsedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_13381b85a2b92e985f9eaa57337" UNIQUE ("refreshToken"), CONSTRAINT "PK_38bb553c2372215d48de2306c5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2d86d26b570d7df300d102b952" ON "admin_sessions" ("adminId") `);
        await queryRunner.query(`CREATE INDEX "IDX_13381b85a2b92e985f9eaa5733" ON "admin_sessions" ("refreshToken") `);
        await queryRunner.query(`CREATE TYPE "public"."admin_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" uuid NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."admin_role_enum" NOT NULL DEFAULT 'SUPER_ADMIN', "otpHash" character varying, "otpExpiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Crime" ADD CONSTRAINT "FK_1ffee4861ced5ef79bf445443c8" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_sessions" ADD CONSTRAINT "FK_2d86d26b570d7df300d102b952e" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_sessions" DROP CONSTRAINT "FK_2d86d26b570d7df300d102b952e"`);
        await queryRunner.query(`ALTER TABLE "Crime" DROP CONSTRAINT "FK_1ffee4861ced5ef79bf445443c8"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_55fa4db8406ed66bc7044328427"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13381b85a2b92e985f9eaa5733"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d86d26b570d7df300d102b952"`);
        await queryRunner.query(`DROP TABLE "admin_sessions"`);
        await queryRunner.query(`DROP TABLE "Person"`);
        await queryRunner.query(`DROP TABLE "Crime"`);
        await queryRunner.query(`DROP TYPE "public"."Crime_verificationstatus_enum"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TYPE "public"."User_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56ca06637d897e5d0b970ef525"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55fa4db8406ed66bc704432842"`);
        await queryRunner.query(`DROP TABLE "user_sessions"`);
    }

}
