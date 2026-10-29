import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  X,
  Image as ImageIcon,
  Code,
  FileText,
  Volume2,
} from 'lucide-react';
import type { Message, MessageType } from '../types/chat';

interface MessageComposerProps {
  onSendMessage: (
    content: string,
    type?: MessageType,
    mediaUrl?: string,
    replyTo?: Message['replyTo'],
    codeLanguage?: string,
    audioDuration?: string
  ) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const EMOJI_PALETTE = [
  '😀', '😂', '😍', '🚀', '🔥', '🎉',
  '👍', '👏', '❤️', '✨', '💯', '💡',
  '⚡', '🛠️', '🎯', '💬', '📦', '😎',
  '🥳', '🙌', '🤝', '⭐', '🌈', '☕',
];

const QUICK_SUGGESTIONS = [
  'Looks great! 👍',
  'Ready to deploy 🚀',
  'Can you review this? 👀',
  'All tests passing! ✨',
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const replyData = replyingTo
      ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content.substring(0, 80),
        }
      : undefined;

    // Check if user is sending a code block (starts with ```)
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      const lines = trimmed.slice(3, -3).trim().split('\n');
      const firstLine = lines[0]?.trim();
      const codeLang = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : 'typescript';
      const codeBody = codeLang === firstLine ? lines.slice(1).join('\n') : lines.join('\n');
      onSendMessage(codeBody, 'code', undefined, replyData, codeLang);
    } else {
      onSendMessage(trimmed, 'text', undefined, replyData);
    }

    setText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    if (replyingTo) onCancelReply();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onSendMessage(
        file.name,
        'image',
        base64,
        replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderName, content: replyingTo.content } : undefined
      );
      if (replyingTo) onCancelReply();
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const sendDemoAttachment = (type: 'image' | 'code' | 'audio') => {
    if (type === 'image') {
      onSendMessage(
        'Feature preview design mockup',
        'image',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
      );
    } else if (type === 'code') {
      onSendMessage(
        `// PulseChat WebSocket Dispatcher
export function dispatchRealtime(channel: string, payload: unknown) {
  return supabase.channel(channel).send({
    type: 'broadcast',
    event: 'message',
    payload,
  });
}`,
        'code',
        undefined,
        undefined,
        'typescript'
      );
    } else if (type === 'audio') {
      onSendMessage('Voice Note (0:28)', 'audio', undefined, undefined, undefined, '0:28');
    }
    setShowAttachmentMenu(false);
  };

  return (
    <div className="composer-wrapper">
      {/* Replying banner */}
      {replyingTo && (
        <div className="composer-reply-banner">
          <div className="composer-reply-content">
            <span className="composer-reply-title">Replying to {replyingTo.senderName}</span>
            <span className="composer-reply-text">{replyingTo.content}</span>
          </div>
          <button className="icon-btn" onClick={onCancelReply} aria-label="Cancel reply">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="suggestion-chips-row">
        {QUICK_SUGGESTIONS.map((chip) => (
          <button
            key={chip}
            className="suggestion-chip"
            onClick={() => {
              setText(chip);
              textareaRef.current?.focus();
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Main Composer Box */}
      <div className="composer-box">
        <div className="composer-actions-left">
          <button
            type="button"
            className={`icon-btn ${showAttachmentMenu ? 'active' : ''}`}
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
            title="Attach file or demo asset"
          >
            <Paperclip size={18} />
          </button>

          <button
            type="button"
            className={`icon-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
            }}
            title="Insert emoji"
          >
            <Smile size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Type a message or paste code with ```... (Enter to send)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <div className="composer-actions-right">
          <button
            type="button"
            className="icon-btn"
            onClick={() => sendDemoAttachment('audio')}
            title="Simulate Voice Memo"
          >
            <Mic size={18} />
          </button>

          <button
            type="button"
            className="btn-send-message"
            onClick={handleSend}
            disabled={!text.trim()}
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Hidden File Input for Image/File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="emoji-popover">
          <div className="emoji-grid">
            {EMOJI_PALETTE.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => handleSelectEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Menu Popover */}
      {showAttachmentMenu && (
        <div className="attachment-popover">
          <button
            className="attachment-opt-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={16} color="var(--accent-primary)" />
            Upload Local Image
          </button>
          <button
            className="attachment-opt-btn"
            onClick={() => sendDemoAttachment('image')}
          >
            <FileText size={16} color="var(--accent-cyan)" />
            Send Sample Mockup
          </button>
          <button
            className="attachment-opt-btn"
            onClick={() => sendDemoAttachment('code')}
          >
            <Code size={16} color="var(--status-online)" />
            Send Code Snippet
          </button>
          <button
            className="attachment-opt-btn"
            onClick={() => sendDemoAttachment('audio')}
          >
            <Volume2 size={16} color="var(--status-away)" />
            Send Voice Memo
          </button>
        </div>
      )}
    </div>
  );
};
