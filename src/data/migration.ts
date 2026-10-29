import type { User, Conversation, Message } from '../types/chat';
import { CURRENT_USER, DEMO_USERS } from './demoData';

export const OLD_TO_NEW_NAME_MAP: Record<string, string> = {
  'Alex Morgan': 'Shourya',
  'Alex': 'Shourya',
  'Sarah Jenkins': 'Mahi',
  'Sarah': 'Mahi',
  'David Kim': 'Aarav Sharma',
  'David': 'Aarav Sharma',
  'Elena Rostova': 'Ananya Patel',
  'Elena': 'Ananya Patel',
};

export function migrateUser(user: User): User {
  if (!user) return CURRENT_USER;

  let name = user.name;
  let email = user.email;
  let avatar = user.avatar;
  let role = user.role;

  if (user.id === 'user-alex' || name === 'Alex Morgan' || name === 'Alex') {
    name = 'Shourya';
    email = 'shourya@pulsechat.dev';
    avatar = CURRENT_USER.avatar;
    role = 'Senior Frontend Engineer';
  } else if (user.id === 'user-sarah' || name === 'Sarah Jenkins' || name === 'Sarah') {
    name = 'Mahi';
    email = 'mahi@pulsechat.dev';
    avatar = DEMO_USERS['user-sarah'].avatar;
    role = 'Staff UI Architect';
  } else if (user.id === 'user-david' || name === 'David Kim' || name === 'David') {
    name = 'Aarav Sharma';
    email = 'aarav.sharma@pulsechat.dev';
    avatar = DEMO_USERS['user-david'].avatar;
    role = 'Product Designer';
  } else if (user.id === 'user-elena' || name === 'Elena Rostova' || name === 'Elena') {
    name = 'Ananya Patel';
    email = 'ananya.patel@pulsechat.dev';
    avatar = DEMO_USERS['user-elena'].avatar;
    role = 'QA Lead';
  }

  return {
    ...user,
    name,
    email,
    avatar,
    role,
  };
}

export function migrateMessage(msg: Message): Message {
  if (!msg) return msg;

  let senderName = msg.senderName;
  let senderAvatar = msg.senderAvatar;

  if (OLD_TO_NEW_NAME_MAP[senderName]) {
    senderName = OLD_TO_NEW_NAME_MAP[senderName];
  }

  if (msg.senderId === 'user-alex') {
    senderName = 'Shourya';
    senderAvatar = CURRENT_USER.avatar;
  } else if (msg.senderId === 'user-sarah') {
    senderName = 'Mahi';
    senderAvatar = DEMO_USERS['user-sarah'].avatar;
  } else if (msg.senderId === 'user-david') {
    senderName = 'Aarav Sharma';
    senderAvatar = DEMO_USERS['user-david'].avatar;
  } else if (msg.senderId === 'user-elena') {
    senderName = 'Ananya Patel';
    senderAvatar = DEMO_USERS['user-elena'].avatar;
  }

  let content = msg.content;
  if (content) {
    content = content
      .replace(/\bAlex Morgan\b/g, 'Shourya')
      .replace(/\bHey Alex!\b/g, 'Hey Shourya!')
      .replace(/\bHi Alex!\b/g, 'Hi Shourya!')
      .replace(/\bGot it, Alex!\b/g, 'Got it, Shourya!')
      .replace(/\bSarah Jenkins\b/g, 'Mahi')
      .replace(/\bDavid Kim\b/g, 'Aarav Sharma')
      .replace(/\bElena Rostova\b/g, 'Ananya Patel');
  }

  let replyTo = msg.replyTo;
  if (replyTo && OLD_TO_NEW_NAME_MAP[replyTo.senderName]) {
    replyTo = {
      ...replyTo,
      senderName: OLD_TO_NEW_NAME_MAP[replyTo.senderName],
    };
  }

  return {
    ...msg,
    senderName,
    senderAvatar,
    content,
    replyTo,
  };
}

export function migrateConversation(conv: Conversation): Conversation {
  if (!conv) return conv;

  let name = conv.name;
  let avatar = conv.avatar;
  let description = conv.description;

  if (conv.id === 'conv-sarah' || name === 'Sarah Jenkins' || name === 'Sarah') {
    name = 'Mahi';
    avatar = DEMO_USERS['user-sarah'].avatar;
    description = 'Staff UI Architect • Frontend Platform';
  } else if (conv.id === 'conv-david' || name === 'David Kim' || name === 'David') {
    name = 'Aarav Sharma';
    avatar = DEMO_USERS['user-david'].avatar;
    description = 'Product Designer • Design Systems';
  } else if (conv.id === 'conv-elena' || name === 'Elena Rostova' || name === 'Elena') {
    name = 'Ananya Patel';
    avatar = DEMO_USERS['user-elena'].avatar;
    description = 'QA Lead • Test Automation';
  }

  const participants = (conv.participants || []).map(migrateUser);
  const lastMessage = conv.lastMessage ? migrateMessage(conv.lastMessage) : undefined;

  return {
    ...conv,
    name,
    avatar,
    description,
    participants,
    lastMessage,
  };
}

export function migrateConversations(convs: Conversation[]): Conversation[] {
  if (!Array.isArray(convs)) return [];
  return convs.map(migrateConversation);
}

export function migrateMessagesMap(map: Record<string, Message[]>): Record<string, Message[]> {
  if (!map) return {};
  const result: Record<string, Message[]> = {};
  for (const [convId, list] of Object.entries(map)) {
    result[convId] = (list || []).map(migrateMessage);
  }
  return result;
}

export function cleanupLegacyStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const legacyKeys = [
    'pulsechat_conversations',
    'pulsechat_messages',
    'pulsechat_user',
    'pulsechat_conversations_v2',
    'pulsechat_messages_v2',
    'pulsechat_user_v2',
    'pulsechat_theme_v2',
    'pulsechat_conversations_v3',
    'pulsechat_messages_v3',
    'pulsechat_user_v3',
    'pulsechat_theme_v3',
  ];
  for (const key of legacyKeys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors in sandboxed environments
    }
  }
}
