import { DirectUpload } from '@rails/activestorage';

interface DirectUploadResult {
  signed_id: string;
}

export async function directUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:8080/rails/active_storage/direct_uploads',
      {
        directUploadWillCreateBlobWithXHR: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = true;
        },
        directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = true;
        }
      }
    );

    upload.create((error: Error | null, blob: DirectUploadResult) => {
      if (error) {
        reject(error);
      } else {
        resolve(blob.signed_id);
      }
    });
  });
} 