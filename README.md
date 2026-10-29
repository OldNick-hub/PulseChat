# PulseChat 💬✨

A modern, responsive real-time chat application built with **React**, **TypeScript**, and **Vite**. Features rich message bubbles, code blocks with syntax highlighting, emoji reactions, voice note simulations, mobile-first responsive layout, and a dual-mode architecture supporting both **Zero-Config Interactive Demo Mode** and **Live Supabase Real-time Cloud Sync**.

---

## 🚀 Quick Start: Launch the App

Navigate to the `chatapp` directory and launch the development server:

```bash
cd chatapp
npm run dev
```

The application will be live at: `http://localhost:5173`

---

## 🛠️ Available Scripts

Inside the `chatapp` directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `npm test` | Runs the automated Vitest test suite |
| `npm run build` | Compiles TypeScript declarations and outputs optimized production assets to `dist/` |
| `npm run preview` | Locally previews the production build |

---

## 🌟 Key Features

### 1. Dual-Mode Architecture (Local Demo vs Supabase)
- **✨ Interactive Local Demo Mode (Default)**:
  - Works **out of the box with zero API keys or configuration**.
  - Clearly labeled with a **Demo Mode badge** in the sidebar.
  - Preloaded with 5 rich conversations:
    - **Mahi** (Staff UI Architect) — discussing theme tokens and code architecture.
    - **#engineering-team** (Channel) — multi-participant discussions, CI/CD updates, and PR reviews.
    - **Echo AI Assistant** — interactive bot replying with coding snippets, advice, and tips.
    - **Aarav Sharma** (Product Designer) — sharing UI mockup screenshots with full lightbox preview.
    - **Ananya Patel** (QA Lead) — testing checklists and simulated voice memos.
  - **Simulated Real-time Auto-Responder**: Whenever you send a message, recipients trigger realistic typing indicators (`...`) and send contextual replies after 1–2 seconds!
  - **Local Persistence**: State, sent messages, reactions, theme preference, and profiles are safely stored in browser `localStorage`.

- **⚡ Supabase Real-Time Mode**:
  - Connect a live Supabase project by entering your `Supabase URL` and `Anon Key` in the in-app **Backend Settings modal** (or via `.env`).
  - Includes a built-in **Connection Tester** to verify credentials directly in the UI.
  - Automatically subscribes to Postgres Realtime changes on the `messages` table for live cross-device messaging.

---

### 2. Polished, Responsive UI & Aesthetics
- **Zero-Dependency Vanilla CSS**: Custom design system using modern CSS tokens (`index.css` & `App.css`), glassmorphism cards (`backdrop-filter: blur`), subtle border glows, and micro-animations.
- **Dark / Light Theme Switcher**: 1-click theme toggle with persistent user preference.
- **Dynamic Viewport Height (`100dvh`)**: Prevents mobile browser address bars and keyboards from causing layout jumping or clipped inputs.
- **Mobile-Responsive Drawer**: Seamless full-screen transition between conversation list and active chat with a mobile back button.

---

### 3. Messaging Capabilities
- **Message Types**:
  - **Formatted Text**: Multi-line, paragraph-spaced, responsive chat bubbles.
  - **Code Blocks**: Formatted with monospace typography, language pill, and a 1-click **Copy Code** button.
  - **Image Attachments**: Thumbnail cards with click-to-expand lightbox viewer.
  - **Voice Memos**: Simulated audio playback with animated sound waveforms and duration timers.
- **Delivery Status Indicators**: Sent (`✓`), Delivered (`✓✓`), and Read (`✓✓` in electric cyan).
- **Interactive Emoji Reactions**: Hover to trigger quick reactions (❤️, 👍, 🔥, 😂, 🎉, 🚀) with clickable reaction chips.
- **Quoted Replies**: Click reply on any message to attach a quoted preview snippet above the composer.
- **Quick Canned Suggestions**: Prompt chips for rapid reply testing.
- **Voice / Video Call Simulation**: Test simulated calling modal with audio waveform pulses, call timer, and mute controls.

---

## ⚙️ Connecting Supabase (Optional)

1. Open the application and click the **Settings** icon (or the **Connect** button in the sidebar banner).
2. Enter your **Supabase Project URL** and **Anon Key**.
3. Click **Test Connection** to verify connectivity.
4. Click **Save & Apply**.

Alternatively, create a `.env` file in the `chatapp` directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### PostgreSQL Database Schema
In the settings modal (or using the snippet below), paste this into the Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'online',
  custom_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  is_group BOOLEAN DEFAULT false,
  avatar TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  file_name TEXT,
  file_size TEXT,
  code_language TEXT,
  reply_to JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

---

## 🧪 Testing

PulseChat uses **Vitest** and **React Testing Library** for automated testing:

```bash
cd chatapp
npm test
```

Tests cover:
- Core demo dataset loading and persona validation.
- Simulated intelligent reply generator.
- App layout and header rendering.
- Real-time conversation search and filtering.
- Dynamic conversation switching.
- Message input and sending workflow.
- Supabase modal toggle and connection inputs.
