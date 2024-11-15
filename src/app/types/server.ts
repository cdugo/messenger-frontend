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
}

export interface Server {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    owner_id: number;
    latest_message: Message;
}

export type MeResponse = {
    user: User;
    servers: Server[];
}

export type ServerWithMessagesAndUsers = Server & {
    messages: Message[];
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
  ERROR = 'error',
  CONFIRM_SUBSCRIPTION = 'confirm_subscription'
}

interface BaseWebSocketMessage {
  type: MessageType;
}

interface MessageData extends BaseWebSocketMessage {
  type: MessageType.MESSAGE;
  id: number;
  content: string;
  user_id: number;
  server_id: number;
  parent_message_id: number | null;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
  };
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