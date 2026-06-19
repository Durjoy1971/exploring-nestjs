import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostDeletedEvent } from '../events/post-deleted.event';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class PostCleanupListener {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @OnEvent('post.deleted', { async: true })
  async handlePostDeleted(event: PostDeletedEvent) {
    try {
      console.log(`[Background] Starting file cleanup in Cloudinary for ID: ${event.filePublicId}`);
      await this.cloudinaryService.deleteFile(event.filePublicId, event.fileResourceType);
      console.log(`[Background] Successful file cleanup in Cloudinary.`);
    } catch (error: any) {
      console.error(
        `[Background Error] Failed to delete file ${event.filePublicId} from Cloudinary:`,
        error.message || error,
      );
    }
  }
}
