import { Injectable, Logger } from '@nestjs/common';
import { ServerException } from '../../common/exceptions/server.exception';
const ImageKit = require('imagekit');

@Injectable()
export class ImageKitService {
  private readonly logger = new Logger(ImageKitService.name);
  private imagekit: any;

  constructor() {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      this.logger.error('ImageKit configuration missing. Check environment variables.');
      throw new Error('Missing ImageKit configuration');
    }

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    options?: {
      folder?: string;
      personName?: string;
      imageType?: 'person' | 'crime';
      personId?: string;
      crimeId?: string;
      tags?: string[];
    },
  ): Promise<string> {
    try {
      // Generate folder path based on person name
      let folderPath = 'crimes'; // default
      if (options?.personName) {
        const sanitizedName = this.sanitizeFolderName(options.personName);
        const subFolder = options.imageType === 'person' ? 'person' : 'crimes';
        folderPath = `persons/${sanitizedName}/${subFolder}`;
      } else if (options?.folder) {
        folderPath = options.folder;
      }

      // Prepare custom metadata
      const customMetadata: Record<string, any> = {
        uploadedAt: new Date().toISOString(),
        imageType: options?.imageType || 'crime',
      };

      if (options?.personId) {
        customMetadata.personId = options.personId;
      }

      if (options?.crimeId) {
        customMetadata.crimeId = options.crimeId;
      }

      if (options?.personName) {
        customMetadata.personName = options.personName;
      }

      if (options?.tags && options.tags.length > 0) {
        customMetadata.tags = options.tags.join(',');
      }

      this.logger.debug(
        `Uploading to ImageKit: ${fileName}, folder: ${folderPath}, metadata:`,
        JSON.stringify(customMetadata),
      );

      const uploadOptions: any = {
        file: file,
        fileName: fileName,
        folder: folderPath,
        customMetadata: customMetadata,
        // Additional ImageKit options
        useUniqueFileName: true, // Prevents overwriting files with same name
        responseFields: ['url', 'fileId', 'name', 'customMetadata'], // Request specific fields
      };

      const result = await this.imagekit.upload(uploadOptions);

      this.logger.debug(`ImageKit response:`, JSON.stringify(result, null, 2));

      // ImageKit returns the URL in the 'url' property
      if (!result || !result.url) {
        this.logger.error('ImageKit upload succeeded but no URL in response:', result);
        throw new ServerException('ImageKit upload failed: No URL returned');
      }

      this.logger.log(`ImageKit upload successful: ${result.url} (folder: ${folderPath})`);
      return result.url;
    } catch (error: any) {
      this.logger.error(`ImageKit upload error: ${error.message}`, error.stack);

      // Provide more specific error messages
      if (error.message?.includes('authentication') || error.message?.includes('credentials')) {
        throw new ServerException('ImageKit authentication failed. Please check your API keys.');
      }

      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        throw new ServerException('ImageKit connection failed. Please try again.');
      }

      throw new ServerException(`ImageKit upload failed: ${error.message || error}`);
    }
  }

  /**
   * Sanitize person name for use in folder path
   * Removes special characters and spaces, converts to lowercase
   */
  private sanitizeFolderName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-') // Replace special chars with hyphen
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}
