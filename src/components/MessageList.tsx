import React, { useRef, useEffect, useState } from 'react';
import {
  Check,
  CheckCheck,
  CornerUpLeft,
  Copy,
  Trash2,
  Play,
  Pause,
  ChevronDown,
} from 'lucide-react';
import type { Message, User, Conversation } from '../types/chat';
import { migrateMessage } from '../data/migration';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  conversation: Conversation;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenImageLightbox: (imageUrl: string, caption?: string) => void;
  searchFilter?: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '🔥', '😂', '🎉', '🚀'];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  conversation,
  onReaction,
  onReply,
  onDeleteMessage,
  onOpenImageLightbox,
  searchFilter = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversation.isTyping]);

  // Scroll listener for "Scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  const formatMessageTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (isoString: string) => {
    const msgDate = new Date(isoString);
    const today = new Date();
    if (msgDate.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by calendar day
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((rawMsg) => {
    const msg = migrateMessage(rawMsg);
    if (searchFilter.trim() && !msg.content.toLowerCase().includes(searchFilter.toLowerCase())) {
      return;
    }
    const dateLabel = formatDateHeader(msg.createdAt);
    let group = groupedMessages.find((g) => g.date === dateLabel);
    if (!group) {
      group = { date: dateLabel, msgs: [] };
      groupedMessages.push(group);
    }
    group.msgs.push(msg);
  });

  return (
    <div className="messages-container" ref={containerRef} onScroll={handleScroll}>
      {groupedMessages.length === 0 ? (
        <div className="empty-list-state" style={{ height: '300px' }}>
          <div>{searchFilter ? 'No messages match your search.' : 'No messages yet. Say hello! 👋'}</div>
        </div>
      ) : (
        groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <div className="date-divider">
              <span>{group.date}</span>
            </div>

            {group.msgs.map((msg) => {
              const isOutgoing = msg.senderId === currentUser.id;
              const hasReactions = msg.reactions && msg.reactions.length > 0;

              return (
                <div key={msg.id} className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                  {!isOutgoing && (
                    <img
                      src={msg.senderAvatar || conversation.avatar}
                      alt={msg.senderName}
                      className="message-avatar"
                    />
                  )}

                  <div className="message-bubble-wrapper">
                    {!isOutgoing && conversation.isGroup && (
                      <span className="message-sender-name">{msg.senderName}</span>
                    )}

                    {/* Floating Hover Toolbar */}
                    <div className="message-actions-toolbar">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          className="toolbar-btn"
                          onClick={() => onReaction(msg.id, emoji)}
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        className="toolbar-btn"
                        onClick={() => onReply(msg)}
                        title="Reply to message"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                      {isOutgoing && (
                        <button
                          className="toolbar-btn"
                          onClick={() => onDeleteMessage(msg.id)}
                          title="Delete message"
                        >
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      )}
                    </div>

                    <div className="message-bubble">
                      {/* Quoted message if this is a reply */}
                      {msg.replyTo && (
                        <div className="quoted-reply-preview">
                          <div className="quoted-sender">{msg.replyTo.senderName}</div>
                          <div className="quoted-snippet">{msg.replyTo.content}</div>
                        </div>
                      )}

                      {/* Content rendering based on message type */}
                      {msg.type === 'text' && (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      )}

                      {msg.type === 'code' && (
                        <div className="code-block-wrapper">
                          <div className="code-block-header">
                            <span>{msg.codeLanguage || 'code'}</span>
                            <button
                              className="code-copy-btn"
                              onClick={() => handleCopyCode(msg.content, msg.id)}
                            >
                              <Copy size={12} />
                              {copiedCodeId === msg.id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="code-content">{msg.content}</pre>
                        </div>
                      )}

                      {msg.type === 'image' && msg.mediaUrl && (
                        <div>
                          <img
                            src={msg.mediaUrl}
                            alt={msg.fileName || 'Attachment'}
                            className="message-image-attachment"
                            onClick={() => onOpenImageLightbox(msg.mediaUrl!, msg.fileName)}
                          />
                          {msg.content && msg.content !== msg.fileName && (
                            <div style={{ marginTop: '6px', fontSize: '0.85rem' }}>{msg.content}</div>
                          )}
                        </div>
                      )}

                      {msg.type === 'audio' && (
                        <div className="audio-voice-note">
                          <button
                            className="audio-play-btn"
                            onClick={() =>
                              setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                            }
                          >
                            {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <div className="waveform-bars">
                            {[16, 22, 10, 26, 14, 18, 24, 12, 20, 16, 22, 14].map((h, i) => (
                              <div
                                key={i}
                                className="wave-bar"
                                style={{
                                  height: `${h}px`,
                                  opacity: playingAudioId === msg.id ? 1 : 0.6,
                                  animationPlayState: playingAudioId === msg.id ? 'running' : 'paused',
                                }}
                              />
                            ))}
                          </div>
                          <span className="audio-duration">{msg.audioDuration || '0:35'}</span>
                        </div>
                      )}

                      {/* Message Meta & Delivery Status */}
                      <div className="message-meta">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isOutgoing && (
                          <span
                            className={`status-ticks ${msg.status === 'read' ? 'read' : ''}`}
                            title={`Status: ${msg.status}`}
                          >
                            {msg.status === 'read' ? (
                              <CheckCheck size={14} />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck size={14} />
                            ) : msg.status === 'sent' ? (
                              <Check size={14} />
                            ) : (
                              <span style={{ fontSize: '0.65rem' }}>⏱</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reaction chips below bubble */}
                    {hasReactions && (
                      <div className="reaction-chips-row">
                        {msg.reactions.map((react) => {
                          const hasUserReacted = react.userIds.includes(currentUser.id);
                          return (
                            <button
                              key={react.emoji}
                              className={`reaction-chip ${hasUserReacted ? 'user-reacted' : ''}`}
                              onClick={() => onReaction(msg.id, react.emoji)}
                              title={react.userIds.length > 0 ? `${react.count} reaction` : ''}
                            >
                              <span>{react.emoji}</span>
                              <span>{react.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))
      )}

      {/* Typing Indicator */}
      {conversation.isTyping && (
        <div className="typing-bubble-row">
          <img src={conversation.avatar} alt="Typing" className="message-avatar" />
          <div className="typing-bubble">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          className="btn-scroll-bottom"
          onClick={scrollToBottom}
          title="Scroll to latest message"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
};
