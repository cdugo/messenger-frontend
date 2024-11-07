'use client';

import { useServer } from '../contexts/ServerContext';
import { Avatar } from "@medusajs/ui";
import { Message, ServerWithMessages } from '@/app/types/server';
import { useState } from 'react';
import { useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
interface ChatBubbleProps {
  author: {
    username: string;
  };
  message: Message;
  isCurrentUser: boolean;
}

function ChatBubble({ author, message, isCurrentUser }: ChatBubbleProps) {
    return (
        <div className={`flex flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isCurrentUser && (
                <Avatar 
                    fallback={author.username[0].toUpperCase()}
                    className="w-10 h-10 rounded-full bg-gray-700 text-white self-end mr-2"
                />
            )}
            <div className="flex flex-col relative">
                <span className={`ml-4 text-xs text-left text-[#7B7B7B] mb-1 ${isCurrentUser ? 'hidden' : ''}`}>
                    {author.username}
                </span>
                <div className={`relative flex flex-col min-w-fit max-w-[70%] pl-3 pr-3 py-[6px] 
                    ${isCurrentUser ? 'bg-accent' : 'bg-neutral'}
                    rounded-3xl transition-colors z-[1]`}
                >
                    <p className="text-[#EEEEEE] text-base font-normal leading-relaxed">
                        {message.content}
                    </p>
                </div>
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
            </div>
        </div>
    );
}

export default function HomePage() {
  const { currentServer } = useServer();
  const { user } = useUser();
  const [server, setServer] = useState<ServerWithMessages | null>(null);    
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentServer) return;
    setIsLoading(true);
    apiClient.getServer(currentServer.id)
    .then((server) => {
      setServer(server);
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
    });
  }, [currentServer]);



  if (!currentServer) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <p className="text-lg">Open a chat to start a conversation</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Group messages by user_id and consecutive messages
  const groupMessages = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    let currentUserId = -1;

    // Sort messages by creation date
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedMessages.forEach((message) => {
      if (message.user_id !== currentUserId && currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
      currentGroup.push(message);
      currentUserId = message.user_id;
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = groupMessages(server?.messages || []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">{currentServer.name}</h1>
        
        {messageGroups.length > 0 ? (
          <div className="space-y-6">
            {messageGroups.map((message) => {
              return (
                  <ChatBubble
                    key={message[0].id}
                  author={message[0].user}
                  message={message[0]}
                  isCurrentUser={message[0].user_id.toString() === user?.id.toString()}
                  />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}