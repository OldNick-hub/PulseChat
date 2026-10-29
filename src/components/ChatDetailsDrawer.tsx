import React from 'react';
import {
  X,
  Pin,
  Bell,
  Trash2,
  ShieldCheck,
  Image as ImageIcon,
  Users,
} from 'lucide-react';
import type { Conversation, User } from '../types/chat';
import { migrateUser, migrateConversation } from '../data/migration';

interface ChatDetailsDrawerProps {
  conversation: Conversation;
  currentUser: User;
  onClose: () => void;
  onTogglePin: (conversationId: string) => void;
  onClearHistory: (conversationId: string) => void;
}

export const ChatDetailsDrawer: React.FC<ChatDetailsDrawerProps> = ({
  conversation: rawConversation,
  currentUser: rawCurrentUser,
  onClose,
  onTogglePin,
  onClearHistory,
}) => {
  const conversation = migrateConversation(rawConversation);
  const currentUser = migrateUser(rawCurrentUser);

  const otherUser = !conversation.isGroup
    ? conversation.participants.find((p) => p.id !== currentUser.id)
    : null;

  return (
    <aside className="chat-details-drawer">
      <div className="drawer-header">
        <h3>{conversation.isGroup ? 'Channel Info' : 'Contact Details'}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-profile-hero">
        <img src={conversation.avatar} alt={conversation.name} className="drawer-avatar" />
        <div className="drawer-name">{conversation.name}</div>
        <div className="drawer-desc">
          {conversation.isGroup
            ? conversation.description
            : otherUser?.customStatus || otherUser?.role || conversation.description}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            className={`btn-secondary ${conversation.isPinned ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            onClick={() => onTogglePin(conversation.id)}
          >
            <Pin size={14} />
            {conversation.isPinned ? 'Unpin' : 'Pin Chat'}
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            onClick={() => alert(`Notifications toggled for ${conversation.name}`)}
          >
            <Bell size={14} />
            Mute
          </button>
        </div>
      </div>

      {/* Participants */}
      <div className="drawer-section">
        <div className="drawer-section-title">
          <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Members ({conversation.participants.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversation.participants.map((member) => (
            <div key={member.id} className="participant-row">
              <div className="participant-left">
                <div className="avatar-wrapper">
                  <img src={member.avatar} alt={member.name} className="participant-avatar" />
                  <span className={`status-indicator status-${member.status}`} />
                </div>
                <div>
                  <div className="participant-name">
                    {member.name} {member.id === currentUser.id && '(You)'}
                  </div>
                  <div className="participant-role">{member.role || 'Member'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Media */}
      <div className="drawer-section">
        <div className="drawer-section-title">
          <ImageIcon size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Shared Media
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"
            alt="media"
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80"
            alt="media"
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80"
            alt="media"
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="drawer-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-online)', fontSize: '0.8rem', fontWeight: 600 }}>
          <ShieldCheck size={16} />
          Protected & Encrypted in Transit
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
          TLS-secured connection. Supabase Row Level Security ensures only authorized members have access.
        </div>
      </div>

      {/* Actions */}
      <div className="drawer-section" style={{ borderBottom: 'none' }}>
        <button
          className="btn-danger"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            if (confirm('Are you sure you want to clear message history for this conversation?')) {
              onClearHistory(conversation.id);
            }
          }}
        >
          <Trash2 size={16} />
          Clear Chat History
        </button>
      </div>
    </aside>
  );
};
