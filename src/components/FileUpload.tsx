import { ChangeEvent, useRef } from 'react';
import { PlusIcon } from './icons/PlusIcon';

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
