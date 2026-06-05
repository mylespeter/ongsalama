'use client';

import { Candidate } from '@/types';

interface Props {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: Props) {
  if (candidates.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-6xl mb-4">📋</p>
        <p className="text-gray-400 text-lg">Aucun candidat pour le moment</p>
      </div>
    );
  }

  // Trouver le max de votes pour la barre de progression
  const maxVotes = Math.max(...candidates.map(c => parseInt(c.voteCount)), 1);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">👥 Candidats</h2>
      <div className="space-y-4">
        {candidates.map((candidate, index) => {
          const percentage = (parseInt(candidate.voteCount) / maxVotes) * 100;
          
          return (
            <div key={candidate.id} className="glass p-4 rounded-lg hover:bg-white/5 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{['🥇', '🥈', '🥉'][index] || '👤'}</span>
                  <div>
                    <p className="font-bold text-lg">{candidate.name}</p>
                    <p className="text-sm text-gray-400">ID: {candidate.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gradient">{candidate.voteCount}</p>
                  <p className="text-xs text-gray-400">votes</p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}