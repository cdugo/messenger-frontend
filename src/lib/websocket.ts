import { createConsumer, Subscription } from '@rails/actioncable';
import { WebSocketMessage } from "@/app/types/server";

export type MessageCallback = (data: WebSocketMessage) => void;

class WebSocketClient {
  private consumer;
  private serverSubscriptions: Map<string, Subscription> = new Map();
  private callbacks: Map<string, MessageCallback> = new Map();

  constructor() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/cable';
    this.consumer = createConsumer(wsUrl);
  }

  private getServerKey(serverId: string | number): string {
    return String(serverId);
  }

  subscribeToServer(serverId: string | number, callback: MessageCallback) {
    const serverKey = this.getServerKey(serverId);
    
    // Store the callback
    this.callbacks.set(serverKey, callback);

    // Create the subscription
    const subscription = this.consumer.subscriptions.create(
      {
        channel: 'MessageChannel',
        server_id: Number(serverId)
      },
      {
        connected: () => {
          console.log(`Connected to server ${serverKey}`);
        },
        disconnected: () => {
          console.log(`Disconnected from server ${serverKey}`);
        },
        received: (data) => {
          const cb = this.callbacks.get(serverKey);
          if (cb) {
            cb(data);
          }
        }
      }
    );

    this.serverSubscriptions.set(serverKey, subscription);
  }

  unsubscribeFromServer(serverId: string | number) {
    const serverKey = this.getServerKey(serverId);
    const subscription = this.serverSubscriptions.get(serverKey);
    if (subscription) {
      subscription.unsubscribe();
      this.serverSubscriptions.delete(serverKey);
      this.callbacks.delete(serverKey);
    }
  }

  sendMessage(serverId: string | number, content: string, parentMessageId?: number) {
    const serverKey = this.getServerKey(serverId);
    const subscription = this.serverSubscriptions.get(serverKey);
    if (subscription) {
      subscription.perform('message_create', {
        server_id: Number(serverId),
        content,
        parent_message_id: parentMessageId || null
      });
    } else {
      console.error(`No subscription found for server ${serverKey}`);
    }
  }

  sendReaction(serverId: string | number, messageId: number, emoji: string) {
    const serverKey = this.getServerKey(serverId);
    const subscription = this.serverSubscriptions.get(serverKey);
    if (subscription) {
      subscription.perform('reaction_create', {
        server_id: Number(serverId),
        message_id: messageId,
        emoji
      });
    } else {
      console.error(`No subscription found for server ${serverKey}`);
    }
  }

  deleteReaction(serverId: string | number, messageId: number, emoji: string) {
    const serverKey = this.getServerKey(serverId);
    const subscription = this.serverSubscriptions.get(serverKey);
    if (subscription) {
      subscription.perform('reaction_delete', {
        server_id: Number(serverId),
        message_id: messageId,
        emoji
      });
    } else {
      console.error(`No subscription found for server ${serverKey}`);
    }
  }

  disconnect() {
    this.consumer.disconnect();
    this.serverSubscriptions.clear();
    this.callbacks.clear();
  }
}

export const websocket = new WebSocketClient();

