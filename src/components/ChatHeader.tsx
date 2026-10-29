import React from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  Sidebar as SidebarIcon,
  Users,
  Circle,
} from 'lucide-react';
import type { Conversation, User } from '../types/chat';
import { migrateUser, migrateConversation } from '../data/migration';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  onBack: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onToggleSearchInChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation: rawConversation,
  currentUser: rawCurrentUser,
  onBack,
  onStartCall,
  onToggleDetails,
  isDetailsOpen,
  onToggleSearchInChat,
}) => {
  const conversation = migrateConversation(rawConversation);
  const currentUser = migrateUser(rawCurrentUser);

  const otherUser = !conversation.isGroup
    ? conversation.participants.find((p) => p.id !== currentUser.id)
    : null;

  const getStatusSubtitle = () => {
    if (conversation.isTyping) {
      return (
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          Typing a response...
        </span>
      );
    }
    if (conversation.isGroup) {
      return (
        <span>
          <Users size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          {conversation.participants.length} members
        </span>
      );
    }
    if (otherUser) {
      if (otherUser.status === 'online') {
        return (
          <span>
            <Circle size={8} fill="var(--status-online)" color="var(--status-online)" style={{ display: 'inline', marginRight: '5px' }} />
            Active now {otherUser.customStatus ? `• ${otherUser.customStatus}` : ''}
          </span>
        );
      }
      return `${otherUser.status.toUpperCase()} • ${otherUser.customStatus || 'PulseChat Member'}`;
    }
    return conversation.description || 'Conversation';
  };

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button className="mobile-back-btn" onClick={onBack} aria-label="Back to conversations">
          <ChevronLeft size={24} />
        </button>

        <div className="avatar-wrapper" onClick={onToggleDetails} style={{ cursor: 'pointer' }}>
          <img src={conversation.avatar} alt={conversation.name} className="avatar-img" />
          {otherUser && <span className={`status-indicator status-${otherUser.status}`} />}
        </div>

        <div className="chat-header-info">
          <div className="chat-header-title">
            {conversation.name}
            {conversation.isGroup && <span className="chat-badge-channel">Channel</span>}
          </div>
          <div className="chat-header-status">{getStatusSubtitle()}</div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          className="icon-btn"
          onClick={() => onStartCall('voice')}
          title="Start voice call"
          aria-label="Voice call"
        >
          <Phone size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={() => onStartCall('video')}
          title="Start video call"
          aria-label="Video call"
        >
          <Video size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={onToggleSearchInChat}
          title="Search in messages"
          aria-label="Search messages"
        >
          <Search size={18} />
        </button>

        <button
          className={`icon-btn ${isDetailsOpen ? 'active' : ''}`}
          onClick={onToggleDetails}
          title="Conversation details"
          aria-label="Toggle details"
        >
          <SidebarIcon size={18} />
        </button>
      </div>
    </header>
  );
};
