'use client';

import Image from 'next/image';
import { AttachmentUrl } from '@/app/types/server';
import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MessageAttachmentsProps {
  attachments: AttachmentUrl[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, { width: number; height: number }>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  const handleImageLoad = (id: number, naturalWidth: number, naturalHeight: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: {
        width: naturalWidth,
        height: naturalHeight
      }
    }));
    setLoadingStates(prev => ({
      ...prev,
      [id]: false
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
        const isLoading = loadingStates[attachment.id] !== false;
        const dimensions = loadedImages[attachment.id] 
          ? getImageDimensions(loadedImages[attachment.id].width, loadedImages[attachment.id].height)
          : { width: 400, height: 300 }; // Use max dimensions while loading

        return (
          <div 
            key={attachment.id}
            className="relative rounded-lg overflow-hidden bg-neutral-primary"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100%'
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-primary">
                <LoadingSpinner size="lg" className="text-gray-700" />
              </div>
            )}
            <Image
              src={attachment.url}
              alt="Message attachment"
              fill
              className={`object-contain transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadingComplete={(img) => {
                handleImageLoad(attachment.id, img.naturalWidth, img.naturalHeight);
              }}
              onLoad={(e) => {
                if (e.target instanceof HTMLImageElement) {
                  handleImageLoad(attachment.id, e.target.naturalWidth, e.target.naturalHeight);
                }
              }}
              sizes={`(max-width: 400px) 100vw, 400px`}
              priority={true}
            />
          </div>
        );
      })}
    </div>
  );
} 