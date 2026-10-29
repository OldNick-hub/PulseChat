import { describe, it, expect } from 'vitest';
import {
  CURRENT_USER,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  getSimulatedResponse,
} from '../data/demoData';
import { getSupabaseCredentials } from '../lib/supabase';

describe('Chat Core Logic & Demo Data', () => {
  it('loads current user with valid default attributes', () => {
    expect(CURRENT_USER.id).toBe('user-alex');
    expect(CURRENT_USER.name).toBe('Shourya');
    expect(CURRENT_USER.status).toBe('online');
  });

  it('provides default demo conversations', () => {
    expect(INITIAL_CONVERSATIONS.length).toBeGreaterThanOrEqual(4);
    const mahiConv = INITIAL_CONVERSATIONS.find((c) => c.name === 'Mahi');
    expect(mahiConv).toBeDefined();
    expect(mahiConv?.isPinned).toBe(true);
  });

  it('provides pre-populated messages for conversations', () => {
    const mahiMsgs = INITIAL_MESSAGES['conv-sarah'];
    expect(mahiMsgs).toBeDefined();
    expect(mahiMsgs.length).toBeGreaterThan(0);
    expect(mahiMsgs[0].content).toContain('theme token');
  });

  it('generates simulated responses for Echo AI bot', () => {
    const response = getSimulatedResponse('conv-echo', 'Can you give me react typescript code?');
    expect(response.sender.name).toBe('Echo AI Assistant');
    expect(response.content).toBeDefined();
    expect(response.delayMs).toBeGreaterThan(0);
  });

  it('defaults to Demo Mode when no Supabase credentials are configured', () => {
    const creds = getSupabaseCredentials();
    // In test environment without env vars, isConfigured should be false
    expect(creds.isConfigured).toBe(false);
  });

  it('safely migrates stale cached users to Indian personas', async () => {
    const { migrateUser } = await import('../data/migration');
    const legacyAlex = {
      id: 'user-alex',
      name: 'Alex Morgan',
      email: 'alex.morgan@pulsechat.dev',
      avatar: 'old-avatar.png',
      status: 'online' as const,
    };
    const migratedAlex = migrateUser(legacyAlex);
    expect(migratedAlex.name).toBe('Shourya');

    const legacySarah = {
      id: 'user-sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.j@pulsechat.dev',
      avatar: 'old-avatar.png',
      status: 'online' as const,
    };
    const migratedSarah = migrateUser(legacySarah);
    expect(migratedSarah.name).toBe('Mahi');
  });

  it('safely migrates conversations and channel member lists', async () => {
    const { migrateConversation } = await import('../data/migration');
    const legacyConv = {
      id: 'conv-engineering',
      name: '#engineering-team',
      isGroup: true,
      avatar: 'team.png',
      unreadCount: 0,
      isPinned: true,
      participants: [
        { id: 'user-alex', name: 'Alex Morgan', email: 'alex@dev', avatar: '', status: 'online' as const },
        { id: 'user-sarah', name: 'Sarah Jenkins', email: 'sarah@dev', avatar: '', status: 'online' as const },
        { id: 'user-david', name: 'David Kim', email: 'david@dev', avatar: '', status: 'away' as const },
        { id: 'user-elena', name: 'Elena Rostova', email: 'elena@dev', avatar: '', status: 'busy' as const },
      ],
    };

    const migrated = migrateConversation(legacyConv);
    expect(migrated.participants[0].name).toBe('Shourya');
    expect(migrated.participants[1].name).toBe('Mahi');
    expect(migrated.participants[2].name).toBe('Aarav Sharma');
    expect(migrated.participants[3].name).toBe('Ananya Patel');
  });
});
