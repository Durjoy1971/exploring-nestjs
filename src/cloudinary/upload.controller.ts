import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }
}
