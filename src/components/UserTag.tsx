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
                className="w-8 h-8 rounded-full bg-gray-700 text-white"
            />
            <span className="text-white text-sm">
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
                        'bg-white/[0.17] text-white' : 
                        'bg-[#5D55FE3B] text-[#A39EFF]'
                    }`}
            >
                @{username}
            </span>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip 
                content={tooltipContent}
                className="bg-[#191919] border border-white/[0.13] rounded-lg p-3"
            >
                <span 
                    className={`inline-flex items-center px-1 py-[1px] rounded-[6px] 
                        ${isCurrentUser ? 
                            'bg-white/[0.17] text-white' : 
                            'bg-[#5D55FE3B] text-[#A39EFF]'
                        }`}
                >
                    @{username}
                </span>
            </Tooltip>
        </TooltipProvider>
    );
} 