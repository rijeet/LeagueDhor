import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ImageKitModule } from '../../APP.Infrastructure/imagekit/imagekit.module';

@Module({
  imports: [ImageKitModule],
  controllers: [UploadController],
})
export class UploadModule {}
