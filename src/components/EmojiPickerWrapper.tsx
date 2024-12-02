'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';

// Lazy load with smaller loading placeholder
const Picker = dynamic(
  () => import('@emoji-mart/react').then(mod => mod.default),
  {
    loading: () => <div className="w-[352px] h-[435px] bg-neutral rounded-lg animate-pulse" />,
    ssr: false
  }
);

interface EmojiPickerWrapperProps {
  position: { top: number; left: number };
  onEmojiSelect: (emoji: string) => void;
  onClickOutside: () => void;
}

export function EmojiPickerWrapper({ position, onEmojiSelect, onClickOutside }: EmojiPickerWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Handle click outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.emoji-picker-wrapper')) {
        onClickOutside();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  if (!mounted) return null;

  return (
    <div 
      className="fixed z-[1000] emoji-picker-wrapper"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Picker
        data={data}
        theme="dark"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEmojiSelect={(emoji: any) => {
          onEmojiSelect(emoji.unified.toLowerCase());
        }}
        previewPosition="none"
        searchPosition="none"
        skinTonePosition="none"
        navPosition="none"
        perLine={9}
        emojiButtonSize={30}
        emojiSize={20}
        maxFrequentRows={0}
      />
    </div>
  );
} 