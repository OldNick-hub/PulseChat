import React, { useState, useEffect, useCallback } from 'react';
import type { Message, Conversation, User, MessageType } from './types/chat';
import {
  CURRENT_USER,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  getSimulatedResponse,
} from './data/demoData';
import { getSupabaseCredentials, getSupabaseClient } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { ChatDetailsDrawer } from './components/ChatDetailsDrawer';
import {
  migrateUser,
  migrateConversation,
  migrateConversations,
  migrateMessagesMap,
  cleanupLegacyStorage,
} from './data/migration';
import { SupabaseSettingsModal } from './components/modals/SupabaseSettingsModal';
import { NewChatModal } from './components/modals/NewChatModal';
import { CallModal } from './components/modals/CallModal';
import { ImageLightboxModal } from './components/modals/ImageLightboxModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import './App.css';

const STORAGE_KEY_CONVS = 'pulsechat_conversations_v4';
const STORAGE_KEY_MSGS = 'pulsechat_messages_v4';
const STORAGE_KEY_THEME = 'pulsechat_theme_v4';
const STORAGE_KEY_USER = 'pulsechat_user_v4';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    cleanupLegacyStorage();
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return migrateUser(parsed);
      } catch {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER;
  });

  const handleUpdateUser = (updated: User) => {
    const migrated = migrateUser(updated);
    setCurrentUser(migrated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(migrated));
  };

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = migrateConversations(parsed);
        return migrated.length > 0 ? migrated : INITIAL_CONVERSATIONS;
      } catch {
        return INITIAL_CONVERSATIONS;
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  // Messages state
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MSGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return migrateMessagesMap(parsed);
      } catch {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  // Active conversation
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0]?.id || 'conv-sarah'
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: 'voice' | 'video' }>({
    isOpen: false,
    type: 'voice',
  });
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    caption?: string;
  }>({
    isOpen: false,
    imageUrl: null,
  });

  // Replying state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Details drawer state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // In-chat search
  const [searchInChat, setSearchInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');

  // Mobile navigation state
  const [mobileActivePane, setMobileActivePane] = useState<'sidebar' | 'chat'>('chat');

  // Supabase connection state
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => {
    return getSupabaseCredentials().isConfigured;
  });

  const refreshSupabaseStatus = useCallback(() => {
    setIsSupabaseConfigured(getSupabaseCredentials().isConfigured);
  }, []);

  // Supabase Real-time Listener (if credentials configured)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel('pulsechat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newRow = payload.new as any;
          if (!newRow || newRow.sender_id === currentUser.id) return;

          const incomingMsg: Message = {
            id: newRow.id,
            conversationId: newRow.conversation_id,
            senderId: newRow.sender_id || 'remote-user',
            senderName: newRow.sender_name || 'Collaborator',
            senderAvatar: newRow.sender_avatar,
            content: newRow.content,
            createdAt: newRow.created_at || new Date().toISOString(),
            status: 'delivered',
            type: newRow.type || 'text',
            mediaUrl: newRow.media_url,
            reactions: [],
          };

          setMessagesMap((prev) => {
            const list = prev[incomingMsg.conversationId] || [];
            if (list.some((m) => m.id === incomingMsg.id)) return prev;
            return {
              ...prev,
              [incomingMsg.conversationId]: [...list, incomingMsg],
            };
          });

          // Update conversation last message
          setConversations((prev) =>
            prev.map((c) =>
              c.id === incomingMsg.conversationId
                ? {
                    ...c,
                    lastMessage: incomingMsg,
                    unreadCount: c.id === activeConversationId ? c.unreadCount : c.unreadCount + 1,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, activeConversationId]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConversation ? messagesMap[activeConversation.id] || [] : [];

  // Reset unread count when switching to a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileActivePane('chat');
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    type: MessageType = 'text',
    mediaUrl?: string,
    replyTo?: Message['replyTo'],
    codeLanguage?: string,
    audioDuration?: string
  ) => {
    if (!activeConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
      type,
      mediaUrl,
      codeLanguage,
      audioDuration,
      replyTo,
      reactions: [],
    };

    // 1. Optimistic state update
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, lastMessage: newMsg } : c
      )
    );

    // 2. Real Supabase insert if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('messages').insert({
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_avatar: currentUser.avatar,
          content,
          type,
          media_url: mediaUrl,
          code_language: codeLanguage,
        });
      } catch (err) {
        console.warn('Supabase message sync error (falling back to local):', err);
      }
    }

    // 3. In Demo Mode (or if messaging bot/contacts): trigger simulated reply
    if (!supabase || activeConversation.id === 'conv-echo' || activeConversation.id === 'conv-sarah' || activeConversation.id === 'conv-david' || activeConversation.id === 'conv-engineering') {
      const simulated = getSimulatedResponse(activeConversation.id, content);

      // Trigger typing indicator
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id ? { ...c, isTyping: true } : c
          )
        );
      }, 500);

      // Deliver simulated reply
      setTimeout(() => {
        const replyMsg: Message = {
          id: `reply-${Date.now()}`,
          conversationId: activeConversation.id,
          senderId: simulated.sender.id,
          senderName: simulated.sender.name,
          senderAvatar: simulated.sender.avatar,
          content: simulated.content,
          createdAt: new Date().toISOString(),
          status: 'delivered',
          type: simulated.type,
          codeLanguage: simulated.codeLanguage,
          reactions: [],
        };

        setMessagesMap((prev) => ({
          ...prev,
          [activeConversation.id]: [...(prev[activeConversation.id] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, isTyping: false, lastMessage: replyMsg }
              : c
          )
        );
      }, simulated.delayMs + 600);
    }
  };

  // Toggle reaction
  const handleReaction = (messageId: string, emoji: string) => {
    if (!activeConversation) return;

    setMessagesMap((prev) => {
      const list = prev[activeConversation.id] || [];
      const updated = list.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = [...msg.reactions];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

        if (existingIdx >= 0) {
          const item = reactions[existingIdx];
          const hasUser = item.userIds.includes(currentUser.id);
          if (hasUser) {
            // Remove user reaction
            const newUserIds = item.userIds.filter((id) => id !== currentUser.id);
            if (newUserIds.length === 0) {
              reactions.splice(existingIdx, 1);
            } else {
              reactions[existingIdx] = {
                ...item,
                count: item.count - 1,
                userIds: newUserIds,
              };
            }
          } else {
            // Add user reaction to existing emoji
            reactions[existingIdx] = {
              ...item,
              count: item.count + 1,
              userIds: [...item.userIds, currentUser.id],
            };
          }
        } else {
          // New reaction
          reactions.push({
            emoji,
            count: 1,
            userIds: [currentUser.id],
          });
        }

        return { ...msg, reactions };
      });

      return { ...prev, [activeConversation.id]: updated };
    });
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => {
      const list = prev[activeConversation.id] || [];
      return {
        ...prev,
        [activeConversation.id]: list.filter((m) => m.id !== messageId),
      };
    });
  };

  // Clear chat history
  const handleClearHistory = (convId: string) => {
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [],
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, lastMessage: undefined } : c))
    );
  };

  // Toggle pin
  const handleTogglePin = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // New conversation created
  const handleConversationCreated = (newConv: Conversation) => {
    const migrated = migrateConversation(newConv);
    setConversations((prev) => [migrated, ...prev.filter((c) => c.id !== migrated.id)]);
    setActiveConversationId(migrated.id);
    setMobileActivePane('chat');
  };

  return (
    <div className="chat-layout">
      {/* Sidebar with search, filters, and list */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewChat={() => setIsNewChatOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
        theme={theme}
        onToggleTheme={toggleTheme}
        isMobileHidden={mobileActivePane === 'chat'}
      />

      {/* Main Chat Area */}
      {activeConversation ? (
        <main className={`chat-main ${mobileActivePane === 'sidebar' ? 'mobile-hidden' : ''}`}>
          <ChatHeader
            conversation={activeConversation}
            currentUser={currentUser}
            onBack={() => setMobileActivePane('sidebar')}
            onStartCall={(type) => setCallModal({ isOpen: true, type })}
            onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
            isDetailsOpen={isDetailsOpen}
            onToggleSearchInChat={() => setSearchInChat(!searchInChat)}
          />

          {searchInChat && (
            <div
              style={{
                padding: '8px 20px',
                background: 'var(--bg-surface-elevated)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                className="search-input"
                style={{ padding: '6px 12px' }}
                placeholder="Search words in this chat..."
                value={searchInChatQuery}
                onChange={(e) => setSearchInChatQuery(e.target.value)}
                autoFocus
              />
              <button
                className="icon-btn"
                onClick={() => {
                  setSearchInChat(false);
                  setSearchInChatQuery('');
                }}
              >
                ✕
              </button>
            </div>
          )}

          <MessageList
            messages={activeMessages}
            currentUser={currentUser}
            conversation={activeConversation}
            onReaction={handleReaction}
            onReply={(msg) => setReplyingTo(msg)}
            onDeleteMessage={handleDeleteMessage}
            onOpenImageLightbox={(imageUrl, caption) =>
              setLightbox({ isOpen: true, imageUrl, caption })
            }
            searchFilter={searchInChatQuery}
          />

          <MessageComposer
            onSendMessage={handleSendMessage}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </main>
      ) : (
        <main className="chat-main" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-list-state">
            <h2>Select a conversation to start chatting</h2>
          </div>
        </main>
      )}

      {/* Details Drawer */}
      {isDetailsOpen && activeConversation && (
        <ChatDetailsDrawer
          conversation={activeConversation}
          currentUser={currentUser}
          onClose={() => setIsDetailsOpen(false)}
          onTogglePin={handleTogglePin}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* Modals */}
      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={refreshSupabaseStatus}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onConversationCreated={handleConversationCreated}
        existingConversations={conversations}
      />

      <CallModal
        isOpen={callModal.isOpen}
        type={callModal.type}
        conversation={activeConversation}
        onClose={() => setCallModal({ isOpen: false, type: 'voice' })}
      />

      <ImageLightboxModal
        isOpen={lightbox.isOpen}
        imageUrl={lightbox.imageUrl}
        caption={lightbox.caption}
        onClose={() => setLightbox({ isOpen: false, imageUrl: null })}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        user={currentUser}
        onClose={() => setIsProfileOpen(false)}
        onUpdateUser={handleUpdateUser}
        onSwitchUser={(newUser) => {
          const migrated = migrateUser(newUser);
          setCurrentUser(migrated);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(migrated));
        }}
      />
    </div>
  );
};

export default App;
