'use client';

import { DeleteIcon } from "./icons/DeleteIcon";
import { User } from "@/app/types/user";
import { Avatar } from "@medusajs/ui";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import { FileUpload } from './FileUpload';
import { useState, useEffect } from 'react';
import { directUpload } from '@/lib/uploadService';
import LoadingSpinner from './LoadingSpinner';
import Image from 'next/image';

// Types
interface TextBoxProps {
    value: NewMessage;
    onChange: (value: NewMessage) => void;
    onSubmit: (content: string, attachments?: string[]) => void;
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
    value: NewMessage;
    users: User[];
    handleInput: (event: React.ChangeEvent<HTMLTextAreaElement>, newValue: string) => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
    onSubmit: (content: string, attachments?: string[]) => void;
    onChange: (value: NewMessage) => void;
}

export type NewMessage = {
  content?: string;
  attachments: string[];
};

interface FilePreview {
  id: string;
  url: string;
  type: string;
  name: string;
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
    onSubmit,
    onChange
}: MessageInputContainerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previews, setPreviews] = useState<FilePreview[]>([]);

    const handleFileSelect = async (files: File[]) => {
        const mediaFiles = files.filter(file => 
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (mediaFiles.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = mediaFiles.map(async (file) => {
                const objectUrl = URL.createObjectURL(file);
                const signedId = await directUpload(file);
                return {
                    id: signedId,
                    url: objectUrl,
                    type: file.type,
                    name: file.name
                };
            });

            const newPreviews = await Promise.all(uploadPromises);
            setPreviews(prev => [...prev, ...newPreviews]);
            
            onChange({
                ...value,
                attachments: [...value.attachments, ...newPreviews.map(p => p.id)]
            });
        } catch (error) {
            console.error('Failed to upload files:', error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            previews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    const clearMessage = () => {
        // Clear previews
        previews.forEach(preview => URL.revokeObjectURL(preview.url));
        setPreviews([]);
        // Clear content and attachments
        onChange({ content: "", attachments: [] });
    };

    const handleSubmit = () => {
        const hasAttachments = value.attachments && value.attachments.length > 0;
        if (value.content?.trim() || hasAttachments) {
            onSubmit(value.content || '', value.attachments);
            clearMessage();
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        } else {
            handleKeyDown(event);
        }
    };

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
    const hasMultipleLines = (value.content || '').split('\n').length > 1 || (value.content || '').length > 50;

    const handleRemoveAttachment = (previewId: string) => {
        // Find the preview before removing it so we can revoke its URL
        const previewToRemove = previews.find(p => p.id === previewId);
        if (previewToRemove) {
            URL.revokeObjectURL(previewToRemove.url);
        }
        
        setPreviews(prev => prev.filter(p => p.id !== previewId));
        onChange({
            ...value,
            attachments: value.attachments.filter(id => id !== previewId)
        });
    };

    return (
        <div className="flex flex-col w-full">
            {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border-t border-borders-light">
                    {previews.map((preview) => (
                        <div 
                            key={preview.id} 
                            className="relative group w-20 h-20 rounded-lg overflow-hidden"
                        >
                            {preview.type.startsWith('image/') ? (
                                <Image
                                    src={preview.url}
                                    alt={preview.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : preview.type.startsWith('video/') ? (
                                <video
                                    src={preview.url}
                                    className="w-full h-full object-cover"
                                />
                            ) : null}
                            <button
                                onClick={() => handleRemoveAttachment(preview.id)}
                                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 
                                    opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                            >
                                <svg 
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                    role="img"
                                    aria-label="Remove attachment"
                                >
                                    <path 
                                        d="M18 6L6 18M6 6l12 12" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-row border-t border-borders-light py-[10px] px-[10px]">
                <div className="flex items-center pr-[10px]">
                    <FileUpload onFileSelect={handleFileSelect} />
                    {isUploading && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                        </div>
                    )}
                </div>

                <div className={`flex flex-row items-start justify-between w-full min-h-[40px] 
                    ${hasMultipleLines ? 'rounded-2xl' : 'rounded-[100px]'} 
                    bg-background-overlay border border-borders-light px-4`}
                >
                    <div className="flex flex-row items-start w-full">
                        <div className="flex flex-col w-full items-start relative py-[6px]">
                            <MentionsInput
                                value={value.content || ''}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e: any, newValue: string, newPlainTextValue: string) => {
                                    handleInput(e, newPlainTextValue);
                                }}
                                onKeyDown={handleKeyPress}
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
                        type="button"
                        onClick={handleSubmit}
                        className="hover:opacity-70 cursor-pointer ml-3 shrink-0 bg-transparent border-0 p-0 self-center"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SendIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.6184 7.37466L0.9752 0.0714624C0.443803 -0.192736 -0.142991 0.318887 0.0314055 0.897607L2.0462 6.6932C2.12827 6.96369 2.36217 7.1566 2.63915 7.17966L9.52475 8.00161L2.63915 8.82356C2.36217 8.84663 2.12827 9.03954 2.0462 9.31002L0.0314055 15.1035C-0.142991 15.6822 0.441751 16.1939 0.9752 15.9276L15.6204 8.62437C15.8892 8.49017 16 8.29936 16 7.99952C16 7.69967 15.8913 7.50886 15.6204 7.37466H15.6184Z" fill="currentColor" className="text-text-primary opacity-40"/>
    </svg>
}

// Main Component
export function TextBox({ value, onChange, onSubmit, replyTo, setReplyTo, users }: TextBoxProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInput = (_: any, newValue: string) => {
        onChange({
            ...value,
            content: newValue
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Only handle non-Enter key events here
        if (event.key !== 'Enter' || event.shiftKey) {
            // Add any additional key handling here if needed
        }
    };

    return (
        <form className="flex flex-col w-full relative z-50">
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
                onSubmit={onSubmit}
                onChange={onChange}
            />
        </form>
    );
}