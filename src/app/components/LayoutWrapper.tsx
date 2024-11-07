'use client';

import { useUser } from "../contexts/UserContext";
import { ChatSidebar } from "./ChatSidebar";
import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const pathname = usePathname();
  
  // List of paths where we don't want the sidebar
  const noSidebarPaths = ['/login', '/signup'];
  const shouldShowSidebar = !noSidebarPaths.includes(pathname) && user;

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar && <ChatSidebar />}
      <main className={`flex-1 ${shouldShowSidebar ? 'pl-60' : ''}`}>
        {children}
      </main>
    </div>
  );
} 