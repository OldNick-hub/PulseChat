import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="modal-overlay"
      style={{ background: 'rgba(0, 0, 0, 0.88)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'absolute',
            top: '-45px',
            right: 0,
            display: 'flex',
            gap: '8px',
          }}
        >
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="icon-btn"
            style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)' }}
            title="Open original"
          >
            <ExternalLink size={18} />
          </a>
          <button
            className="icon-btn"
            style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)' }}
            onClick={onClose}
            title="Close image"
          >
            <X size={18} />
          </button>
        </div>

        <img
          src={imageUrl}
          alt={caption || 'Preview'}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            objectFit: 'contain',
          }}
        />

        {caption && (
          <div
            style={{
              color: '#ffffff',
              fontSize: '0.9rem',
              marginTop: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
