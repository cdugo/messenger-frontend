'use client';

import { useUser } from "../contexts/UserContext";
import { ChatSidebar } from "./ChatSidebar";
import { ChatSidebarSkeleton } from "./ChatSidebarSkeleton";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (!user && !loading) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      {loading ? <ChatSidebarSkeleton /> : <ChatSidebar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 