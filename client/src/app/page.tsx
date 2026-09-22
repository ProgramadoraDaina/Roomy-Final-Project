'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/api';

const NAME_KEY = 'roomy:userName';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem(NAME_KEY, name.trim());
    setLoading(true);
    setError(null);
    try {
      const room = await createRoom(`Reunión de ${name.trim()}`);
      router.push(`/room/${room.code}`);
    } catch {
      setError('No se pudo crear la reunión. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  }

  function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !name.trim()) return;
    localStorage.setItem(NAME_KEY, name.trim());
    router.push(`/room/${joinCode.trim()}`);
  }

  return (
    <div className="card">
      <h1>Roomy</h1>
      <p className="subtitle">Videollamadas simples, en el navegador.</p>

      <form onSubmit={handleCreate}>
        <label htmlFor="display-name">Tu nombre</label>
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Cómo te llamás?"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear reunión'}
        </button>
      </form>

      <div className="divider">o unite a una existente</div>

      <form className="join-row" onSubmit={handleJoin}>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="abc-defg-hij"
        />
        <button type="submit" className="secondary">
          Unirse
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
