import { createConsumer, Subscription } from '@rails/actioncable'

interface MessageData {
  type: 'message' | 'message_deleted' | 'error';
  id?: number;
  content?: string;
  user_id?: number;
  message_id?: number;
  created_at?: string;
  parent_id?: number;
  server_id?: number;
  user?: {
    id: number;
    username: string;
  };
  message?: string;
}

type MessageCallback = (data: MessageData) => void;

class WebSocketClient {
  private consumer = createConsumer('ws://localhost:8080/cable');
  private subscriptions = new Map<string, Subscription>();

  subscribeToServer(serverId: string, callback: MessageCallback): void {
    if (this.subscriptions.has(serverId)) {
      console.warn('Already subscribed to server:', serverId);
      return;
    }

    const subscription = this.consumer.subscriptions.create(
      {
        channel: 'MessageChannel',
        server_id: Number(serverId)
      },
      {
        connected() {
          console.log('Connected to server:', serverId);
        },

        disconnected() {
          console.log('Disconnected from server:', serverId);
        },

        received(data: MessageData) {
          console.log('Raw received message:', data);
          callback(data);
        },

        rejected() {
          console.log('Subscription rejected for server:', serverId);
        }
      }
    ) as Subscription;

    this.subscriptions.set(serverId, subscription);
  }

  unsubscribeFromServer(serverId: string): void {
    const subscription = this.subscriptions.get(serverId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(serverId);
    }
  }

  sendMessage(serverId: string, content: string, parentId?: number): void {
    const subscription = this.subscriptions.get(serverId);
    if (!subscription) {
      console.error('No subscription found for server:', serverId);
      return;
    }

    subscription.perform('receive', {
      action: 'create',
      server_id: Number(serverId),
      content,
      parent_id: parentId || null
    });
  }

  disconnect(): void {
    this.consumer.disconnect();
    this.subscriptions.clear();
  }
}

export const websocket = new WebSocketClient();

