export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  customStatus?: string;
  role?: string;
  isCurrentUser?: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export type MessageType = 'text' | 'image' | 'code' | 'file' | 'audio';
export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  status: MessageDeliveryStatus;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  codeLanguage?: string;
  audioDuration?: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions: Reaction[];
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted?: boolean;
  lastMessage?: Message;
  participants: User[];
  description?: string;
  isTyping?: boolean;
  createdAt?: string;
}

export type FilterTab = 'all' | 'unread' | 'direct' | 'channels' | 'favorites';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isConnected: boolean;
}
