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