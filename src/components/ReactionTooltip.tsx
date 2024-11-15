import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef } from "react";
import { ReactionDetailsModal } from "./ReactionDetailsModal";
import { Reaction } from "@/app/types/server";

interface ReactionTooltipProps {
  usernames: string[];
  emoji: string;
  count: number;
  hasReacted: boolean;
  onReactionClick: () => void;
  isCurrentUserAuthor?: boolean;
  allMessageReactions: Reaction[];
}

export function ReactionTooltip({ 
  usernames, 
  emoji, 
  count, 
  hasReacted, 
  onReactionClick,
  isCurrentUserAuthor,
  allMessageReactions 
}: ReactionTooltipProps) {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);

  const handleMouseDown = () => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowModal(true);
      setShowTooltip(false);
    }, 500); // 500ms for long press
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimer.current);
    if (!isLongPress.current) {
      onReactionClick();
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(pressTimer.current);
    setShowTooltip(false);
  };

  const displayCount = 3;
  const remainingCount = usernames.length - displayCount;
  const displayedUsers = usernames.slice(0, displayCount);

  const tooltipText = `${displayedUsers.join(', ')}${remainingCount > 0 ? 
    ` and ${remainingCount} others` : 
    ''} reacted with ${String.fromCodePoint(parseInt(emoji, 16))}`;

  // Group all reactions by emoji
  const groupedReactions = allMessageReactions.reduce((acc, reaction) => {
    const existing = acc.get(reaction.emoji) || { 
      emoji: reaction.emoji, 
      usernames: [] 
    };
    existing.usernames.push(reaction.user.username);
    acc.set(reaction.emoji, existing);
    return acc;
  }, new Map<string, { emoji: string; usernames: string[] }>());

  return (
    <>
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={() => setShowTooltip(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm leading-[20px]
                ${hasReacted ? 
                  'bg-[#5651bf] text-white border-[2px] border-white/45' : 
                  ` text-gray-300  ${isCurrentUserAuthor ? 'bg-[#5651bf] hover:bg-[#6861e6]' : 'bg-neutral-800 hover:bg-neutral-700'}`
                }`}
            >
              <span>{String.fromCodePoint(parseInt(emoji, 16))}</span>
              <span>{count}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="px-[12px] py-[8px] pl-[8px] bg-[#191919] text-sm text-gray-300
              rounded-t-[12px] rounded-br-[12px] rounded-bl-[12px]
              border-t border-[#FFFFFF2B]
              shadow-[0px_2px_3px_-2px_#0000001B,0px_3px_8px_-2px_#00000044,0px_4px_12px_-4px_#00000072]"
            sideOffset={5}
          >
            <div className="flex items-center gap-[8px]">
              {tooltipText}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ReactionDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reactions={groupedReactions}
      />
    </>
  );
} 