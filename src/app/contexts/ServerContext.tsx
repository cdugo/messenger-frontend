'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Server, ServerWithUsers } from '../types/server';
import { apiClient } from '../api/apiClient';
import { websocket } from '@/lib/websocket';

interface ServerContextType {
  currentServer: ServerWithUsers | null;
  setCurrentServer: (server: Server | ServerWithUsers | null) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [currentServer, setCurrentServer] = useState<ServerWithUsers | null>(null);

  const handleSetCurrentServer = useCallback(async (server: Server | ServerWithUsers | null) => {
    // Unsubscribe from current server before switching
    if (currentServer?.id) {
      websocket.unsubscribeFromServer(currentServer.id);
    }

    // If null or undefined, just clear the current server
    if (!server) {
      setCurrentServer(null);
      return;
    }

    // If it's already a ServerWithUsers, use it directly
    if ('users' in server) {
      setCurrentServer(prev => 
        prev?.id === server.id ? prev : server
      );
      return;
    }

    // Only fetch server details if we don't have the users data
    try {
      // Set the basic server data immediately to prevent flash
      setCurrentServer(prev => 
        prev?.id === server.id ? prev : { ...server, users: prev?.users || [] }
      );

      // Then fetch the full server data
      const serverWithUsers = await apiClient.getServer(server.id);
      if (serverWithUsers) {
        setCurrentServer(prev => 
          prev?.id === serverWithUsers.id ? serverWithUsers : prev
        );
      }
    } catch (error) {
      console.error('Failed to fetch server details:', error);
    }
  }, [currentServer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentServer?.id) {
        websocket.unsubscribeFromServer(currentServer.id);
      }
    };
  }, [currentServer]);

  return (
    <ServerContext.Provider value={{ currentServer, setCurrentServer: handleSetCurrentServer }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
} 