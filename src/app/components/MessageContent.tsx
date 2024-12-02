'use client';

import { Message } from '../types/server';
import { User } from '../types/user';
import { ChatBubbleGroup } from './ChatBubbleGroup';
import { ReplyTo } from '@/components/TextBox';

interface MessageContentProps {
  messageGroups: Message[][];
  getParentMessage: (messageId: number | null) => Message | null;
  currentUserId: string;
  setReplyTo: (replyTo: ReplyTo) => void;
  users: User[];
  serverId: number;
  username: string;
  lastMessageRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageContent({
  messageGroups,
  getParentMessage,
  currentUserId,
  setReplyTo,
  users,
  serverId,
  username,
  lastMessageRef,
  messagesEndRef
}: MessageContentProps) {
  return (
    <div className="space-y-6 py-4">
      {messageGroups.map((group, index) => (
        <div
          key={group[0].id}
          ref={index === 0 ? lastMessageRef : undefined}
        >
          <ChatBubbleGroup
            messages={group}
            getParentMessage={getParentMessage}
            isCurrentUser={group[0].user_id.toString() === currentUserId}
            setReplyTo={setReplyTo}
            users={users}
            server_id={serverId}
            username={username}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 