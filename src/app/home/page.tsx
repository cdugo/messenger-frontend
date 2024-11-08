'use client';

import { useServer } from '../contexts/ServerContext';
import { Avatar } from "@medusajs/ui";
import { Message } from '@/app/types/server';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
import { TextBox } from '@/components/TextBox';
import { websocket } from '@/lib/websocket';
interface ChatBubbleGroupProps {
  messages: Message[];
  isCurrentUser: boolean;
}

function ChatBubbleGroup({ messages, isCurrentUser }: ChatBubbleGroupProps) {
  return (
    <div className={`flex flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <Avatar 
          fallback={messages[0].user.username[0].toUpperCase()}
          className="w-10 h-10 rounded-full bg-gray-700 text-white self-end mr-2"
        />
      )}
      <div className="flex flex-col relative">
        <span className={`ml-4 text-xs text-left text-[#7B7B7B] mb-1 ${isCurrentUser ? 'hidden' : ''}`}>
          {messages[0].user.username}
        </span>
        <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {messages.map((message, index) => (
            <div key={message.id} className="flex flex-col relative">
              <div className={`relative flex flex-col min-w-fit max-w-[70%] pl-4 pr-4 py-[6px] 
                ${isCurrentUser ? 'bg-accent' : 'bg-neutral'}
                rounded-[20px] transition-colors z-[1]`}
              >
                <p className="text-[#EEEEEE] text-base font-normal leading-relaxed">
                  {message.content}
                </p>
              </div>
              {index === messages.length - 1 && (
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
              )}
            </div>
          ))}
        </div>
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
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!currentServer) return;
    
    setIsLoading(true);
    let isSubscribed = true;

    const setupServer = async () => {
      try {
        const serverData = await apiClient.getServer(currentServer.id);
        if (!serverData || !isSubscribed) return;
        
        setMessages(serverData.messages);
        websocket.subscribeToServer(serverData.id, handleWebSocketMessage);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching server:', error);
        setIsLoading(false);
      }
    };

    setupServer();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (currentServer) {
        websocket.unsubscribeFromServer(currentServer.id);
      }
    };
  }, [currentServer]);

  const handleWebSocketMessage = (data: {
    type: 'message' | 'message_deleted' | 'error';
    id?: number;
    content?: string;
    user_id?: number;
    message_id?: number;
    created_at?: string;
    updated_at?: string;
    user?: { id: number; username: string };
    message?: string;
  }) => {
    console.log('Handling WebSocket message:', data);
        

    switch (data.type) {
      case 'message':
        // Check if we already have this message
        if (data.id && !messages.some(m => m.id === data.id)) {
          const newMessage: Message = {
              id: data.id,
              content: data.content || '',
              user_id: data.user_id || 0,
              created_at: data.created_at || new Date().toISOString(),
              parent_message_id: null,
              user: { username: data.user?.username || '' },
              server_id: Number(currentServer?.id),
              updated_at: data.updated_at || new Date().toISOString()
          }
          console.log('Adding new message:', newMessage);
          setMessages(prev => {
            if (!prev) return prev;
            const updatedMessages = [...prev, newMessage];
            console.log('Updated messages:', updatedMessages);
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    if (!currentServer) return;

    websocket.sendMessage(currentServer.id, newMessage)
    setNewMessage("")
  }



  if (!currentServer) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <div className="flex flex-col items-center h-fit w-72 bg-neutral rounded-3xl px-4 py-12 text-center">
            <p className="text-lg text-white">Open a chat to start a conversation.</p>
            <p className="text-7xl mt-8 [text-shadow:_0_0_50px_rgba(255,255,255,0.5)]">💬</p>
        </div>
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

  const messageGroups = groupMessages(messages || []);
  console.log('Message groups:', messageGroups);

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
                isCurrentUser={messageGroup[0].user_id.toString() === user?.id.toString()}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 w-72">
            <p className="text-lg text-white">No messages here yet.</p>
            <p className="text-sm text-gray-400">Send a message to start a conversation!</p>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 w-full pb-4 px-4">
        <TextBox 
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  );
}