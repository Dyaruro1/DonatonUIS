import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

export function RealtimeChat({ roomName, username, messages: initialMessages = [], onMessage }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Load initial messages if not provided
  useEffect(() => {
    if (initialMessages.length === 0) {
      supabase
        .from('messages')
        .select('*')
        .eq('room', roomName)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) setMessages(data);
        });
    }
  }, [roomName, initialMessages]);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel('realtime:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${roomName}` }, (payload) => {
        setMessages((msgs) => [...msgs, payload.new]);
        if (onMessage) onMessage([...messages, payload.new]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, onMessage, messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await supabase.from('messages').insert({
      room: roomName,
      content: input,
      user: { name: username },
      username,
    });
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 320, background: '#e3e3e3', borderRadius: 24, boxShadow: '0 2px 16px #0002', position: 'relative', padding: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.2rem' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 8, background: '#fff', borderRadius: 8, padding: '0.5rem 1.2rem', width: 'fit-content', color: '#23233a', fontWeight: msg.user?.name === username ? 700 : 500 }}>
            <span style={{ color: '#21e058', marginRight: 8 }}>{msg.user?.name || msg.username}:</span> {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: '#e3e3e3', borderRadius: '0 0 24px 24px', padding: '1.1rem 1.5rem', position: 'absolute', bottom: 0, left: 0 }}>
        <input
          type="text"
          placeholder="Escribe un mensaje"
          style={{ flex: 1, border: 'none', borderRadius: 18, padding: '0.7rem 1.2rem', fontSize: 16, outline: 'none', background: '#fff', color: '#23233a' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="#21e058"/></svg>
        </button>
      </form>
    </div>
  );
}
