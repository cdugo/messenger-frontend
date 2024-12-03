export function ChatSidebarSkeleton() {
  return (
    <div className="w-1/5 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <div className="h-5 w-20 bg-neutral-800 rounded animate-pulse" />
          <div className="h-5 w-5 bg-neutral-800 rounded animate-pulse" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b">
              <div className="flex justify-between items-start mb-1">
                <div className="h-5 w-32 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-12 bg-neutral-800 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-40 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
              <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 