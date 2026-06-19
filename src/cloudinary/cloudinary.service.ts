import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nestjs_uploads',
          resource_type: 'auto', // Supports images, PDFs, etc. by auto-detecting format
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned empty result'));
          resolve(result);
        },
      );

      // Convert buffer into a readable stream and pipe to Cloudinary
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null); // Indicates EOF (End of File)
      readable.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }
}
