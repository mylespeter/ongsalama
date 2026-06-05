import Web3 from 'web3';

// Adresse de ton contrat déployé sur Ganache
const CONTRACT_ADDRESS = '0x4fffcc54B7459E4A5c5eE5f910557A3A2f9558AD';

// ABI minimal de ton contrat
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stopVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_candidateId", "type": "uint256"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingOpen",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidatesCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getCandidate",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "voter", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "candidateId", "type": "uint256"}
    ],
    "name": "VoteCast",
    "type": "event"
  }
];

export class VotingContract {
  private web3: Web3;
  private contract: any;

  constructor() {
    this.web3 = new Web3('http://127.0.0.1:7545');
    this.contract = new this.web3.eth.Contract(CONTRACT_ABI as any, CONTRACT_ADDRESS);
  }

  async getAccounts(): Promise<string[]> {
    return await this.web3.eth.getAccounts();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async getOwner(): Promise<string> {
    return await this.contract.methods.owner().call();
  }

  async isVotingOpen(): Promise<boolean> {
    return await this.contract.methods.votingOpen().call();
  }

  async hasVoted(address: string): Promise<boolean> {
    return await this.contract.methods.hasVoted(address).call();
  }

  async getCandidatesCount(): Promise<number> {
    const count = await this.contract.methods.getCandidatesCount().call();
    return Number(count);
  }

  async getCandidate(id: number): Promise<any> {
    return await this.contract.methods.getCandidate(id).call();
  }

  async getWinner(): Promise<any> {
    return await this.contract.methods.getWinner().call();
  }

  async getAllCandidates(): Promise<any[]> {
    const count = await this.getCandidatesCount();
    const candidates = [];
    
    for (let i = 0; i < count; i++) {
      const candidate = await this.getCandidate(i);
      candidates.push({
        id: candidate.id.toString(),
        name: candidate.name,
        voteCount: candidate.voteCount.toString()
      });
    }
    
    return candidates;
  }

  async addCandidate(name: string, from: string): Promise<void> {
    await this.contract.methods.addCandidate(name).send({ from, gas: 200000 });
  }

  async startVoting(from: string): Promise<void> {
    await this.contract.methods.startVoting().send({ from, gas: 100000 });
  }

  async stopVoting(from: string): Promise<void> {
    await this.contract.methods.stopVoting().send({ from, gas: 100000 });
  }

  async vote(candidateId: number, from: string): Promise<void> {
    await this.contract.methods.vote(candidateId).send({ from, gas: 200000 });
  }
}

export const votingContract = new VotingContract();