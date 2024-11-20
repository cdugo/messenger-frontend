import { DirectUpload } from '@rails/activestorage';

interface DirectUploadResult {
  signed_id: string;
}

export async function directUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      'http://localhost:8080/rails/active_storage/direct_uploads',
      {
        directUploadWillCreateBlobWithXHR: (xhr: XMLHttpRequest) => {
          // This callback is called before the initial request to create the blob
          xhr.withCredentials = true;
        },
        directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
          // This callback is called before the actual file upload
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