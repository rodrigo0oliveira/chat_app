import { Client } from '@stomp/stompjs';

class WebSocketService {
  private client: Client | null = null;
  private currentSubscription: any = null;

  connect(onConnect: () => void, onError: (err: any) => void) {
    const token = localStorage.getItem('chat_token');
    if (!token) {
      onError("No token found");
      return;
    }

    this.client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
      connectHeaders: {
        authorization: token,
      },
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
    });

    this.client.onConnect = () => {
      onConnect();
    };

    this.client.onStompError = (frame) => {
      onError(frame.headers['message']);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
      }
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribeToRoom(roomId: string, onMessageReceived: (message: any) => void) {
    if (!this.client || !this.client.connected) return;

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    this.currentSubscription = this.client.subscribe(`/topic/rooms.${roomId}`, (message) => {
      try {
        const data = JSON.parse(message.body);
        onMessageReceived(data);
      } catch (err) {
        onMessageReceived(message.body);
      }
    }, { type: 'PUBLIC' }); // Note: the type PUBLIC was used in the vanilla JS, kept for compatibility
  }

  sendMessage(roomId: string, content: string) {
    if (!this.client || !this.client.connected) return;

    this.client.publish({
      destination: '/app/chat.sendMessage',
      headers: { 'message-id': crypto.randomUUID() },
      body: JSON.stringify({ roomId, content })
    });
  }
}

export const wsService = new WebSocketService();
