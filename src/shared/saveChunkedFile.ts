import fs from 'fs';
import path from 'path';

interface UploadResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

const fileChunks: Record<
  string,
  { chunks: Buffer[]; totalChunks: number; receivedChunks: Set<number> }
> = {};

const saveChunkedFile = (
  chunk: string,
  roomId: string,
  type: 'image' | 'video' | 'audio',
  chunkIndex: number,
  totalChunks: number,
): UploadResponse => {
  try {
    if (!fileChunks[roomId]) {
      fileChunks[roomId] = {
        chunks: new Array(totalChunks).fill(null),
        totalChunks,
        receivedChunks: new Set(),
      };
    }

    // Prevent duplicate chunk storage
    if (fileChunks[roomId].receivedChunks.has(chunkIndex)) {
      return { success: true }; // Ignore duplicate chunks
    }

    // Convert Base64 to Buffer and store chunk
    fileChunks[roomId].chunks[chunkIndex] = Buffer.from(chunk, 'base64');
    fileChunks[roomId].receivedChunks.add(chunkIndex);

    console.log(
      `✅ Received chunk ${chunkIndex + 1}/${totalChunks} for room ${roomId}`,
    );

    // Ensure all chunks are received
    if (fileChunks[roomId].receivedChunks.size < totalChunks) {
      return { success: true }; // Still waiting for more chunks
    }

    // Ensure all chunks are present before saving
    if (fileChunks[roomId].chunks.includes(null)) {
      console.error(`❌ Error: Missing chunks for room ${roomId}`);
      return { success: false, error: 'Missing chunks, cannot merge file.' };
    }

    // 📌 Save final file after receiving last chunk
    const uploadDir = path.join(process.cwd(), 'uploads', type + 's');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(
      uploadDir,
      `${roomId}-${Date.now()}.${type === 'video' ? 'webm' : 'jpg'}`,
    );

    // Merge sorted chunks
    fs.writeFileSync(
      filePath,
      Buffer.concat(fileChunks[roomId].chunks as Buffer[]),
    );

    delete fileChunks[roomId]; // Cleanup stored chunks

    console.log(`✅ File saved successfully: ${filePath}`);
    return { success: true, filePath: `/${type}s/${path.basename(filePath)}` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export default saveChunkedFile;
