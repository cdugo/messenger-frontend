declare module '@rails/activestorage' {
  export class DirectUpload {
    constructor(
      file: File,
      url: string,
      delegate: {
        directUploadWillCreateBlobWithXHR?: (xhr: XMLHttpRequest) => void;
        directUploadWillStoreFileWithXHR?: (xhr: XMLHttpRequest) => void;
      }
    );

    create(callback: (error: Error | null, blob: { signed_id: string }) => void): void;
  }
} 