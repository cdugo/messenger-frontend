'use client';

import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { cn } from "@/lib/utils";
import { apiClient } from "../api/apiClient";
import { Server } from "../types/server";
import { useServer } from '../contexts/ServerContext';

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

export function ChatSidebar() {
  const { user } = useUser();
  const [servers, setServers] = useState<Server[]>([]);
  const { setCurrentServer } = useServer();

  useEffect(() => {
    if (user) {
      apiClient.getMe().then((data) => { 
        setServers(data.servers);
      });
    }
  }, [user]);

  const handleServerClick = (server: Server) => {
    setCurrentServer(server);
  };

  if (!user) return null;

  return (
    <div className="w-1/5 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="font-semibold">Servers</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {servers.length > 0 ? (
            servers.map((server) => (
              <div 
                key={server.id} 
                onClick={() => handleServerClick(server)}
                className="px-3 py-4 border-b hover:bg-gray-900 cursor-pointer "
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-base">{server.name}</p>
                  <span className="text-xs text-gray-400">
                    {formatMessageTime(server.latest_message.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">
                    {server.latest_message.user.username}:
                  </span>
                  <span className="text-sm text-gray-300 truncate">
                    {server.latest_message.content}
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

        <div className="border-t p-4">
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