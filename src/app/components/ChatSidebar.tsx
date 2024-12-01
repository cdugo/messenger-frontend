'use client';

import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { apiClient } from "../api/apiClient";
import { Server } from "../types/server";
import { useServer } from '../contexts/ServerContext';
import { websocket } from '@/lib/websocket';
import { WebSocketNotification } from '../types/server';
import { ServerDialog } from '@/components/ServerDialog';

// Helper function to format timestamp
function formatMessageTime(date: string) {
  const messageDate = new Date(date);
  const now = new Date();
  
  // Check if message is from today
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // For messages from other days
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatMessageContent(content: string) {
  if (!content) return "";
  const mentionRegex = /@\[(\w+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const username = match[1];
    parts.push(`@${username}`);  // Keep the @ symbol with the username

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.join('');
}

export function ChatSidebar() {
  const { user } = useUser();
  const [servers, setServers] = useState<Server[]>([]);
  const { setCurrentServer, currentServer } = useServer();

  useEffect(() => {
    if (user) {
      apiClient.getMe().then((data) => { 
        setServers(data.servers);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Subscribe to notifications
      websocket.subscribeToNotifications((notification: WebSocketNotification) => {
        if (notification.type === 'new_message') {
          setServers(prevServers => {
            return prevServers.map(server => {
              if (Number(server.id) === notification.server_id) {
                const isCurrentServer = currentServer?.id === server.id;
                return {
                  ...server,
                  latest_message: {
                    id: notification.data.message_id,
                    content: notification.data.preview,
                    created_at: notification.timestamp,
                    updated_at: notification.timestamp,
                    user_id: notification.data.sender.id,
                    server_id: notification.server_id,
                    parent_message_id: null,
                    user: {
                      username: notification.data.sender.username
                    },
                    reactions: [],
                    attachment_urls: notification.data.attachment_urls
                  },
                  read_state: {
                    ...server.read_state,
                    unread_count: isCurrentServer ? 0 : server.read_state.unread_count + 1
                  }
                };
              }
              return server;
            });
          });
        }
      });

      return () => {
        websocket.unsubscribeFromNotifications();
      };
    }
  }, [user, currentServer]);

  const handleServerClick = (server: Server) => {
    setCurrentServer(server);
    setServers(prevServers => 
      prevServers.map(s => 
        s.id === server.id 
          ? {
              ...s,
              read_state: {
                ...s.read_state,
                unread_count: 0
              }
            }
          : s
      )
    );
  };

  if (!user) return null;

  return (
    <div className="w-1/5 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <h2 className="font-semibold">Servers</h2>
          <ServerDialog 
            onServerCreated={(server) => {
              setServers(prev => [...prev, server]);
            }}
            onServerJoined={(server) => {
              setServers(prev => [...prev, server]);
            }}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {servers.length > 0 ? (
            servers.map((server) => (
              <div 
                key={server.id} 
                onClick={() => handleServerClick(server)}
                className="px-4 py-4 border-b hover:bg-gray-900 cursor-pointer relative"
              >
                {server.read_state.unread_count > 0 && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {server.read_state.unread_count > 99 ? '99+' : server.read_state.unread_count}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-1 pl-6">
                  <p className={`font-medium text-base ${
                    server.read_state.unread_count > 0 
                      ? 'font-bold text-white' 
                      : 'text-gray-300'
                  }`}>
                    {server.name}
                  </p>
                  <span className="text-xs text-gray-400">
                    { server.latest_message ? formatMessageTime(server.latest_message?.created_at) : ""}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 pl-6">
                  <span className={`text-sm ${
                    server.read_state.unread_count > 0 
                      ? 'font-semibold text-white' 
                      : 'text-gray-400'
                  }`}>
                    {server.latest_message?.user?.username && `${server.latest_message.user.username}:`}
                  </span>
                  <span className={`text-sm truncate ${
                    server.read_state.unread_count > 0 
                      ? 'font-semibold text-white' 
                      : 'text-gray-300'
                  }`}>
                    {formatMessageContent(server.latest_message?.content) || ( server.latest_message ? "" : "No messages")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2">
              <p className="text-sm text-gray-400">No servers yet</p>
            </div>
          )}
        </div>

        <div className="border-t p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}