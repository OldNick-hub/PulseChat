import React, { useState } from 'react';
import { Database, Check, Copy, X, RefreshCw, Zap } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'schema'>('credentials');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    saveSupabaseCredentials(url, anonKey);
    onConfigUpdated();
    onClose();
  };

  const handleResetToDemo = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigUpdated();
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="supabase-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="supabase-modal-title">
            <Database size={22} color="var(--accent-primary)" />
            Backend & Supabase Configuration
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
          <button
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'credentials' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'credentials' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
            onClick={() => setActiveTab('credentials')}
          >
            Connection & Credentials
          </button>
          <button
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'schema' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'schema' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
            onClick={() => setActiveTab('schema')}
          >
            PostgreSQL Schema (SQL)
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'credentials' ? (
            <>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: currentCreds.isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                  border: `1px solid ${currentCreds.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Zap size={22} color={currentCreds.isConfigured ? 'var(--status-online)' : 'var(--accent-primary)'} />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    Current Mode: {currentCreds.isConfigured ? '⚡ Live Supabase Realtime' : '✨ Interactive Local Demo'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {currentCreds.isConfigured
                      ? 'Authenticated and ready for cloud synchronization and live channels.'
                      : 'Running without API keys. All conversations, simulated replies, and local storage work immediately.'}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="supabase-url">
                  Supabase Project URL
                </label>
                <input
                  id="supabase-url"
                  className="form-input"
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="supabase-key">
                  Supabase Anon Public API Key
                </label>
                <input
                  id="supabase-key"
                  className="form-input"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                />
              </div>

              {testResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    color: testResult.success ? '#34d399' : '#f87171',
                  }}
                >
                  {testResult.message}
                </div>
              )}

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                💡 <strong>Tip:</strong> You can also set <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file. Credentials saved here will take precedence.
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Copy and paste this SQL query into your Supabase SQL Editor:
                </div>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={handleCopySchema}>
                  {copiedSchema ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  {copiedSchema ? 'Copied!' : 'Copy SQL Schema'}
                </button>
              </div>

              <pre
                style={{
                  background: '#0d1117',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#e6edf3',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  lineHeight: '1.4',
                }}
              >
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </>
          )}
        </div>

        <div className="modal-footer">
          {currentCreds.isConfigured && (
            <button className="btn-danger" style={{ marginRight: 'auto' }} onClick={handleResetToDemo}>
              Revert to Demo Mode
            </button>
          )}
          {activeTab === 'credentials' && (
            <button className="btn-secondary" onClick={handleTestConnection} disabled={testing}>
              <RefreshCw size={14} className={testing ? 'rotating' : ''} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          )}
          <button className="btn-primary" onClick={handleSave}>
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
