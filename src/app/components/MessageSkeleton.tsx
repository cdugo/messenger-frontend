export function MessageSkeleton() {
  return (
    <div className="space-y-4 px-4 mt-12">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-800" />
          
          <div className="flex-1 space-y-2">
            {/* Username and timestamp */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-neutral-800 rounded" />
              <div className="h-3 w-16 bg-neutral-800 rounded" />
            </div>
            
            {/* Message content */}
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-neutral-800 rounded" />
              <div className="h-4 w-1/2 bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 