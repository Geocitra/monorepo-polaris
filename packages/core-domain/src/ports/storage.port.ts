export interface UploadStreamOptions {
  destinationPath: string; // e.g. 'posters/tenant-id/article-uuid.webp'
  contentType: string;
  contentLength?: number;
}

export interface IStoragePort {
  uploadFromUrl(sourceUrl: string, destinationPath: string): Promise<{ publicUrl: string; sizeBytes: number }>;
  uploadBuffer(buffer: Buffer, options: UploadStreamOptions): Promise<{ publicUrl: string }>;
  deleteFile(destinationPath: string): Promise<void>;
}
