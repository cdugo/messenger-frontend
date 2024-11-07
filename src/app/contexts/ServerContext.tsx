'use client';

import React, { createContext, useContext, useState } from 'react';
import { Server } from '../types/server';

interface ServerContextType {
  currentServer: Server | null;
  setCurrentServer: (server: Server | null) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  return (
    <ServerContext.Provider value={{ currentServer, setCurrentServer }}>
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