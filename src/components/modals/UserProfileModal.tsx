import React, { useState } from 'react';
import { X, UserCheck, Sparkles } from 'lucide-react';
import type { User, UserStatus } from '../../types/chat';
import { DEMO_USERS } from '../../data/demoData';
import { migrateUser } from '../../data/migration';

interface UserProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onSwitchUser: (newUser: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user: rawUser,
  onClose,
  onUpdateUser,
  onSwitchUser,
}) => {
  const user = migrateUser(rawUser);
  const [name, setName] = useState(user.name);
  const [customStatus, setCustomStatus] = useState(user.customStatus || '');
  const [status, setStatus] = useState<UserStatus>(user.status);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      customStatus: customStatus.trim(),
      status,
    });
    onClose();
  };

  const statusOptions: { label: string; value: UserStatus; color: string }[] = [
    { label: 'Online', value: 'online', color: 'var(--status-online)' },
    { label: 'Away', value: 'away', color: 'var(--status-away)' },
    { label: 'Do Not Disturb', value: 'busy', color: 'var(--status-busy)' },
    { label: 'Offline / Invisible', value: 'offline', color: 'var(--status-offline)' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <UserCheck size={20} color="var(--accent-primary)" />
            Profile & Persona Settings
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div className="avatar-wrapper">
                <img src={user.avatar} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                <span className={`status-indicator status-${status}`} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>{user.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{user.role}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Status</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 🚀 Shipping PulseChat v2.0"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: status === opt.value ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${status === opt.value ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onClick={() => setStatus(opt.value)}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Demo Identity */}
            <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <Sparkles size={14} color="var(--accent-cyan)" />
                Switch Demo Persona (Test Experience)
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.values(DEMO_USERS).map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: user.id === persona.id ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: user.id === persona.id ? '#ffffff' : 'var(--text-primary)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onSwitchUser(persona);
                      onClose();
                    }}
                  >
                    <img src={persona.avatar} alt={persona.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                    {persona.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
