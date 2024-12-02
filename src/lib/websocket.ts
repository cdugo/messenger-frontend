import { createConsumer, Subscription } from '@rails/actioncable';
import { toast } from 'sonner';
import { getErrorMessage } from './error-utils';
import { WebSocketMessage, WebSocketNotification } from '@/app/types/server';

type MessageCallback = (data: WebSocketMessage) => void;
type NotificationCallback = (data: WebSocketNotification) => void;

class WebSocketClient {
  private consumer;
  private serverSubscriptions: Map<string, Subscription>;
  private callbacks: Map<string, MessageCallback>;
  private notificationSubscription?: Subscription;

  constructor() {
    this.consumer = createConsumer(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/cable');
    this.serverSubscriptions = new Map();
    this.callbacks = new Map();
  }

  private getServerKey(serverId: string | number): string {
    return String(serverId);
  }

  subscribeToServer(serverId: string | number, callback: MessageCallback) {
    const serverKey = this.getServerKey(serverId);

    // Unsubscribe from any existing subscription for this server
    if (this.serverSubscriptions.has(serverKey)) {
      this.unsubscribeFromServer(serverId);
    }

    const subscription = this.consumer.subscriptions.create(
      {
        channel: 'MessageChannel',
        server_id: serverId
      },
      {
        connected: () => {
          console.log(`Connected to server ${serverId}`);
        },
        disconnected: () => {
          console.log(`Disconnected from server ${serverId}`);
        },
        received: (data) => {
          if (data.type === 'error') {
            toast.error(getErrorMessage(data));
            return;
          }
          callback(data);
        }
      }
    );

    this.serverSubscriptions.set(serverKey, subscription);
    this.callbacks.set(serverKey, callback);
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
      toast.error('Failed to send message: Not connected to server');
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
      toast.error('Failed to add reaction: Not connected to server');
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
      toast.error('Failed to remove reaction: Not connected to server');
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

