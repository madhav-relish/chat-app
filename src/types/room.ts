export interface CreateRoomInput{
    name?: string;
    isGroup: boolean;
}

export interface RoomResponse{
    id: string;
    name: string | null;
    isGroup: boolean;
    participants: {
        id: string;
        name: string | null;
        image: string | null;
    }[];
    lastMessage?: {
        text: string | null;
        gif: string | null;
        createdAt: Date;
    } | null
}