// Chirpwell Real-Time WebSocket Service (Socket.IO client & simulated event bus)

type EventCallback = (data: any) => void;

class SocketService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  public connect(): void {
    this.isConnected = true;
    // Periodically simulate real-time notification or live like updates for demo purposes
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (Math.random() > 0.85) {
          this.emit('post:counts', {
            postId: 'p_101',
            likesCount: 48 + Math.floor(Math.random() * 5),
            repostsCount: 12
          });
        }
      }, 15000);
    }
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Unsubscribe helper
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for ${event}:`, e);
        }
      });
    }
  }

  public joinRoom(roomName: string): void {
    // Room joining logic
  }

  public leaveRoom(roomName: string): void {
    // Room leaving logic
  }
}

export const socketService = new SocketService();
