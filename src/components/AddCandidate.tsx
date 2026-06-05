'use client';

import { useState } from 'react';

interface Props {
  onAdd: (name: string) => Promise<void>;
}

export default function AddCandidate({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">➕ Ajouter un Candidat</h2>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du candidat..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary"
        >
          {loading ? '⏳...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}