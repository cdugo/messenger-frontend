'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Server, ServerWithUsers } from '../types/server';
import { apiClient } from '../api/apiClient';

interface ServerContextType {
  currentServer: ServerWithUsers | null;
  setCurrentServer: (server: Server | ServerWithUsers | null) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [currentServer, setCurrentServer] = useState<ServerWithUsers | null>(null);

  const handleSetCurrentServer = useCallback(async (server: Server | ServerWithUsers | null) => {
    // If null or undefined, just clear the current server
    if (!server) {
      setCurrentServer(null);
      return;
    }

    // If it's already a ServerWithUsers, use it directly
    if ('users' in server) {
      // Prevent unnecessary re-renders if the server is the same
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
  }, []);

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