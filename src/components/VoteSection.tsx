'use client';

import { useState } from 'react';
import { Candidate } from '@/types';

interface Props {
  candidates: Candidate[];
  onVote: (candidateId: number) => Promise<void>;
}

export default function VoteSection({ candidates, onVote }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (selectedId === null) return;
    
    setLoading(true);
    try {
      await onVote(selectedId);
      setSelectedId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <h2 className="text-xl font-bold mb-4">✍️ Votez pour votre candidat</h2>
      
      <div className="space-y-3 mb-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => setSelectedId(parseInt(candidate.id))}
            className={`glass p-4 rounded-lg cursor-pointer transition-all ${
              selectedId === parseInt(candidate.id)
                ? 'border-purple-400 bg-purple-500/20'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedId === parseInt(candidate.id)
                  ? 'border-purple-400 bg-purple-400'
                  : 'border-gray-500'
              }`}>
                {selectedId === parseInt(candidate.id) && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <p className="font-bold">{candidate.name}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={selectedId === null || loading}
        className="btn-primary w-full text-lg"
      >
        {loading ? '⏳ Vote en cours...' : '🗳️ Voter'}
      </button>
    </div>
  );
}