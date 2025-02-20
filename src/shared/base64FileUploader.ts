import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface UploadResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

const base64FileUploader = (
  base64String: string,
  type: 'image' | 'video' | 'audio',
): UploadResponse => {
  try {
    const validTypes = ['image', 'video', 'audio'];
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Invalid file type' };
    }

    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: 'Invalid base64 string' };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1];

    const uploadDir = path.join(process.cwd(), 'uploads', type + 's');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const randomText = crypto.randomBytes(8).toString('hex');
    const fileName = `${randomText}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    return { success: true, filePath: `/${type}s/${fileName}` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export default base64FileUploader;
