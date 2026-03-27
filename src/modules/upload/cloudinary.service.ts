import { Readable } from 'node:stream';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AttachmentType } from '@prisma/client';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  attachmentType: AttachmentType;
}

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File, folder = 'attachments'): Promise<UploadResult> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result)
            return reject(new BadRequestException(error?.message ?? 'Upload failed'));
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      attachmentType: this.mapResourceType(result.resource_type),
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  private mapResourceType(resourceType: string): AttachmentType {
    const map: Record<string, AttachmentType> = {
      image: AttachmentType.IMAGE,
      video: AttachmentType.VIDEO,
      raw: AttachmentType.RAW,
    };
    return map[resourceType] ?? AttachmentType.RAW;
  }
}
