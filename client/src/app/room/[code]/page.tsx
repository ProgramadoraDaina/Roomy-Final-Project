'use client';

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Socket } from 'socket.io-client';
import { createRoomSocket } from '@/lib/socket';

const NAME_KEY = 'roomy:userName';

interface ChatMessage {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [userName] = useState(() => localStorage.getItem(NAME_KEY) || 'Invitado');
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!code) return;

    const socket = createRoomSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      socket.emit('joinRoom', { code, userName });
    });

    socket.on('error', ({ message }: { message: string }) => {
      setNotice(message);
      setTimeout(() => router.push('/'), 2000);
    });

    socket.on('roomHistory', (history: ChatMessage[]) => setMessages(history));
    socket.on('roomUsers', (list: string[]) => setUsers(list));

    socket.on('userJoined', ({ userName: joined }: { userName: string }) => {
      setUsers((prev) => (prev.includes(joined) ? prev : [...prev, joined]));
      setNotice(`${joined} se unió a la sala`);
    });

    socket.on('userLeft', ({ userName: left }: { userName: string }) => {
      setUsers((prev) => prev.filter((u) => u !== left));
      setNotice(`${left} salió de la sala`);
    });

    socket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [code, userName, router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    socketRef.current?.emit('sendMessage', { content: draft.trim() });
    setDraft('');
  }

  function handleLeave(e: MouseEvent) {
    e.preventDefault();
    router.push('/');
  }

  return (
    <div className="room-layout">
      <div className="room-header">
        <div>
          <strong>Roomy</strong> <span className="code">{code}</span>
        </div>
        <a href="/" onClick={handleLeave}>
          Salir
        </a>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <div className="room-body">
        <div className="users-panel">
          <h3>En la sala ({users.length})</h3>
          <ul>
            {users.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>

        <div className="chat-panel">
          <ul id="messages" ref={listRef}>
            {messages.map((m) => (
              <li key={m.id} className="message">
                <span className="author">{m.authorName}</span>
                {m.content}
              </li>
            ))}
          </ul>
          <form id="message-form" onSubmit={handleSend}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribí un mensaje..."
              autoComplete="off"
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
