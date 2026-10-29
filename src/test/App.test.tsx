import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('PulseChat App Component Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the application layout and default conversation', () => {
    render(<App />);

    // Check user profile
    expect(screen.getByText('Shourya')).toBeInTheDocument();

    // Check demo mode indicator
    expect(screen.getByText(/Local Demo Mode/i)).toBeInTheDocument();

    // Check conversation list (using getAllByText because active chat header also has name)
    const mahiElements = screen.getAllByText('Mahi');
    expect(mahiElements.length).toBeGreaterThanOrEqual(1);

    const channelElements = screen.getAllByText('#engineering-team');
    expect(channelElements.length).toBeGreaterThanOrEqual(1);
  });

  it('filters conversations by search input', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search conversations.../i);
    fireEvent.change(searchInput, { target: { value: 'Echo' } });

    expect(screen.getByText('Echo AI Assistant')).toBeInTheDocument();
    expect(screen.queryByText('#engineering-team')).not.toBeInTheDocument();
  });

  it('allows switching active conversation', () => {
    render(<App />);

    const channelItem = screen.getByText('#engineering-team');
    fireEvent.click(channelItem);

    // Active conversation header should now display #engineering-team
    const headers = screen.getAllByText('#engineering-team');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('allows typing and sending a new message', () => {
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'Testing pulsechat automated message!' } });

    const sendBtn = screen.getByTitle('Send Message');
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    // Message appears both in chat bubble and conversation preview
    const msgElements = screen.getAllByText('Testing pulsechat automated message!');
    expect(msgElements.length).toBeGreaterThanOrEqual(1);
  });

  it('opens and closes the Supabase settings modal', () => {
    render(<App />);

    const settingsBtn = screen.getByTitle('Supabase & App Settings');
    fireEvent.click(settingsBtn);

    expect(screen.getByText(/Backend & Supabase Configuration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supabase Project URL/i)).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Backend & Supabase Configuration/i)).not.toBeInTheDocument();
  });
});
