'use client';

interface Props {
  votingOpen: boolean;
  onStartVoting: () => Promise<void>;
  onStopVoting: () => Promise<void>;
}

export default function AdminPanel({ votingOpen, onStartVoting, onStopVoting }: Props) {
  return (
    <div className="card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
      <h2 className="text-xl font-bold mb-4">👑 Panneau Admin</h2>
      
      <div className="flex gap-4">
        {!votingOpen ? (
          <button onClick={onStartVoting} className="btn-primary bg-green-500 hover:bg-green-600 flex-1">
            🟢 Ouvrir le Vote
          </button>
        ) : (
          <button onClick={onStopVoting} className="btn-primary bg-red-500 hover:bg-red-600 flex-1">
            🔴 Fermer le Vote
          </button>
        )}
      </div>
    </div>
  );
}