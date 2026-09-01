export interface R2UploadOptions {
  key: string;
  contentType: string;
  cacheControl?: string;
}

export interface R2StorageClient {
  uploadObject(key: string, buffer: ArrayBuffer | Buffer, contentType: string): Promise<string>;
  deleteObject(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
}

class MockR2StorageClient implements R2StorageClient {
  private cdnBaseUrl: string;

  constructor(cdnBaseUrl = 'https://images.flavornest.xyz') {
    this.cdnBaseUrl = cdnBaseUrl.replace(/\/$/, '');
  }

  async uploadObject(key: string, _buffer: ArrayBuffer | Buffer, _contentType: string): Promise<string> {
    return `${this.cdnBaseUrl}/${key}`;
  }

  async deleteObject(_key: string): Promise<boolean> {
    return true;
  }

  getPublicUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`;
  }
}

export const r2Client: R2StorageClient = new MockR2StorageClient(
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.flavornest.xyz'
);
