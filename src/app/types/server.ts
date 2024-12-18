import { User } from "./user";

export interface Message {
    id: number;
    content: string;
    user_id: number;
    server_id: number;
    parent_message_id: number | null;
    created_at: string;
    updated_at: string;
    parent_message?: Message;
    user: {
        username: string;
    };
    reactions: Reaction[];
    attachment_urls: AttachmentUrl[];
}

export interface Server {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    owner_id: number;
    latest_message: Message;
    read_state: ReadState;
}

export type MeResponse = {
    user: User;
    servers: Server[];
}

export type ServerWithUsers = Server & {
    users: User[];
}

export type Reaction = {
    id: number;
    emoji: string;
    user: {
        username: string;
    };
}

export enum MessageType {
  MESSAGE = 'message',
  MESSAGE_DELETED = 'message_deleted',
  REACTION = 'reaction',
  REACTION_DELETED = 'reaction_delete',
  ERROR = 'error'
}

interface BaseWebSocketMessage {
  type: MessageType;
}

interface MessageAttachment {
  id: number;
  filename: string;
  content_type: string;
  byte_size: number;
  url: string;
  thumbnail_url: string | null;
}

interface MessageData extends BaseWebSocketMessage {
  type: MessageType.MESSAGE;
  id: number;
  content: string;
  user_id: number;
  server_id: number;
  parent_message_id: number | null;
  created_at: string;
  user: {
    id: number;
    username: string;
  };
  attachments?: MessageAttachment[];
  reactions: Reaction[];
}

interface MessageDeletedData extends BaseWebSocketMessage {
  type: MessageType.MESSAGE_DELETED;
  message_id: number;
}

interface ReactionData extends BaseWebSocketMessage {
  type: MessageType.REACTION;
  message_id: number;
  id: number;
  reaction: {
    emoji: string;
    username: string;
  };
}

interface ReactionDeletedData extends BaseWebSocketMessage {
  type: MessageType.REACTION_DELETED;
  message_id: number;
  reaction: {
    id: number;
    username: string;
    emoji: string;
  };
}

interface ErrorData extends BaseWebSocketMessage {
  type: MessageType.ERROR;
  message: string;
}

export type WebSocketMessage = 
  | MessageData 
  | MessageDeletedData 
  | ReactionData 
  | ReactionDeletedData 
  | ErrorData;


export interface PaginationData {
    current_page: number;
    total_pages: number;
    total_count: number;
    next_page: number | null;
    prev_page: number | null;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationData;
}

export interface WebSocketNotification {
  type: 'new_message';
  server_id: number;
  data: {
    message_id: number;
    sender: {
      id: number;
      username: string;
    };
    preview: string;
    attachment_urls: AttachmentUrl[];
  };
  timestamp: string;
}

export interface ReadState {
  last_read_at: string;
  unread_count: number;
}

export interface Attachment {
  id: number;
  url: string;
  filename: string;
  content_type: string;
  byte_size: number;
  width?: number;
  height?: number;
}

export interface AttachmentUrl {
  id: number;
  url: string;
  thumbnail_url: string;
}