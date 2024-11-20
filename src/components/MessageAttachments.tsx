import Image from 'next/image';
import { AttachmentUrl } from '@/app/types/server';
import { useState } from 'react';

interface MessageAttachmentsProps {
  attachments: AttachmentUrl[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, { width: number; height: number }>>({});

  const handleImageLoad = (id: number, naturalWidth: number, naturalHeight: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: {
        width: naturalWidth,
        height: naturalHeight
      }
    }));
  };

  const getImageDimensions = (naturalWidth: number, naturalHeight: number) => {
    const maxWidth = 400;
    const maxHeight = 300;
    const aspectRatio = naturalWidth / naturalHeight;

    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment) => {
        const dimensions = loadedImages[attachment.id] 
          ? getImageDimensions(loadedImages[attachment.id].width, loadedImages[attachment.id].height)
          : { width: 200, height: 200 }; // Default size while loading

        return (
          <div 
            key={attachment.id}
            className="relative rounded-lg overflow-hidden bg-neutral-primary"
            style={{
              width: dimensions.width,
              height: dimensions.height
            }}
          >
            <Image
              src={attachment.url}
              alt="Message attachment"
              fill
              className="object-contain"
              onLoadingComplete={(img) => {
                handleImageLoad(attachment.id, img.naturalWidth, img.naturalHeight);
              }}
              sizes={`(max-width: 400px) 100vw, 400px`}
            />
          </div>
        );
      })}
    </div>
  );
} 