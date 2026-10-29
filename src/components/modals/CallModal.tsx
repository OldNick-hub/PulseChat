import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import type { Conversation } from '../../types/chat';

interface CallModalProps {
  isOpen: boolean;
  type: 'voice' | 'video';
  conversation: Conversation | null;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ isOpen, type, conversation, onClose }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !conversation) return null;

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '420px', background: 'var(--bg-surface-elevated)' }} onClick={(e) => e.stopPropagation()}>
        <div className="call-modal-content">
          <div className="call-avatar-pulse">
            <img src={conversation.avatar} alt={conversation.name} className="call-avatar-img" />
          </div>

          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              {conversation.name}
            </h2>
            <div style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
              {seconds < 2 ? 'Connecting...' : `In ${type === 'video' ? 'Video' : 'Voice'} Call • ${formatDuration(seconds)}`}
            </div>
          </div>

          <div className="call-actions-row">
            <button
              className="call-action-circle ctrl"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff size={20} color="#f87171" /> : <Mic size={20} />}
            </button>

            {type === 'video' && (
              <button
                className="call-action-circle ctrl"
                onClick={() => setIsVideoOff(!isVideoOff)}
                title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              >
                {isVideoOff ? <VideoOff size={20} color="#f87171" /> : <Video size={20} />}
              </button>
            )}

            <button className="call-action-circle end" onClick={onClose} title="End call">
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
