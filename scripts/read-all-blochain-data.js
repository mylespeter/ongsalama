const { Web3 } = require('web3');
const fs = require('fs-extra');
const path = require('path');

async function readAllBlockchainData() {
    console.log('🔍 LECTURE COMPLÈTE DE LA BLOCKCHAIN DRUG TRACEABILITY');
    console.log('='.repeat(65));
    
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Vérifier la connexion
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    console.log(`✅ Connecté à Ganache (Network ID: ${networkId})`);
    console.log(`👤 Comptes disponibles: ${accounts.length}`);
    console.log('');
    
    // Charger le contrat
    const contractData = fs.readJsonSync(
        path.resolve(__dirname, '..', 'build', 'DrugTraceability.json')
    );
    
    // Lire l'adresse depuis .env.local
    const envPath = path.resolve(__dirname, '..', '.env.local');
    let contractAddress = null;
    
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(0x[a-fA-F0-9]{40})/);
        contractAddress = match ? match[1] : null;
    }
    
    if (!contractAddress) {
        console.error('❌ Adresse contrat non trouvée dans .env.local');
        console.error('   Vérifiez que NEXT_PUBLIC_CONTRACT_ADDRESS est défini');
        return;
    }
    
    console.log(`📍 Contrat: ${contractAddress}`);
    
    const contract = new web3.eth.Contract(contractData.abi, contractAddress);
    
    // =============================================
    // 1. INFORMATIONS GLOBALES
    // =============================================
    console.log('\n📊 INFORMATIONS GLOBALES');
    console.log('-'.repeat(65));
    
    const owner = await contract.methods.owner().call();
    const lotCount = await contract.methods.getLotCount().call();
    const mouvementCount = await contract.methods.getMouvementCountTotal().call();
    
    console.log(`👑 Propriétaire:       ${owner}`);
    console.log(`📦 Nombre de lots:     ${lotCount}`);
    console.log(`📋 Nombre mouvements:  ${mouvementCount}`);
    
    // Vérifier quel compte Ganache est le propriétaire
    const ownerIndex = accounts.findIndex(
        acc => acc.toLowerCase() === owner.toLowerCase()
    );
    console.log(`   (Compte Ganache [${ownerIndex >= 0 ? ownerIndex : '?'}])`);
    
    // =============================================
    // 2. LISTE DE TOUS LES LOTS
    // =============================================
    console.log('\n📦 TOUS LES LOTS SUR LA BLOCKCHAIN');
    console.log('='.repeat(65));
    
    if (Number(lotCount) === 0) {
        console.log('❌ Aucun lot trouvé sur la blockchain.');
    }
    
    for (let i = 1; i <= Number(lotCount); i++) {
        try {
            const lot = await contract.methods.getLot(i).call();
            
            console.log(`\n📦 LOT BLOCKCHAIN #${lot.id}`);
            console.log('-'.repeat(65));
            console.log(`   Numéro lot:          ${lot.numeroLot}`);
            console.log(`   Code unique:         ${lot.codeUnique}`);
            console.log(`   Code médicament:     ${lot.medicamentCode}`);
            console.log(`   Hash lot:            ${lot.hashLot}`);
            console.log(`   Quantité totale:     ${lot.quantiteTotale}`);
            console.log(`   Date fabrication:    ${new Date(Number(lot.dateFabrication) * 1000).toLocaleDateString('fr-FR')}`);
            console.log(`   Date expiration:     ${new Date(Number(lot.dateExpiration) * 1000).toLocaleDateString('fr-FR')}`);
            console.log(`   Existe:              ${lot.exists}`);
            
            // Vérifier le hash
            const lotHashExists = await contract.methods.verifyHash(lot.hashLot).call();
            console.log(`   Hash vérifié:        ${lotHashExists ? '✅ OUI' : '❌ NON'}`);
            
            // Statut d'expiration
            const now = Math.floor(Date.now() / 1000);
            const isExpired = Number(lot.dateExpiration) < now;
            console.log(`   Statut:              ${isExpired ? '⚠️ EXPIRÉ' : '✅ Valide'}`);
            
            // =============================================
            // 3. MOUVEMENTS DE CE LOT
            // =============================================
            const lotMvtCount = await contract.methods.getMouvementCount(i).call();
            console.log(`\n   📋 MOUVEMENTS (${lotMvtCount})`);
            
            if (Number(lotMvtCount) === 0) {
                console.log('      Aucun mouvement');
            }
            
            let quantiteRestante = Number(lot.quantiteTotale);
            
            for (let j = 0; j < Number(lotMvtCount); j++) {
                const mvt = await contract.methods.getMouvement(i, j).call();
                
                const mvtDate = new Date(Number(mvt.timestamp) * 1000);
                const emetteurIndex = accounts.findIndex(
                    acc => acc.toLowerCase() === mvt.emetteur.toLowerCase()
                );
                
                console.log(`\n      Mouvement #${mvt.id}`);
                console.log(`      ${'─'.repeat(55)}`);
                console.log(`      Type:           ${mvt.typeMouvement}`);
                console.log(`      Quantité:       ${mvt.quantite}`);
                console.log(`      Hash:           ${mvt.hashMouvement}`);
                console.log(`      Commentaire:    ${mvt.commentaire || '(aucun)'}`);
                console.log(`      Date:           ${mvtDate.toLocaleString('fr-FR')}`);
                console.log(`      Émetteur:       ${mvt.emetteur} (Compte [${emetteurIndex >= 0 ? emetteurIndex : '?'}])`);
                
                // Vérifier le hash du mouvement
                const mvtHashExists = await contract.methods.verifyHash(mvt.hashMouvement).call();
                console.log(`      Hash vérifié:   ${mvtHashExists ? '✅ OUI' : '❌ NON'}`);
                
                // Mettre à jour la quantité restante
                if (mvt.typeMouvement === 'creation_lot') {
                    // Ne change pas la quantité
                } else if (mvt.typeMouvement === 'transfert' || 
                           mvt.typeMouvement.includes('vente') ||
                           mvt.typeMouvement === 'destruction' ||
                           mvt.typeMouvement === 'retrait_defectueux') {
                    quantiteRestante -= Number(mvt.quantite);
                }
            }
            
            console.log(`\n   📊 RÉSUMÉ LOT #${i}`);
            console.log(`      Quantité initiale:  ${lot.quantiteTotale}`);
            console.log(`      Quantité restante:  ${Math.max(0, quantiteRestante)}`);
            console.log(`      Mouvements:         ${lotMvtCount}`);
            
        } catch (error) {
            console.error(`\n❌ Erreur lecture lot #${i}: ${error.message}`);
        }
    }
    
    // =============================================
    // 4. COMPTES GANACHE AVEC LEURS SOLDES
    // =============================================
    console.log('\n\n👤 COMPTES GANACHE');
    console.log('='.repeat(65));
    
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
        const balance = await web3.eth.getBalance(accounts[i]);
        const balanceEth = web3.utils.fromWei(balance, 'ether');
        const isOwner = accounts[i].toLowerCase() === owner.toLowerCase();
        
        console.log(`   [${i}] ${accounts[i]} - ${Number(balanceEth).toFixed(4)} ETH ${isOwner ? '👑 (Propriétaire)' : ''}`);
    }
    
    if (accounts.length > 5) {
        console.log(`   ... et ${accounts.length - 5} autres comptes`);
    }
    
    // =============================================
    // 5. RÉSUMÉ GLOBAL
    // =============================================
    console.log('\n\n📊 RÉSUMÉ GLOBAL');
    console.log('='.repeat(65));
    console.log(`   Lots créés:        ${lotCount}`);
    console.log(`   Mouvements total:  ${mouvementCount}`);
    console.log(`   Contrats déployés: 1 (DrugTraceability)`);
    console.log(`   Réseau:            Ganache Local`);
    console.log(`   URL RPC:           http://127.0.0.1:7545`);
    
    // Vérifier tous les hashs
    console.log('\n🔐 VÉRIFICATION DE TOUS LES HASH');
    console.log('-'.repeat(65));
    
    let totalHashes = 0;
    let hashesOk = 0;
    let hashesFail = 0;
    
    for (let i = 1; i <= Number(lotCount); i++) {
        const lot = await contract.methods.getLot(i).call();
        totalHashes++;
        const ok = await contract.methods.verifyHash(lot.hashLot).call();
        if (ok) hashesOk++; else hashesFail++;
        
        const lotMvtCount = await contract.methods.getMouvementCount(i).call();
        for (let j = 0; j < Number(lotMvtCount); j++) {
            const mvt = await contract.methods.getMouvement(i, j).call();
            totalHashes++;
            const mvtOk = await contract.methods.verifyHash(mvt.hashMouvement).call();
            if (mvtOk) hashesOk++; else hashesFail++;
        }
    }
    
    console.log(`   Total hashs:       ${totalHashes}`);
    console.log(`   Vérifiés OK:       ${hashesOk} ✅`);
    console.log(`   Échecs:            ${hashesFail} ❌`);
    
    console.log('\n✅ Lecture terminée !');
}

readAllBlockchainData()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });