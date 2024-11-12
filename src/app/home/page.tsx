'use client';

import { useServer } from '../contexts/ServerContext';
import { Avatar, Popover } from "@medusajs/ui";
import { Message } from '@/app/types/server';
import { useRef, useState, useCallback } from 'react';
import { useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
import { ReplyTo, TextBox } from '@/components/TextBox';
import { websocket } from '@/lib/websocket';
import { ReplyIcon } from '@/components/icons/ReplyIcon';
import { User } from '../types/user';
import { UserTag } from '@/components/UserTag';

interface ChatBubbleGroupProps {
  messages: Message[];
  getParentMessage: (messageId: number | null) => Message | null;
  isCurrentUser: boolean;
  setReplyTo: (replyTo: ReplyTo) => void;
  users: User[];
}

function formatMessageContent(content: string, users: User[], isCurrentUser: boolean) {
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
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
      parts.push(match[0]); // Keep as plain text if user doesn't exist
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

// Component for displaying the parent message reference in a message bubble
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
        {parentMessage.content.length && parentMessage.content.length > 50 ? '...' : ''}
      </span>
    </div>
  );
}

// Component for the message bubble tail
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



function ChatBubbleGroup({ messages, getParentMessage, isCurrentUser, setReplyTo, users }: ChatBubbleGroupProps) {
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
                    </div>
                  </div>
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <ReplyIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  )}
                </div>
                {index === messages.length - 1 && <MessageTail isCurrentUser={isCurrentUser} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoMessages() {
  return (
    <div className="flex flex-col items-center justify-center h-72 w-72">
      <p className="text-lg text-white">No messages here yet.</p>
      <p className="text-sm text-gray-400">Send a message to start a conversation!</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      <p className="text-lg">Loading...</p>
    </div>
  );
}

function NoServerSelected() {
  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      <div className="flex flex-col items-center h-fit w-72 bg-neutral rounded-3xl px-4 py-12 text-center">
        <p className="text-lg text-white">Open a chat to start a conversation.</p>
        <p className="text-7xl mt-8 [text-shadow:_0_0_50px_rgba(255,255,255,0.5)]">💬</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { currentServer } = useServer();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);    
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleWebSocketMessage = (data: {
    type: 'message' | 'message_deleted' | 'error';
    id?: number;
    content?: string;
    user_id?: number;
    message_id?: number;
    created_at?: string;
    updated_at?: string;
    parent_message_id?: number | null;
    user?: { id: number; username: string };
    message?: string;
  }) => {        

    switch (data.type) {
      case 'message':
        // Check if we already have this message
        if (data.id && !messages.some(m => m.id === data.id)) {
          const newMessage: Message = {
              id: data.id,
              content: data.content || '',
              user_id: data.user_id || 0,
              created_at: data.created_at || new Date().toISOString(),
              parent_message_id: data.parent_message_id || null,
              user: { username: data.user?.username || '' },
              server_id: Number(currentServer?.id),
              updated_at: data.updated_at || new Date().toISOString()
          }
          setMessages(prev => {
            if (!prev) return prev;
            const updatedMessages = [...prev, newMessage];
            return updatedMessages;
          });
        }
        break;

      case 'message_deleted':
        if (data.message_id) {
          setMessages(prev => {
            if (!prev) return prev;
            return prev.filter(m => m.id !== data.message_id)
          });
        }
        break;

      case 'error':
        console.error('WebSocket error:', data.message);
        setError(data.message || 'An error occurred');
        break;

      default:
        console.warn('Unknown message type:', data);
    }
  }

  useEffect(() => {
    if (!currentServer) return;
    
    setIsLoading(true);
    let isSubscribed = true;

    const setupServer = async () => {
      try {
        const serverData = await apiClient.getServer(currentServer.id);
        if (!serverData || !isSubscribed) return;
        
        setMessages(serverData.messages);
        setUsers(serverData.users);
        websocket.subscribeToServer(serverData.id, handleWebSocketMessage);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching server:', error);
        setIsLoading(false);
      }
    };

    setupServer();

    return () => {
      isSubscribed = false;
      if (currentServer) {
        websocket.unsubscribeFromServer(currentServer.id);
      }
    };
  }, [currentServer]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentServer) return;

    websocket.sendMessage(currentServer.id, newMessage, replyTo?.id);
    setNewMessage("");
    setReplyTo(null);
  }

  const groupMessages = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    let currentUserId = -1;

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

  const getParentMessage = useCallback((messageId: number | null): Message | null => {
    if (!messageId) return null;
    // Create map inline to always have latest messages
    const currentMessageMap = messages.reduce((acc, message) => {
      acc.set(message.id, message);
      return acc;
    }, new Map<number, Message>());
    return currentMessageMap.get(messageId) || null;
  }, [messages]);

  if (!currentServer) return <NoServerSelected />;
  if (isLoading) return <LoadingState />;

  const messageGroups = groupMessages(messages || []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto p-4 pr-5">
        <h1 className="text-2xl font-bold mb-4 text-white">{currentServer.name}</h1>
        
        {messageGroups.length > 0 ? (
          <div className="space-y-6">
            {messageGroups.map((messageGroup) => (
              <ChatBubbleGroup
                key={messageGroup[0].id}
                messages={messageGroup}
                getParentMessage={getParentMessage}
                isCurrentUser={messageGroup[0].user_id.toString() === user?.id.toString()}
                setReplyTo={setReplyTo}
                users={users}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <NoMessages />
        )}
      </div>
      <div className="sticky bottom-0 w-full  bg-[#191919]">
        <TextBox 
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          users={users}
        />
      </div>
    </div>
  );
}