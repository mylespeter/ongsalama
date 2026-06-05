'use client';

import { Candidate, Winner } from '@/types';

interface Props {
  candidates: Candidate[];
  winner: Winner | null;
}

export default function ResultsChart({ candidates, winner }: Props) {
  const totalVotes = candidates.reduce((sum, c) => sum + parseInt(c.voteCount), 0);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">📊 Résultats Finaux</h2>
      
      {winner && (
        <div className="text-center mb-8 glass p-6 bg-yellow-500/10 border-yellow-500/30">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-3xl font-bold text-yellow-400">{winner.name}</p>
          <p className="text-gray-400 mt-2">
            {winner.voteCount} votes ({totalVotes > 0 ? ((parseInt(winner.voteCount) / totalVotes) * 100).toFixed(1) : 0}%)
          </p>
        </div>
      )}

      <div className="space-y-6">
        {candidates.map((candidate, index) => {
          const votes = parseInt(candidate.voteCount);
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

          return (
            <div key={candidate.id}>
              <div className="flex justify-between mb-2">
                <span className="font-bold">
                  {['🥇', '🥈', '🥉'][index] || '👤'} {candidate.name}
                </span>
                <span className="text-gray-400">{votes} votes ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
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