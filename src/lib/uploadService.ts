'use client';

interface DirectUploadResult {
  signed_id: string;
}

export async function directUpload(file: File): Promise<string> {
  // Dynamically import DirectUpload only on the client side
  const { DirectUpload } = await import('@rails/activestorage');
  
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