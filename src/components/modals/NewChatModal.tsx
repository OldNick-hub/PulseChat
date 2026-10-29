import React, { useState } from 'react';
import { X, MessageSquare, Hash, UserPlus, Search } from 'lucide-react';
import type { Conversation, User } from '../../types/chat';
import { DEMO_USERS, CURRENT_USER } from '../../data/demoData';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
  existingConversations: Conversation[];
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated,
  existingConversations,
}) => {
  const [tab, setTab] = useState<'direct' | 'channel'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelTopic, setChannelTopic] = useState('');

  if (!isOpen) return null;

  // Contacts that aren't the current user
  const availableUsers = Object.values(DEMO_USERS).filter(
    (u) => u.id !== CURRENT_USER.id && u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartDirectChat = (user: User) => {
    // Check if conversation already exists
    const existing = existingConversations.find(
      (c) => !c.isGroup && c.participants.some((p) => p.id === user.id)
    );

    if (existing) {
      onConversationCreated(existing);
      onClose();
      return;
    }

    const newConv: Conversation = {
      id: `conv-${user.id}-${Date.now()}`,
      name: user.name,
      isGroup: false,
      avatar: user.avatar,
      unreadCount: 0,
      isPinned: false,
      participants: [CURRENT_USER, user],
      description: `${user.role || 'Member'} • PulseChat`,
    };

    onConversationCreated(newConv);
    onClose();
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    const formattedName = channelName.startsWith('#') ? channelName : `#${channelName}`;
    const newConv: Conversation = {
      id: `channel-${Date.now()}`,
      name: formattedName.toLowerCase().replace(/\s+/g, '-'),
      isGroup: true,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=200&q=80',
      unreadCount: 0,
      isPinned: false,
      participants: [CURRENT_USER, ...Object.values(DEMO_USERS).slice(1, 3)],
      description: channelTopic.trim() || 'Team discussion & collaboration channel',
    };

    onConversationCreated(newConv);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <UserPlus size={20} color="var(--accent-primary)" />
            Start New Conversation
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
          <button
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'direct' ? '2px solid var(--accent-primary)' : 'none',
              color: tab === 'direct' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={() => setTab('direct')}
          >
            <MessageSquare size={16} />
            Direct Message
          </button>
          <button
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'channel' ? '2px solid var(--accent-primary)' : 'none',
              color: tab === 'channel' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={() => setTab('channel')}
          >
            <Hash size={16} />
            Create Channel
          </button>
        </div>

        <div className="modal-body">
          {tab === 'direct' ? (
            <>
              <div className="search-input-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search contacts by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="conversation-item"
                    onClick={() => handleStartDirectChat(user)}
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  >
                    <div className="avatar-wrapper">
                      <img src={user.avatar} alt={user.name} className="avatar-img" />
                      <span className={`status-indicator status-${user.status}`} />
                    </div>
                    <div className="conv-item-content">
                      <div className="conv-item-name">{user.name}</div>
                      <div className="conv-item-preview">{user.customStatus || user.role || user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateChannel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="channel-name">Channel Name</label>
                <input
                  id="channel-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g. project-alpha, ui-design, frontend"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="channel-topic">Channel Topic / Description (Optional)</label>
                <input
                  id="channel-topic"
                  className="form-input"
                  type="text"
                  placeholder="What is this channel about?"
                  value={channelTopic}
                  onChange={(e) => setChannelTopic(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                Create Channel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
