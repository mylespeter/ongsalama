'use client';

import { useState, useEffect } from 'react';
import { votingContract } from '@/lib/contract';

interface Props {
  accounts: string[];
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  owner: string;
  isOwner: boolean;
}

export default function AccountInfo({ accounts, selectedAccount, onAccountChange, owner, isOwner }: Props) {
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (selectedAccount) {
      votingContract.getBalance(selectedAccount).then(setBalance);
    }
  }, [selectedAccount]);

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Compte sélectionné
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            className="input-field"
          >
            {accounts.map((acc, i) => (
              <option key={acc} value={acc} className="bg-gray-800">
                [{i}] {acc.substring(0, 15)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="glass px-4 py-3 rounded-lg text-center">
            <p className="text-xs text-gray-400">Balance</p>
            <p className="font-bold text-lg">{parseFloat(balance).toFixed(2)} ETH</p>
          </div>

          <div className="glass px-4 py-3 rounded-lg text-center">
            <p className="text-xs text-gray-400">Rôle</p>
            <p className={`font-bold text-lg ${isOwner ? 'text-yellow-400' : 'text-blue-400'}`}>
              {isOwner ? '👑 Admin' : '👤 Électeur'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}