




// app/api/blockchain/deploy/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('🚀 Déploiement du contrat DrugTraceability...\n');
    
    // Vérifier que Node.js et les dépendances sont disponibles
    try {
      await execAsync('node --version');
    } catch {
      return NextResponse.json(
        { error: 'Node.js n\'est pas installé' },
        { status: 500 }
      );
    }

    // Chemin vers le script de déploiement
    const scriptPath = join(process.cwd(), 'deployer.js');
    
    if (!existsSync(scriptPath)) {
      return NextResponse.json(
        { error: 'Script de déploiement non trouvé: scripts/deploy-contract.js' },
        { status: 500 }
      );
    }
    
    // Vérifier que Ganache est accessible
    try {
      await fetch('http://127.0.0.1:7545', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'net_version',
          params: [],
          id: 1
        })
      });
    } catch {
      return NextResponse.json(
        { error: 'Ganache n\'est pas accessible sur http://127.0.0.1:7545' },
        { status: 500 }
      );
    }

    // Exécuter le script de déploiement
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      timeout: 60000 // 60 secondes timeout
    });

    // Parser la sortie pour extraire les informations importantes
    const addressMatch = stdout.match(/📍 Adresse: (0x[a-fA-F0-9]{40})/);
    const txMatch = stdout.match(/🔗 Transaction: (0x[a-fA-F0-9]{64})/);
    
    if (!addressMatch) {
      throw new Error('Adresse du contrat non trouvée dans la sortie');
    }

    const contractAddress = addressMatch[1];
    const transactionHash = txMatch ? txMatch[1] : null;

    // Mettre à jour le fichier .env.local
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (existsSync(envPath)) {
      envContent = require('fs').readFileSync(envPath, 'utf8');
    }

    // Supprimer l'ancienne adresse si elle existe
    envContent = envContent.replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/gm, '');
    envContent = envContent.replace(/\n\s*\n/g, '\n');

    // S'assurer que l'URL Ganache est présente
    if (!envContent.includes('NEXT_PUBLIC_GANACHE_URL=')) {
      envContent += 'NEXT_PUBLIC_GANACHE_URL=http://127.0.0.1:7545\n';
    }

    // Ajouter la nouvelle adresse
    envContent += `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
    envContent = envContent.trim() + '\n';

    writeFileSync(envPath, envContent);

    console.log('✅ Déploiement terminé !');
    console.log(stdout);

    return NextResponse.json({
      success: true,
      contractAddress,
      transactionHash,
      output: stdout,
      message: 'Contrat déployé avec succès !'
    });

  } catch (error: any) {
    console.error('❌ Erreur déploiement:', error);
    
    // Analyser l'erreur pour donner un message plus précis
    if (error.message?.includes('Ganache')) {
      return NextResponse.json(
        { error: 'Ganache n\'est pas lancé. Lancez Ganache sur le port 7545.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('solc')) {
      return NextResponse.json(
        { error: 'Erreur de compilation Solidity. Vérifiez votre contrat.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors du déploiement',
        details: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}

// Vérifier l'état du contrat
export async function GET() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    let contractAddress = null;
    let isGanacheRunning = false;

    // Vérifier si l'adresse existe dans .env.local
    if (existsSync(envPath)) {
      const envContent = require('fs').readFileSync(envPath, 'utf8');
      const match = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(0x[a-fA-F0-9]{40})/);
      if (match) {
        contractAddress = match[1];
      }
    }

    // Vérifier si Ganache est accessible
    try {
      const response = await fetch('http://127.0.0.1:7545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'net_version',
          params: [],
          id: 1
        })
      });
      isGanacheRunning = response.ok;
    } catch {
      isGanacheRunning = false;
    }

    return NextResponse.json({
      isDeployed: !!contractAddress,
      contractAddress,
      isGanacheRunning,
      ganacheUrl: 'http://127.0.0.1:7545'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}