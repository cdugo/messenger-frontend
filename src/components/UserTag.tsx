import { Avatar, Tooltip, TooltipProvider } from "@medusajs/ui";

interface UserTagProps {
    username: string;
    isCurrentUser: boolean;
}

export function UserTag({ username, isCurrentUser }: UserTagProps) {
    const tooltipContent = (
        <div className="flex items-center gap-3">
            <Avatar 
                fallback={username[0].toUpperCase()}
                className="w-8 h-8 rounded-full bg-neutral-primary text-text-primary"
            />
            <span className="text-text-primary text-sm">
                {username}
            </span>
        </div>
    );

    // If it's @everyone, just return the span without the tooltip
    if (username === 'everyone') {
        return (
            <span 
                className={`inline-flex items-center px-1 py-[1px] rounded-[6px] 
                    ${isCurrentUser ? 
                        'bg-neutral-hover text-text-primary' : 
                        'bg-accent-bg text-accent-light'
                    }`}
            >
                @everyone
            </span>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip 
                content={tooltipContent}
                className="bg-neutral-secondary border border-neutral-border rounded-lg p-3"
            >
                <span 
                    className={`inline-flex items-center px-1 py-[1px] rounded-[6px] 
                        ${isCurrentUser ? 
                            'bg-neutral-hover text-text-primary' : 
                            'bg-accent-bg text-accent-light'
                        }`}
                >
                    @{username}
                </span>
            </Tooltip>
        </TooltipProvider>
    );
} 