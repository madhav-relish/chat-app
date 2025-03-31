export interface WSMessage {
    id: string;
    roomId: string;
    senderId: string;
    text?: string;
    gif?: string;
    createdAt: Date;
  }
  
  export interface WSTypingEvent {
    roomId: string;
    userId: string;
  }