import { Avatar } from "@medusajs/ui";
import { Message } from '../types/server';
import { User } from '../types/user';
import { ReplyIcon } from '@/components/icons/ReplyIcon';
import EmojiIcon from '@/components/EmojiIcon';
import { EmojiPickerWrapper } from '@/components/EmojiPickerWrapper';
import { MessageReactions } from "@/components/MessageReactions";
import { ReplyTo } from '@/components/TextBox';
import { useState, useRef, useCallback } from 'react';
import { websocket } from '@/lib/websocket';
import { UserTag } from '@/components/UserTag';
import { MessageAttachments } from '@/components/MessageAttachments';

interface ChatBubbleGroupProps {
  messages: Message[];
  getParentMessage: (messageId: number | null) => Message | null;
  isCurrentUser: boolean;
  setReplyTo: (replyTo: ReplyTo) => void;
  users: User[];
  server_id: number;
  username: string;
}

function formatMessageContent(content: string, users: User[], isCurrentUser: boolean) {
  const mentionRegex = /@\[(\w+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const username = match[1];
    const isValidUser = users.some(user => user.username === username) || username === 'everyone';
    
    if (isValidUser) {
      parts.push(
        <UserTag 
          key={`${match.index}-${username}`} 
          username={username} 
          isCurrentUser={isCurrentUser} 
        />
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

function ParentMessageReference({ parentMessage, isCurrentUser }: { parentMessage: Message, isCurrentUser: boolean }) {
  const scrollToParentMessage = () => {
    const element = document.getElementById(`message-${parentMessage.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div 
      className={`text-xs flex px-3 py-2 flex-col text-gray-300 mb-1 cursor-pointer hover:text-gray-300 
        ${isCurrentUser ? 
          'bg-[#5651bf] hover:bg-[#6861e6]' : 
          'bg-[#2A2A2A] hover:bg-[#3A3A3A]'
        } 
        border-l pl-2 border-gray-300 rounded-r-md`}
      onClick={scrollToParentMessage}
    >
      {parentMessage.user.username}
      <span className="">
        {parentMessage.content.slice(0, 50)}
        {parentMessage.content.length > 50 ? '...' : ''}
      </span>
    </div>
  );
}

function MessageTail({ isCurrentUser }: { isCurrentUser: boolean }) {
  return (
    <svg 
      width="25" 
      height="25" 
      viewBox="0 0 14 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute bottom-[0px] z-0 ${isCurrentUser ? 
        'right-[-4px]' : 
        'left-[-4px] scale-x-[-1]'}`}
    >
      <path 
        d="M4.34483 11.5C7.09993 13.4023 10.8741 13.9476 13.5903 13.9963C13.695 13.9982 13.7369 13.846 13.6501 13.7874C12.8374 13.2382 11.305 11.8923 9.65517 9.5C7.72414 6.7 7.24138 2 7.24138 0L0 7.5C0.321839 8 1.44828 9.5 4.34483 11.5Z" 
        fill={isCurrentUser ? "#615BD6" : "#222222"}
      />
    </svg>
  );
}

export function ChatBubbleGroup({ 
  messages, 
  getParentMessage, 
  isCurrentUser, 
  setReplyTo, 
  users, 
  server_id, 
  username 
}: ChatBubbleGroupProps) {
  const [openEmojiPicker, setOpenEmojiPicker] = useState<number | null>(null);
  const emojiButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  
  const calculatePickerPosition = useCallback((messageId: number) => {
    const buttonElement = emojiButtonRefs.current.get(messageId);
    if (!buttonElement) return { top: 0, left: 0 };
    
    const rect = buttonElement.getBoundingClientRect();
    const pickerHeight = 435;
    const pickerWidth = 352;
    const padding = 10;
    const headerHeight = 64;
    const textboxHeight = 100;
    const availableHeight = window.innerHeight - textboxHeight;
    
    let left = rect.right + padding;
    if (left + pickerWidth > window.innerWidth) {
      left = rect.left - pickerWidth - padding;
    }
    
    const isInBottomHalf = rect.top > availableHeight / 2;
    
    let top;
    if (isInBottomHalf) {
      top = rect.top - pickerHeight - padding;
      if (top < headerHeight) {
        top = rect.bottom + padding;
        if (top + pickerHeight > availableHeight) {
          top = availableHeight - pickerHeight - padding;
        }
      }
    } else {
      top = rect.bottom + padding;
      if (top + pickerHeight > availableHeight) {
        top = rect.top - pickerHeight - padding;
        if (top < headerHeight) {
          top = headerHeight + padding;
        }
      }
    }
    
    return { top, left };
  }, []);

  const handleEmojiButtonClick = useCallback((messageId: number) => {
    if (openEmojiPicker === messageId) {
      setOpenEmojiPicker(null);
    } else {
      const newPosition = calculatePickerPosition(messageId);
      setPickerPosition(newPosition);
      setOpenEmojiPicker(messageId);
    }
  }, [openEmojiPicker, calculatePickerPosition]);

  const handleReactionClick = useCallback((messageId: number, emoji: string, currentUsername: string) => {
    const message = messages.find(m => m.id === messageId);
    const hasReacted = message?.reactions.some(
      r => r.emoji === emoji && r.user.username === currentUsername
    );

    if (hasReacted) {
      websocket.deleteReaction(server_id.toString(), messageId, emoji);
    } else {
      websocket.sendReaction(server_id.toString(), messageId, emoji);
    }
  }, [server_id, messages]);

  return (
    <div className={`flex flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full relative z-0`}>
      {!isCurrentUser && (
        <Avatar 
          fallback={messages[0].user.username[0].toUpperCase()}
          className="w-10 h-10 rounded-full bg-gray-700 text-white self-end mr-2"
        />
      )}
      <div className="flex flex-col relative max-w-[30%]">
        <span className={`ml-4 text-xs text-left text-[#7B7B7B] mb-1 ${isCurrentUser ? 'hidden' : ''}`}>
          {messages[0].user.username}
        </span>
        <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'} w-full`}>
          {messages.map((message, index) => {
            const parentMessage = getParentMessage(message.parent_message_id);
            
            return (
              <div key={message.id} className="flex flex-col relative group w-full">
                <div className="flex items-center gap-2 w-full">
                  <div 
                    id={`message-${message.id}`}
                    className={`relative flex flex-col min-w-fit w-fit max-w-full pl-4 pr-4 py-[6px] 
                      ${isCurrentUser ? 'bg-accent ml-auto' : 'bg-neutral'}
                      rounded-[20px] transition-colors z-[1] overflow-hidden`}
                  >
                    <div className="text-[#EEEEEE] text-base font-normal leading-relaxed break-all whitespace-pre-wrap">
                      {parentMessage && (
                        <ParentMessageReference 
                          parentMessage={parentMessage} 
                          isCurrentUser={isCurrentUser}
                        />
                      )}
                      {formatMessageContent(message.content, users, isCurrentUser)}
                      
                      {message.attachment_urls && message.attachment_urls.length > 0 && (
                        <div className="mt-2">
                          <MessageAttachments attachments={message.attachment_urls} />
                        </div>
                      )}
                    </div>
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <MessageReactions
                        reactions={message.reactions}
                        currentUsername={username}
                        onReactionClick={(emoji) => handleReactionClick(message.id, emoji, username)}
                        isCurrentUserAuthor={isCurrentUser}
                      />
                    )}
                  </div>
                  <div className={`flex flex-row items-center gap-2 ${openEmojiPicker === message.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {!isCurrentUser && (
                      <button
                        ref={(button) => {
                          if (button) {
                            button.onclick = () => {
                              const textarea = document.querySelector('textarea');
                              if (textarea) textarea.focus();
                            }
                          }
                        }}
                        onClick={() => setReplyTo({
                          id: message.id,
                          content: message.content,
                          username: message.user.username
                        })}
                        className="flex-shrink-0"
                      >
                        <ReplyIcon />
                      </button>
                    )}
                    {!isCurrentUser && (
                      <button
                        ref={(el) => {
                          if (el) {
                            emojiButtonRefs.current.set(message.id, el);
                          }
                        }}
                        onClick={() => handleEmojiButtonClick(message.id)}
                        className="flex-shrink-0"
                      >
                        <EmojiIcon />
                      </button>
                    )}
                  </div>
                </div>
                {openEmojiPicker === message.id && (
                  <EmojiPickerWrapper
                    position={pickerPosition}
                    onEmojiSelect={(emoji) => {
                      handleReactionClick(message.id, emoji, username);
                      setOpenEmojiPicker(null);
                    }}
                    onClickOutside={() => setOpenEmojiPicker(null)}
                  />
                )}
                {index === messages.length - 1 && <MessageTail isCurrentUser={isCurrentUser} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 