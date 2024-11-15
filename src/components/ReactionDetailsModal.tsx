import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@medusajs/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: Map<string, { emoji: string; usernames: string[] }>;
}

export function ReactionDetailsModal({ 
  isOpen, 
  onClose, 
  reactions 
}: ReactionDetailsModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(
    Array.from(reactions.values())[0]?.emoji || ''
  );

  const reactionsList = Array.from(reactions.values());
  const selectedReaction = reactions.get(selectedEmoji);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="[&>button]:hidden max-w-[361px] p-0 bg-[#191919] border-t border-[#FFFFFF1B] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-2xl
        shadow-[0px_8px_40px_0px_#0000002B,0px_12px_32px_-16px_#00000044]">
        <DialogTitle className="sr-only">
          Reaction Details
        </DialogTitle>
        <div className="flex gap-2 p-6">
          {/* Left column - Emoji list */}
          <div className="flex flex-col gap-2 mr-[15px]">
            {reactionsList.map(({ emoji, usernames }) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  "flex items-center gap-2 w-[72px] h-[36px] px-4 py-2 rounded-lg transition-colors",
                  selectedEmoji === emoji ? "bg-[#2A2A2A]" : "hover:bg-[#2A2A2A]/50"
                )}
              >
                <span className="text-xl">
                  {String.fromCodePoint(parseInt(emoji, 16))}
                </span>
                <span className="text-sm text-gray-300">
                  {usernames.length}
                </span>
              </button>
            ))}
          </div>

          {/* Right column - Users list */}
          <div className="flex-1 max-h-[272px] overflow-y-auto pr-[72px]">
            {selectedReaction?.usernames.map((username) => (
              <div 
                key={username} 
                className="flex items-center gap-3 mb-4 last:mb-0"
              >
                <Avatar
                  fallback={username[0].toUpperCase()}
                  className="w-8 h-8 rounded-full bg-gray-700 text-white"
                />
                <span className="text-white text-sm">{username}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}