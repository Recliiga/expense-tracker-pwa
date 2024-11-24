import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const serverURL = process.env.NODE_ENV === 'production'
      ? 'https://your-backend-url.com'  // Replace with your deployed backend URL
      : 'http://localhost:5001';

    this.socket = io(serverURL, {
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  onExpenseAdded(callback: (expense: any) => void) {
    if (this.socket) {
      this.socket.on('expense_update', callback);
    }
  }

  onExpenseUpdated(callback: (expense: any) => void) {
    if (this.socket) {
      this.socket.on('expense_update', callback);
    }
  }

  onExpenseDeleted(callback: (expenseId: string) => void) {
    if (this.socket) {
      this.socket.on('expense_delete', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = SocketService.getInstance();
