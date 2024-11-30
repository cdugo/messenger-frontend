import { Reaction } from "@/app/types/server";
import { ReactionTooltip } from "./ReactionTooltip";

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUsername: string;
  onReactionClick: (emoji: string) => void;
  isCurrentUserAuthor?: boolean;
}

export function MessageReactions({ reactions, currentUsername, onReactionClick, isCurrentUserAuthor }: MessageReactionsProps) {
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!reaction.emoji) {
      return acc;
    }
    
    const existing = acc.get(reaction.emoji) || { 
      emoji: reaction.emoji, 
      count: 0, 
      usernames: [], 
      hasReacted: false 
    };
    
    // Only count valid reactions
    if (reaction.user && reaction.user.username) {
      existing.count++;
      existing.usernames.push(reaction.user.username);
      if (reaction.user.username === currentUsername) {
        existing.hasReacted = true;
      }
    }
    
    acc.set(reaction.emoji, existing);
    return acc;
  }, new Map<string, { emoji: string; count: number; usernames: string[]; hasReacted: boolean }>());

  const activeReactions = Array.from(groupedReactions.values()).filter(
    reaction => reaction.count > 0
  );

  if (activeReactions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {activeReactions.map(({ emoji, count, hasReacted, usernames }) => (
        <ReactionTooltip
          key={emoji}
          emoji={emoji}
          count={count}
          hasReacted={hasReacted}
          usernames={usernames}
          onReactionClick={() => onReactionClick(emoji)}
          isCurrentUserAuthor={isCurrentUserAuthor}
          allMessageReactions={reactions}
        />
      ))}
    </div>
  );
} 