import { Module } from '@nestjs/common';
import { DatabaseModule } from './APP.Infrastructure/database/database.module';
import { UserModule } from './APP.API/user/user.module';
import { PersonModule } from './APP.API/person/person.module';
import { CrimeModule } from './APP.API/crime/crime.module';
import { UploadModule } from './APP.API/upload/upload.module';
import { AuthModule } from './APP.API/auth/auth.module';
import { HealthModule } from './APP.API/health/health.module';

@Module({
  imports: [DatabaseModule, UserModule, PersonModule, CrimeModule, UploadModule, AuthModule, HealthModule],
})
export class AppModule {}
