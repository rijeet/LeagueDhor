import { Module } from '@nestjs/common';
import { PrismaModule } from './APP.Infrastructure/prisma/prisma.module';
import { UserModule } from './APP.API/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
})
export class AppModule {}
