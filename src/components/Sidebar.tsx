import React, { useState } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Settings,
  X,
  Pin,
  Check,
  CheckCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Conversation, FilterTab, User } from '../types/chat';
import { migrateUser, migrateConversation } from '../data/migration';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: User;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenNewChat: () => void;
  isSupabaseConfigured: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isMobileHidden?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations: rawConversations,
  activeConversationId,
  onSelectConversation,
  currentUser: rawCurrentUser,
  onOpenProfile,
  onOpenSettings,
  onOpenNewChat,
  isSupabaseConfigured,
  theme,
  onToggleTheme,
  isMobileHidden = false,
}) => {
  const currentUser = migrateUser(rawCurrentUser);
  const conversations = rawConversations.map(migrateConversation);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filter by Tab
    if (activeFilter === 'unread' && conv.unreadCount === 0) return false;
    if (activeFilter === 'direct' && conv.isGroup) return false;
    if (activeFilter === 'channels' && !conv.isGroup) return false;
    if (activeFilter === 'favorites' && !conv.isPinned) return false;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.name.toLowerCase().includes(q);
      const matchDesc = conv.description?.toLowerCase().includes(q);
      const matchLastMsg = conv.lastMessage?.content.toLowerCase().includes(q);
      const matchParticipant = conv.participants.some((p) => p.name.toLowerCase().includes(q));
      return matchName || matchDesc || matchLastMsg || matchParticipant;
    }

    return true;
  });

  // Sort pinned first
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <aside className={`chat-sidebar ${isMobileHidden ? 'mobile-hidden' : ''}`}>
      {/* Header with User Info and Theme/Settings actions */}
      <div className="sidebar-header">
        <div className="user-profile-summary" onClick={onOpenProfile} title="Edit Profile & Persona">
          <div className="avatar-wrapper">
            <img src={currentUser.avatar} alt={currentUser.name} className="avatar-img" />
            <span className={`status-indicator status-${currentUser.status}`} />
          </div>
          <div className="user-profile-info">
            <div className="user-profile-name">
              {currentUser.name}
            </div>
            <div className="user-profile-role">
              {currentUser.customStatus || currentUser.role || 'PulseChat User'}
            </div>
          </div>
        </div>

        <div className="sidebar-header-actions">
          <button className="icon-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={onOpenSettings} title="Supabase & App Settings">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Backend Mode Banner */}
      <div className={`connection-banner ${isSupabaseConfigured ? 'connected' : 'demo'}`}>
        <div className="banner-content">
          {isSupabaseConfigured ? <Zap size={15} /> : <Sparkles size={15} />}
          <span>
            <span className="banner-badge">{isSupabaseConfigured ? 'Live' : 'Demo'}</span>
            {isSupabaseConfigured ? ' Supabase Connected' : ' Local Demo Mode'}
          </span>
        </div>
        <button className="banner-action-btn" onClick={onOpenSettings}>
          {isSupabaseConfigured ? 'Settings' : 'Connect'}
        </button>
      </div>

      {/* Search Bar & New Chat Button */}
      <div className="sidebar-search-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <button className="btn-new-chat" onClick={onOpenNewChat} title="Start conversation">
          <Plus size={16} />
          <span>New</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="sidebar-filter-tabs">
        <button
          className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          Unread
        </button>
        <button
          className={`filter-tab-btn ${activeFilter === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveFilter('direct')}
        >
          Direct
        </button>
        <button
          className={`filter-tab-btn ${activeFilter === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveFilter('channels')}
        >
          Channels
        </button>
        <button
          className={`filter-tab-btn ${activeFilter === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveFilter('favorites')}
        >
          Starred
        </button>
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        {sortedConversations.length === 0 ? (
          <div className="empty-list-state">
            <div>No conversations match "{searchQuery}"</div>
            <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => setSearchQuery('')}>
              Reset filter
            </button>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const otherUser = !conv.isGroup ? conv.participants.find((p) => p.id !== currentUser.id) : null;
            const isUserLastMsg = conv.lastMessage?.senderId === currentUser.id;

            return (
              <div
                key={conv.id}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="avatar-wrapper">
                  <img src={conv.avatar} alt={conv.name} className="avatar-img" />
                  {otherUser && <span className={`status-indicator status-${otherUser.status}`} />}
                </div>

                <div className="conv-item-content">
                  <div className="conv-item-top">
                    <span className="conv-item-name">
                      {conv.name}
                      {conv.isPinned && <Pin size={12} className="conv-pin-icon" />}
                    </span>
                    <span className="conv-item-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                  </div>

                  <div className="conv-item-bottom">
                    {conv.isTyping ? (
                      <span className="conv-typing-snippet">
                        <span className="typing-dot" style={{ width: '4px', height: '4px' }} />
                        typing...
                      </span>
                    ) : (
                      <span className="conv-item-preview">
                        {isUserLastMsg && (
                          <span className="status-ticks">
                            {conv.lastMessage?.status === 'read' ? (
                              <CheckCheck size={14} color="#38bdf8" />
                            ) : conv.lastMessage?.status === 'delivered' ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </span>
                        )}
                        {conv.lastMessage?.content || 'No messages yet'}
                      </span>
                    )}

                    {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
