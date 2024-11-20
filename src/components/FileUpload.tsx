import { ChangeEvent, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUpload({ onFileSelect, accept = "image/*,video/*", multiple = true }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
      />
      <button
        type="button"
        onClick={handleClick}
        className="bg-neutral-primary rounded-full p-2 w-8 h-8 flex items-center justify-center hover:bg-neutral-hover transition-colors"
      >
        <PlusIcon />
      </button>
    </>
  );
} 



function PlusIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.25 14.25C7.25 14.6642 7.58579 15 8 15C8.41421 15 8.75 14.6642 8.75 14.25V8.75L14.25 8.75C14.6642 8.75 15 8.41421 15 8C15 7.58579 14.6642 7.25 14.25 7.25L8.75 7.25V1.75C8.75 1.33579 8.41421 1 8 1C7.58579 1 7.25 1.33579 7.25 1.75V7.25L1.75 7.25C1.33579 7.25 1 7.58579 1 8C1 8.41421 1.33579 8.75 1.75 8.75L7.25 8.75V14.25Z" fill="currentColor" className="text-text-primary"/>
    </svg>
}