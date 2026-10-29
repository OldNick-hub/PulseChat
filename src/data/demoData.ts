import type { User, Conversation, Message } from '../types/chat';

export const CURRENT_USER: User = {
  id: 'user-alex',
  name: 'Shourya',
  email: 'shourya@pulsechat.dev',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80',
  status: 'online',
  customStatus: '🚀 Shipping PulseChat v2.0',
  role: 'Senior Frontend Engineer',
  isCurrentUser: true,
};

export const DEMO_USERS: Record<string, User> = {
  'user-alex': CURRENT_USER,
  'user-sarah': {
    id: 'user-sarah',
    name: 'Mahi',
    email: 'mahi@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    customStatus: '⚡ Reviewing PRs & Architecture',
    role: 'Staff UI Architect',
  },
  'user-david': {
    id: 'user-david',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'away',
    customStatus: '🎨 In Figma wireframes',
    role: 'Product Designer',
  },
  'user-elena': {
    id: 'user-elena',
    name: 'Ananya Patel',
    email: 'ananya.patel@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'busy',
    customStatus: '🧪 Running automated test suites',
    role: 'QA Lead',
  },
  'user-rohan': {
    id: 'user-rohan',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    customStatus: '⚙️ Optimizing database queries',
    role: 'Backend Architect',
  },
  'user-priya': {
    id: 'user-priya',
    name: 'Priya Verma',
    email: 'priya.verma@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'away',
    customStatus: '☸️ Deploying cloud clusters',
    role: 'DevOps & Cloud Lead',
  },
  'user-kabir': {
    id: 'user-kabir',
    name: 'Kabir Shah',
    email: 'kabir.shah@pulsechat.dev',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'busy',
    customStatus: '📱 Testing React Native build',
    role: 'Mobile Engineer',
  },
  'user-echo': {
    id: 'user-echo',
    name: 'Echo AI Assistant',
    email: 'echo.bot@pulsechat.internal',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    customStatus: '✨ Always here to help',
    role: 'AI Assistant Bot',
  },
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-sarah',
    name: 'Mahi',
    isGroup: false,
    avatar: DEMO_USERS['user-sarah'].avatar,
    unreadCount: 2,
    isPinned: true,
    participants: [CURRENT_USER, DEMO_USERS['user-sarah']],
    description: 'Staff UI Architect • Frontend Platform',
  },
  {
    id: 'conv-engineering',
    name: '#engineering-team',
    isGroup: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=200&q=80',
    unreadCount: 0,
    isPinned: true,
    participants: [CURRENT_USER, DEMO_USERS['user-sarah'], DEMO_USERS['user-david'], DEMO_USERS['user-elena']],
    description: 'Core Engineering discussions, deployments, and PR reviews',
  },
  {
    id: 'conv-echo',
    name: 'Echo AI Assistant',
    isGroup: false,
    avatar: DEMO_USERS['user-echo'].avatar,
    unreadCount: 0,
    isPinned: false,
    participants: [CURRENT_USER, DEMO_USERS['user-echo']],
    description: 'Smart AI assistant for code analysis, troubleshooting, and automated replies',
  },
  {
    id: 'conv-david',
    name: 'Aarav Sharma',
    isGroup: false,
    avatar: DEMO_USERS['user-david'].avatar,
    unreadCount: 1,
    isPinned: false,
    participants: [CURRENT_USER, DEMO_USERS['user-david']],
    description: 'Product Designer • Design Systems',
  },
  {
    id: 'conv-elena',
    name: 'Ananya Patel',
    isGroup: false,
    avatar: DEMO_USERS['user-elena'].avatar,
    unreadCount: 0,
    isPinned: false,
    participants: [CURRENT_USER, DEMO_USERS['user-elena']],
    description: 'QA Lead • Test Automation',
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-sarah': [
    {
      id: 'm-sarah-1',
      conversationId: 'conv-sarah',
      senderId: 'user-sarah',
      senderName: 'Mahi',
      senderAvatar: DEMO_USERS['user-sarah'].avatar,
      content: 'Hey Shourya! Did you get a chance to inspect the new theme token implementation for the chat bubbles?',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '👍', count: 1, userIds: ['user-alex'] }],
    },
    {
      id: 'm-sarah-2',
      conversationId: 'conv-sarah',
      senderId: 'user-alex',
      senderName: 'Shourya',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Yes! The CSS variables structure is super clean. Check out how easy it is to toggle between glassmorphic dark and light themes now:',
      createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '🔥', count: 1, userIds: ['user-sarah'] }],
    },
    {
      id: 'm-sarah-3',
      conversationId: 'conv-sarah',
      senderId: 'user-alex',
      senderName: 'Shourya',
      senderAvatar: CURRENT_USER.avatar,
      content: `export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return { theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
};`,
      createdAt: new Date(Date.now() - 3600000 * 3.2).toISOString(),
      status: 'read',
      type: 'code',
      codeLanguage: 'typescript',
      reactions: [
        { emoji: '🚀', count: 2, userIds: ['user-sarah', 'user-alex'] },
        { emoji: '❤️', count: 1, userIds: ['user-sarah'] },
      ],
    },
    {
      id: 'm-sarah-4',
      conversationId: 'conv-sarah',
      senderId: 'user-sarah',
      senderName: 'Mahi',
      senderAvatar: DEMO_USERS['user-sarah'].avatar,
      content: 'Brilliant! I love that we kept it zero-dependency Vanilla CSS for maximum speed and control.',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'delivered',
      type: 'text',
      reactions: [{ emoji: '💯', count: 1, userIds: ['user-alex'] }],
    },
    {
      id: 'm-sarah-5',
      conversationId: 'conv-sarah',
      senderId: 'user-sarah',
      senderName: 'Mahi',
      senderAvatar: DEMO_USERS['user-sarah'].avatar,
      content: 'Are we all set to run the production build and test mobile responsiveness?',
      createdAt: new Date(Date.now() - 60000 * 15).toISOString(),
      status: 'delivered',
      type: 'text',
      reactions: [],
    },
  ],

  'conv-engineering': [
    {
      id: 'm-eng-1',
      conversationId: 'conv-engineering',
      senderId: 'user-sarah',
      senderName: 'Mahi',
      senderAvatar: DEMO_USERS['user-sarah'].avatar,
      content: '🚀 Daily Update: PulseChat v2.0 is getting ready! Sidebar filters, search indexing, and real-time Supabase replication are all in place.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [
        { emoji: '🎉', count: 3, userIds: ['user-alex', 'user-david', 'user-elena'] },
        { emoji: '🚀', count: 2, userIds: ['user-alex', 'user-sarah'] },
      ],
    },
    {
      id: 'm-eng-2',
      conversationId: 'conv-engineering',
      senderId: 'user-elena',
      senderName: 'Ananya Patel',
      senderAvatar: DEMO_USERS['user-elena'].avatar,
      content: 'Automated test suite reports 100% pass on component rendering, search query filtering, and demo conversation interactions!',
      createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '💪', count: 2, userIds: ['user-alex', 'user-sarah'] }],
    },
    {
      id: 'm-eng-3',
      conversationId: 'conv-engineering',
      senderId: 'user-david',
      senderName: 'Aarav Sharma',
      senderAvatar: DEMO_USERS['user-david'].avatar,
      content: 'The mobile sliding drawer transitions feel silky smooth at 60fps on iOS and Android viewports. Great job on the 100dvh viewport fix!',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '✨', count: 3, userIds: ['user-alex', 'user-sarah', 'user-elena'] }],
    },
    {
      id: 'm-eng-4',
      conversationId: 'conv-engineering',
      senderId: 'user-alex',
      senderName: 'Shourya',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Awesome team effort! Local demo mode works out-of-the-box with zero keys, and anyone with a Supabase URL + Anon key can toggle live sync instantly.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '❤️', count: 3, userIds: ['user-sarah', 'user-david', 'user-elena'] }],
    },
  ],

  'conv-echo': [
    {
      id: 'm-echo-1',
      conversationId: 'conv-echo',
      senderId: 'user-echo',
      senderName: 'Echo AI Assistant',
      senderAvatar: DEMO_USERS['user-echo'].avatar,
      content: '👋 Hi Shourya! I am your AI assistant in PulseChat. You can ask me for code snippets, troubleshooting tips, design ideas, or test our simulated conversation stream. What are we building today?',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '✨', count: 1, userIds: ['user-alex'] }],
    },
  ],

  'conv-david': [
    {
      id: 'm-david-1',
      conversationId: 'conv-david',
      senderId: 'user-david',
      senderName: 'Aarav Sharma',
      senderAvatar: DEMO_USERS['user-david'].avatar,
      content: 'Hey Shourya! Here is the latest dashboard and chat preview screenshot with glassmorphic cards and glowing badge accents:',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '🎨', count: 1, userIds: ['user-alex'] }],
    },
    {
      id: 'm-david-2',
      conversationId: 'conv-david',
      senderId: 'user-david',
      senderName: 'Aarav Sharma',
      senderAvatar: DEMO_USERS['user-david'].avatar,
      content: 'Chat Interface Visual Mockup',
      createdAt: new Date(Date.now() - 3600000 * 4.9).toISOString(),
      status: 'read',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      fileName: 'pulsechat-ui-preview.png',
      reactions: [
        { emoji: '🔥', count: 2, userIds: ['user-alex', 'user-david'] },
        { emoji: '😍', count: 1, userIds: ['user-alex'] },
      ],
    },
    {
      id: 'm-david-3',
      conversationId: 'conv-david',
      senderId: 'user-david',
      senderName: 'Aarav Sharma',
      senderAvatar: DEMO_USERS['user-david'].avatar,
      content: 'Let me know if the contrast ratio on the message status checkmarks meets WCAG AAA standards!',
      createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      status: 'delivered',
      type: 'text',
      reactions: [],
    },
  ],

  'conv-elena': [
    {
      id: 'm-elena-1',
      conversationId: 'conv-elena',
      senderId: 'user-elena',
      senderName: 'Ananya Patel',
      senderAvatar: DEMO_USERS['user-elena'].avatar,
      content: 'Quick heads up: I recorded a short voice note summarizing the accessibility test results for screen readers.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '🎧', count: 1, userIds: ['user-alex'] }],
    },
    {
      id: 'm-elena-2',
      conversationId: 'conv-elena',
      senderId: 'user-elena',
      senderName: 'Ananya Patel',
      senderAvatar: DEMO_USERS['user-elena'].avatar,
      content: 'Accessibility Audit Summary - 0:42',
      createdAt: new Date(Date.now() - 3600000 * 7.8).toISOString(),
      status: 'read',
      type: 'audio',
      audioDuration: '0:42',
      reactions: [{ emoji: '👏', count: 1, userIds: ['user-alex'] }],
    },
  ],
};

// Simulated smart reply generator for interactive local demo mode
export function getSimulatedResponse(conversationId: string, userMessageText: string): {
  sender: User;
  content: string;
  type: 'text' | 'code';
  codeLanguage?: string;
  delayMs: number;
} {
  const lower = userMessageText.toLowerCase();

  // If in Echo AI bot chat
  if (conversationId === 'conv-echo') {
    if (lower.includes('code') || lower.includes('typescript') || lower.includes('react')) {
      return {
        sender: DEMO_USERS['user-echo'],
        content: `Here is a clean React hook to handle message auto-scroll with user scroll detection:\n\nconst useAutoScroll = (dependencies: unknown[]) => {\n  const ref = useRef<HTMLDivElement>(null);\n  useEffect(() => {\n    ref.current?.scrollIntoView({ behavior: 'smooth' });\n  }, dependencies);\n  return ref;\n};`,
        type: 'code',
        codeLanguage: 'typescript',
        delayMs: 1400,
      };
    }
    if (lower.includes('supabase') || lower.includes('database') || lower.includes('realtime')) {
      return {
        sender: DEMO_USERS['user-echo'],
        content: 'PulseChat supports dual-mode operation! In Demo Mode, messages are stored in memory and localStorage. When you configure your Supabase URL & Anon Key in Settings, PulseChat seamlessly enables Postgres Realtime subscriptions over WebSockets! ⚡',
        type: 'text',
        delayMs: 1200,
      };
    }
    return {
      sender: DEMO_USERS['user-echo'],
      content: `I received your message: "${userMessageText}". Everything in the local demo pipeline is operating smoothly! What would you like to explore next?`,
      type: 'text',
      delayMs: 1000,
    };
  }

  // If in Mahi's chat
  if (conversationId === 'conv-sarah') {
    if (lower.includes('build') || lower.includes('deploy') || lower.includes('test')) {
      return {
        sender: DEMO_USERS['user-sarah'],
        content: 'Awesome! Let us run `npm run build` and verify all TypeScript declarations and bundle chunks are minified cleanly. 🚀',
        type: 'text',
        delayMs: 1500,
      };
    }
    if (lower.includes('design') || lower.includes('ui') || lower.includes('css')) {
      return {
        sender: DEMO_USERS['user-sarah'],
        content: 'The custom CSS variables and glassmorphism styling are looking really premium. The subtle border highlights give it a high-end feel!',
        type: 'text',
        delayMs: 1400,
      };
    }
    return {
      sender: DEMO_USERS['user-sarah'],
      content: `Got it, Shourya! Let's incorporate that into our sprint review. Thanks for following up on "${userMessageText}". 👍`,
      type: 'text',
      delayMs: 1600,
    };
  }

  // If in Engineering Channel
  if (conversationId === 'conv-engineering') {
    return {
      sender: DEMO_USERS['user-david'],
      content: `Agreed! I just checked the changes in the staging environment. Looking crisp and responsive across all screen sizes. 🔥`,
      type: 'text',
      delayMs: 1800,
    };
  }

  // If in Aarav's chat
  if (conversationId === 'conv-david') {
    return {
      sender: DEMO_USERS['user-david'],
      content: 'I will export the revised vector icons and color tokens in the design library. Thanks for the quick feedback! 🎨',
      type: 'text',
      delayMs: 1400,
    };
  }

  // Default fallback (Ananya)
  return {
    sender: DEMO_USERS['user-elena'],
    content: `Checked and logged into our verification checklist! All systems green. ✅`,
    type: 'text',
    delayMs: 1500,
  };
}
