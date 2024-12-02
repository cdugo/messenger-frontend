'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Server, ServerWithUsers } from '../types/server';
import { apiClient } from '../api/apiClient';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';
import { websocket } from '@/lib/websocket';

interface CreateServerParams {
  name: string;
  description?: string;
}

interface ServerContextType {
  currentServer: ServerWithUsers | null;
  setCurrentServer: (server: Server | ServerWithUsers | null) => void;
  createServer: (params: CreateServerParams) => Promise<Server>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [currentServer, setCurrentServer] = useState<ServerWithUsers | null>(null);
  const { handleError } = useErrorHandler();

  const handleSetCurrentServer = useCallback(async (server: Server | ServerWithUsers | null) => {
    try {
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
    } catch (err) {
      handleError(err);
      // Don't throw here as this is a state update function
      setCurrentServer(null);
    }
  }, [currentServer, handleError]);

  const createServer = async ({ name, description }: CreateServerParams): Promise<Server> => {
    try {
      const server = await apiClient.createServer({ name, description });
      toast.success('Server created successfully!');
      return server;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentServer?.id) {
        websocket.unsubscribeFromServer(currentServer.id);
      }
    };
  }, [currentServer]);

  return (
    <ServerContext.Provider value={{ 
      currentServer, 
      setCurrentServer: handleSetCurrentServer,
      createServer 
    }}>
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