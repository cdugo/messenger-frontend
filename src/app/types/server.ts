import { User } from "./user";

export type Message = {
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

export type ServerWithMessages = Server & {
    messages: Message[];
}