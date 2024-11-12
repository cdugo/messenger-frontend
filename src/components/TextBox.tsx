import { useState, useRef, forwardRef } from "react";
import { DeleteIcon } from "./icons/DeleteIcon";
import { User } from "@/app/types/user";
import { Command } from "@medusajs/ui";
import { Avatar } from "@medusajs/ui";

interface TextBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    replyTo: ReplyTo | null;
    setReplyTo: (replyTo: ReplyTo | null) => void;
    users: User[];
}

export interface ReplyTo {
    id: number;
    content: string;
    username: string;
  }


  // Component for the reply preview
function ReplyPreview({ replyTo, onClose }: { replyTo: ReplyTo, onClose: () => void }) {
    return (
      <div className="border-l-2 border-[#A39EFF] rounded-r-lg px-2 w-full flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">
            <span className="text-[#A39EFF] font-medium text-sm">Reply to {replyTo.username}</span>
          </span>
          <span className="text-xs text-[#B4B4B4]">
            {replyTo.content.slice(0, 50)}
            {replyTo.content.length > 50 ? '...' : ''}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:opacity-70"
        >
          <DeleteIcon />
        </button>
      </div>
    );
  }
  
  
interface MentionsDropdownProps {
    users: User[];
    mentionInput: string;
    onSelect: (username: string) => void;
    selectedIndex: number;
    onKeyNavigation: (direction: 'up' | 'down') => void;
}

function MentionsDropdown({ users, mentionInput, onSelect, selectedIndex }: MentionsDropdownProps) {
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(mentionInput.toLowerCase())
    );

    const totalItems = filteredUsers.length + 1;
    const isEveryoneSelected = selectedIndex === filteredUsers.length;

    return (
        <div className="absolute bottom-full left-0 min-w-[358px] bg-[#191919] rounded-t-xl 
            border border-white/[0.13] backdrop-blur-[32px] shadow-[0px_6px_10px_0px_rgba(0,0,0,0.05)]
            z-[99999] overflow-hidden"
        >
            <Command className="border-none bg-transparent w-full">
                <div className="max-h-[454px] w-full overflow-y-auto
                    scrollbar-thin scrollbar-thumb-[#3A3A3A] hover:scrollbar-thumb-[#404040] scrollbar-track-transparent"
                >
                    <div className="px-3 py-2 text-sm text-[#7B7B7B]">Users</div>
                    {filteredUsers.map((user, index) => (
                        <div
                            key={user.id}
                            className={`px-3 py-2 cursor-pointer transition-colors w-full ${
                                index === selectedIndex ? 'bg-[#FFFFFF1B]' : 'hover:bg-[#FFFFFF1B]'
                            }`}
                            onClick={() => onSelect(user.username)}
                        >
                            <div className="flex items-center gap-2">
                                <Avatar 
                                    fallback={user.username[0].toUpperCase()}
                                    className="w-6 h-6 rounded-full bg-gray-700 text-white text-sm"
                                />
                                <span className="text-[#EEEEEE] text-sm">{user.username}</span>
                            </div>
                        </div>
                    ))}
                    <div className="px-3 py-2 text-sm text-[#7B7B7B] mt-2">Tag Everyone</div>
                    <div
                        className={`px-3 py-2 cursor-pointer transition-colors w-full ${
                            isEveryoneSelected ? 'bg-[#FFFFFF1B]' : 'hover:bg-[#FFFFFF1B]'
                        }`}
                        onClick={() => onSelect('everyone')}
                    >
                        <div className="flex items-center gap-2">
                            <Avatar 
                                fallback="@"
                                className="w-6 h-6 rounded-full bg-gray-700 text-white text-sm"
                            />
                            <span className="text-[#EEEEEE] text-sm">everyone</span>
                        </div>
                    </div>
                </div>
            </Command>
        </div>
    );
}

// Modify the StyledTextarea to use forwardRef
const StyledTextarea = forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & { users: User[] }
>(({ value, users, ...props }, ref) => {
    const textValue = String(value || '');
    
    // Helper function to check if a username exists
    const isValidUsername = (username: string): boolean => {
        return username.slice(1) === 'everyone' || users.some(user => user.username === username.slice(1));
    };
    
    return (
        <div className="relative w-full flex items-center min-h-[40px]">
            <div 
                aria-hidden="true"
                className="absolute inset-0 flex items-center pointer-events-none break-words whitespace-pre-wrap"
            >
                {textValue.split(/(?<=\s)|(?=\s)/).map((word: string, index: number) => {
                    const isMention = word.startsWith('@') && word.length > 1;
                    const isValid = isMention && isValidUsername(word);
                    
                    if (isValid) {
                        return (
                            <span key={index}>
                                <span className="bg-[#5D55FE3B] text-[#A39EFF]">{word}</span>
                            </span>
                        );
                    }
                    return <span key={index}>{word}</span>;
                })}
            </div>
            <textarea
                ref={ref}
                {...props}
                value={value}
                className="w-full bg-transparent focus:outline-none border-none resize-none text-white
                    scrollbar-thin scrollbar-thumb-[#3A3A3A] hover:scrollbar-thumb-[#404040] scrollbar-track-transparent"
            />
        </div>
    );
});

// Add display name for better debugging
StyledTextarea.displayName = 'StyledTextarea';

export function TextBox({ value, onChange, onSubmit, replyTo, setReplyTo, users }: TextBoxProps) {
    const [showMentions, setShowMentions] = useState(false);
    const [mentionInput, setMentionInput] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);

    const getFilteredUsers = (input: string) => {
        return users.filter(user => 
            user.username.toLowerCase().includes(input.toLowerCase())
        );
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentions) {
            const filteredUsers = getFilteredUsers(mentionInput);
            const totalItems = filteredUsers.length + 1;
            
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    if (selectedUserIndex === filteredUsers.length) {
                        handleMentionSelect('everyone');
                    } else if (filteredUsers.length > 0) {
                        handleMentionSelect(filteredUsers[selectedUserIndex].username);
                    }
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    setSelectedUserIndex(prev => 
                        prev > 0 ? prev - 1 : totalItems - 1
                    );
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    setSelectedUserIndex(prev => 
                        prev < totalItems - 1 ? prev + 1 : 0
                    );
                    return;
                case 'Escape':
                    setShowMentions(false);
                    setMentionInput("");
                    setSelectedUserIndex(0);
                    return;
            }
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event);
            return;
        }

        if (event.key === '@') {
            setShowMentions(true);
            setMentionInput("");
            setCursorPosition(event.currentTarget.selectionStart);
        }

        if (event.key === 'Backspace' && showMentions) {
            const cursorPos = event.currentTarget.selectionStart;
            const textBeforeCursor = event.currentTarget.value.slice(0, cursorPos);
            const lastAtPos = textBeforeCursor.lastIndexOf('@');
            
            // Check if we're deleting the @ symbol
            if (cursorPos - 1 === lastAtPos) {
                setShowMentions(false);
                setMentionInput("");
            }
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (showMentions) {
            const lastAtPos = newValue.lastIndexOf('@');
            if (lastAtPos >= 0) {
                const afterAt = newValue.slice(lastAtPos + 1);
                
                // Close dropdown if space is detected right after @
                if (afterAt.startsWith(' ')) {
                    setShowMentions(false);
                    setMentionInput("");
                    setSelectedUserIndex(0);
                    return;
                }
                
                setMentionInput(afterAt);
                
                // Check if there are any matching users
                const hasMatches = getFilteredUsers(afterAt).length > 0;
                setShowMentions(hasMatches);
            }
        } else {
            // If dropdown is closed but we find an @ with matching results, show dropdown
            const lastAtPos = newValue.lastIndexOf('@');
            if (lastAtPos >= 0) {
                const afterAt = newValue.slice(lastAtPos + 1);
                if (!afterAt.includes(' ')) {  // Only if there's no space after @
                    const hasMatches = getFilteredUsers(afterAt).length > 0;
                    if (hasMatches) {
                        setShowMentions(true);
                        setMentionInput(afterAt);
                        setCursorPosition(lastAtPos);
                    }
                }
            }
        }
    };

    const handleMentionSelect = (username: string) => {
        if (textareaRef.current) {
            const beforeMention = value.slice(0, cursorPosition);
            const afterMention = value.slice(textareaRef.current.selectionEnd);
            const newValue = `${beforeMention}@${username} ${afterMention}`;
            onChange(newValue);
            setShowMentions(false);
            setMentionInput("");
            setSelectedUserIndex(0);
            
            // Set focus back to textarea
            textareaRef.current.focus();
        }
    };

    const lineHeight = 24;
    const maxHeight = lineHeight * 5;

    return (
        <form onSubmit={onSubmit} className="flex flex-col w-full relative z-50">
            {replyTo && (
                <div className="p-[10px]">
                    <ReplyPreview replyTo={replyTo} onClose={() => setReplyTo(null)} />
                </div>
            )}

            <div className="flex flex-row border-t border-white/20 py-[10px] px-[10px]">
                <div className="bg-[#2A2A2A] rounded-full p-2 w-8 h-8 flex items-center justify-center mr-[10px] self-center">
                    <PlusIcon />
                </div>

                <div className="flex flex-row items-center justify-between w-full min-h-[40px] rounded-[100px] bg-black/25 border border-white/20 px-4">
                    <div className="flex flex-row items-center w-full">
                        <div className="flex flex-col w-full items-start relative">
                            <StyledTextarea
                                ref={textareaRef}
                                autoFocus
                                value={value}
                                users={users}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Write a message..."
                                rows={1}
                                style={{
                                    minHeight: '24px',
                                    maxHeight: `${maxHeight}px`,
                                    overflowY: 'auto',
                                    lineHeight: `${lineHeight}px`
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    const newHeight = Math.min(target.scrollHeight, maxHeight);
                                    target.style.height = `${newHeight}px`;
                                }}
                            />
                            
                            {showMentions && (
                                <MentionsDropdown 
                                    users={users}
                                    mentionInput={mentionInput}
                                    onSelect={handleMentionSelect}
                                    selectedIndex={selectedUserIndex}
                                    onKeyNavigation={(direction) => {
                                        const filteredUsers = getFilteredUsers(mentionInput);
                                        if (direction === 'up') {
                                            setSelectedUserIndex(prev => 
                                                prev > 0 ? prev - 1 : filteredUsers.length - 1
                                            );
                                        } else {
                                            setSelectedUserIndex(prev => 
                                                prev < filteredUsers.length - 1 ? prev + 1 : 0
                                            );
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="hover:opacity-70 cursor-pointer ml-3 shrink-0 bg-transparent border-0 p-0"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </form>
    );
}

function PlusIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 14.25C7.25 14.6642 7.58579 15 8 15C8.41421 15 8.75 14.6642 8.75 14.25V8.75L14.25 8.75C14.6642 8.75 15 8.41421 15 8C15 7.58579 14.6642 7.25 14.25 7.25L8.75 7.25V1.75C8.75 1.33579 8.41421 1 8 1C7.58579 1 7.25 1.33579 7.25 1.75V7.25L1.75 7.25C1.33579 7.25 1 7.58579 1 8C1 8.41421 1.33579 8.75 1.75 8.75L7.25 8.75V14.25Z" fill="#EEEEEE"/>
    </svg>
}

function SendIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.6184 7.37466L0.9752 0.0714624C0.443803 -0.192736 -0.142991 0.318887 0.0314055 0.897607L2.0462 6.6932C2.12827 6.96369 2.36217 7.1566 2.63915 7.17966L9.52475 8.00161L2.63915 8.82356C2.36217 8.84663 2.12827 9.03954 2.0462 9.31002L0.0314055 15.1035C-0.142991 15.6822 0.441751 16.1939 0.9752 15.9276L15.6204 8.62437C15.8892 8.49017 16 8.29936 16 7.99952C16 7.69967 15.8913 7.50886 15.6204 7.37466H15.6184Z" fill="white" fill-opacity="0.372"/>
    </svg>
}
