export interface Conversation {
    otherUser: string;
    otherUserPhotoUrl: string;
    isSender: boolean;
    content: string;
    messageSent: Date;
    dateRead?: Date;
}