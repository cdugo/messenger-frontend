'use client';

import { useUser } from "../contexts/UserContext";
import { ChatSidebar } from "./ChatSidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 