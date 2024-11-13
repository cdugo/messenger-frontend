import { DeleteIcon } from "./icons/DeleteIcon";
import { User } from "@/app/types/user";
import { Avatar } from "@medusajs/ui";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';

// Types
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

interface MessageInputContainerProps {
    value: string;
    users: User[];
    handleInput: (event: any, newValue: string) => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
}

// Components
function ReplyPreview({ replyTo, onClose }: { replyTo: ReplyTo, onClose: () => void }) {
    return (
        <div className="border-l-2 border-accent-light rounded-r-lg px-2 w-full flex justify-between items-start">
            <div className="flex flex-col">
                <span className="text-sm text-gray-400">
                    <span className="text-accent-light font-medium text-sm">Reply to {replyTo.username}</span>
                </span>
                <span className="text-xs text-text-tertiary">
                    {replyTo.content.slice(0, 50)}
                    {replyTo.content.length > 50 ? '...' : ''}
                </span>
            </div>
            <button onClick={onClose} className="text-text-primary hover:opacity-70">
                <DeleteIcon />
            </button>
        </div>
    );
}

const mentionsInputStyle = {
    control: {
        backgroundColor: 'transparent',
        fontSize: 14,
        fontWeight: 'normal',
        border: 'none',
    },
    input: {
        margin: 0,
        padding: '8px 0',
        overflow: 'auto',
        height: 'auto',
        minHeight: '24px',
        maxHeight: '120px',
        color: 'var(--text-primary)',
        caretColor: 'var(--text-primary)',
        outline: 'none',
        border: 'none',
        lineHeight: '24px',
        boxSizing: 'border-box',
    },
    highlighter: {
        padding: '8px 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
        height: 'auto',
        minHeight: '24px',
        maxHeight: '120px',
        lineHeight: '24px',
    },
    suggestions: {
        list: {
            backgroundColor: 'var(--neutral-secondary)',
            border: '1px solid var(--borders-light)',
            borderRadius: '12px',
            boxShadow: '0px 6px 10px 0px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            maxHeight: '454px',
            overflowY: 'auto',
            position: 'absolute',
            bottom: '100%',
            left: -12,
            right: -12,
            marginBottom: '8px',
        },
        item: {
            padding: 0,
        },
    },
    mention: {
        backgroundColor: '#5D55FE3B',
        color: '#A39EFF',
        padding: '1px 4px',
        borderRadius: '6px',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        display: 'inline',
    }
};

function MessageInputContainer({
    value,
    users,
    handleInput,
    handleKeyDown,
}: MessageInputContainerProps) {
    const renderUserSuggestion = (
        suggestion: SuggestionDataItem,
        search: string,
        highlightedDisplay: React.ReactNode,
        index: number,
        focused: boolean
    ) => {
        const isFirstItem = index === 0;
        const user = users.find(u => u.username === suggestion.display) || {
            username: suggestion.display,
        };

        const isEveryone = suggestion.display === 'everyone';
        const fallback = isEveryone ? '@' : user.username?.[0].toUpperCase();

        return (
            <>
                {isFirstItem && (
                    <div className="px-3 py-2 text-sm text-text-secondary">Users</div>
                )}
                <div
                    className={`px-3 py-2 cursor-pointer transition-colors w-full ${
                        focused ? 'bg-neutral-hover' : ''
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Avatar 
                            fallback={fallback || ''}
                            className="w-6 h-6 rounded-full bg-neutral-primary text-text-primary text-sm"
                        />
                        <span className="text-text-primary text-sm">{user.username}</span>
                    </div>
                </div>
            </>
        );
    };

    // Calculate if the input has multiple lines
    const hasMultipleLines = value.split('\n').length > 1 || value.length > 50;

    return (
        <div className="flex flex-row border-t border-borders-light py-[10px] px-[10px]">
            <div className="bg-neutral-primary rounded-full p-2 w-8 h-8 flex items-center justify-center mr-[10px] self-center">
                <PlusIcon />
            </div>

            <div className={`flex flex-row items-start justify-between w-full min-h-[40px] 
                ${hasMultipleLines ? 'rounded-2xl' : 'rounded-[100px]'} 
                bg-background-overlay border border-borders-light px-4`}
            >
                <div className="flex flex-row items-start w-full">
                    <div className="flex flex-col w-full items-start relative py-[6px]">
                        <MentionsInput
                            value={value}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a message..."
                            style={mentionsInputStyle}
                            className="mentions-input"
                        >
                            <Mention
                                trigger="@"
                                data={[
                                    ...users.map(user => ({
                                        id: String(user.id),
                                        display: user.username
                                    })),
                                    { id: 'everyone', display: 'everyone' }
                                ]}
                                renderSuggestion={renderUserSuggestion}
                                appendSpaceOnAdd
                                markup="@[__display__]"
                                displayTransform={(id, display) => `@${display}`}
                                className="bg-accent-bg w-full px-[2px] py-[2px] rounded-[6px]"
                            />
                        </MentionsInput>
                    </div>
                </div>
                <button 
                    type="submit"
                    className="hover:opacity-70 cursor-pointer ml-3 shrink-0 bg-transparent border-0 p-0 self-center"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
}

function PlusIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.25 14.25C7.25 14.6642 7.58579 15 8 15C8.41421 15 8.75 14.6642 8.75 14.25V8.75L14.25 8.75C14.6642 8.75 15 8.41421 15 8C15 7.58579 14.6642 7.25 14.25 7.25L8.75 7.25V1.75C8.75 1.33579 8.41421 1 8 1C7.58579 1 7.25 1.33579 7.25 1.75V7.25L1.75 7.25C1.33579 7.25 1 7.58579 1 8C1 8.41421 1.33579 8.75 1.75 8.75L7.25 8.75V14.25Z" fill="currentColor" className="text-text-primary"/>
    </svg>
}

function SendIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.6184 7.37466L0.9752 0.0714624C0.443803 -0.192736 -0.142991 0.318887 0.0314055 0.897607L2.0462 6.6932C2.12827 6.96369 2.36217 7.1566 2.63915 7.17966L9.52475 8.00161L2.63915 8.82356C2.36217 8.84663 2.12827 9.03954 2.0462 9.31002L0.0314055 15.1035C-0.142991 15.6822 0.441751 16.1939 0.9752 15.9276L15.6204 8.62437C15.8892 8.49017 16 8.29936 16 7.99952C16 7.69967 15.8913 7.50886 15.6204 7.37466H15.6184Z" fill="currentColor" className="text-text-primary opacity-40"/>
    </svg>
}

// Main Component
export function TextBox({ value, onChange, onSubmit, replyTo, setReplyTo, users }: TextBoxProps) {
    const handleInput = (event: any, newValue: string) => {
        onChange(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event as any);
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col w-full relative z-50">
            {replyTo && (
                <div className="p-[10px]">
                    <ReplyPreview replyTo={replyTo} onClose={() => setReplyTo(null)} />
                </div>
            )}
            <MessageInputContainer
                value={value}
                users={users}
                handleInput={handleInput}
                handleKeyDown={handleKeyDown}
            />
        </form>
    );
}
