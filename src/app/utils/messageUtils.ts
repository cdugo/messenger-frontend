import { Message } from '../types/server';

export function groupMessages(messages: Message[]): Message[][] {
  const groups: Message[][] = [];
  let currentGroup: Message[] = [];
  let currentUserId = -1;

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  sortedMessages.forEach((message) => {
    if (message.user_id !== currentUserId && currentGroup.length > 0) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
    currentGroup.push(message);
    currentUserId = message.user_id;
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

export function getParentMessage(messages: Message[], messageId: number | null): Message | null {
  if (!messageId) return null;
  return messages.find(m => m.id === messageId) || null;
} 