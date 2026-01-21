import { Controller, Post, UseInterceptors, UploadedFile, Body, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageKitService } from '../../APP.Infrastructure/imagekit/imagekit.service';
import { BusinessException } from '../../common/exceptions/business.exception';

interface UploadOptionsDto {
  personName?: string;
  imageType?: 'person' | 'crime';
  personId?: string;
  crimeId?: string;
  tags?: string | string[];
}

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly imageKitService: ImageKitService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadOptionsDto,
  ) {
    if (!file) {
      throw new BusinessException('No file provided', 400);
    }

    this.logger.debug(
      `Uploading file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`,
    );
    this.logger.debug(`Upload options:`, JSON.stringify(body));
    
    // Log personName specifically to verify it's being received
    if (body.personName) {
      this.logger.log(`Person name received: ${body.personName}`);
    } else {
      this.logger.warn('No personName provided in upload request');
    }

    try {
      // Parse tags if provided as comma-separated string or array
      let tags: string[] | undefined;
      if (body.tags) {
        if (Array.isArray(body.tags)) {
          tags = body.tags;
        } else if (typeof body.tags === 'string') {
          tags = body.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
        }
      }

      const url = await this.imageKitService.uploadFile(file.buffer, file.originalname, {
        personName: body.personName,
        imageType: body.imageType || 'crime',
        personId: body.personId,
        crimeId: body.crimeId,
        tags: tags,
      });

      if (!url) {
        this.logger.error('ImageKit returned null/undefined URL');
        throw new BusinessException('Failed to upload image: No URL returned', 500);
      }

      this.logger.log(`File uploaded successfully: ${url}`);
      return { url };
    } catch (error: any) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
