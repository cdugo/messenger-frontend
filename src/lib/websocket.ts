import { createConsumer, Subscription } from '@rails/actioncable';
import { WebSocketMessage, WebSocketNotification } from "@/app/types/server";

export type MessageCallback = (data: WebSocketMessage) => void;
export type NotificationCallback = (data: WebSocketNotification) => void;

interface ChannelCallback {
  type: 'message' | 'notification';
  callback: MessageCallback | NotificationCallback;
}

class WebSocketClient {
  private consumer;
  private serverSubscriptions: Map<string, Subscription> = new Map();
  private callbacks: Map<string, ChannelCallback> = new Map();
  private notificationSubscription?: Subscription;

  constructor() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/cable';
    this.consumer = createConsumer(wsUrl);
  }

  private getServerKey(serverId: string | number): string {
    return String(serverId);
  }

  subscribeToServer(serverId: string | number, callback: MessageCallback) {
    const serverKey = this.getServerKey(serverId);
    
    // Store the callback with its type
    this.callbacks.set(serverKey, { type: 'message', callback });

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
          if (cb && cb.type === 'message') {
            cb.callback(data);
          }
        }
      }
    );

    this.serverSubscriptions.set(serverKey, subscription);
  }

  subscribeToNotifications(callback: NotificationCallback) {
    // Unsubscribe from any existing notification subscription
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    this.notificationSubscription = this.consumer.subscriptions.create(
      {
        channel: 'NotificationChannel'
      },
      {
        connected: () => {
          console.log('Connected to notifications');
        },
        disconnected: () => {
          console.log('Disconnected from notifications');
        },
        received: (data: WebSocketNotification) => {
          callback(data);
        }
      }
    );
  }

  unsubscribeFromNotifications() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = undefined;
    }
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

  sendMessage(serverId: string | number, content?: string, parentMessageId?: number, attachments?: string[]) {
    const serverKey = this.getServerKey(serverId);
    const subscription = this.serverSubscriptions.get(serverKey);
    if (subscription) {
      subscription.perform('message_create', {
        server_id: Number(serverId),
        content,
        parent_message_id: parentMessageId || null,
        attachment_ids: attachments || []
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
    this.unsubscribeFromNotifications();
    this.consumer.disconnect();
    this.serverSubscriptions.clear();
    this.callbacks.clear();
  }
}

export const websocket = new WebSocketClient();

