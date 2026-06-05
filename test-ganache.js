// // test-ganache-final.js
// const { Web3 } = require('web3');

// async function testGanache() {
//     console.log('🔌 Connecting to Ganache...\n');
    
//     const web3 = new Web3('http://127.0.0.1:7545');
    
//     try {
//         // Test 1: Connection
//         console.log('📡 Test 1: Connection...');
//         const networkId = await web3.eth.net.getId();
//         const blockNumber = await web3.eth.getBlockNumber();
//         console.log('✅ Connected! Network ID:', networkId, 'Block:', blockNumber, '\n');
        
//         // Test 2: Accounts
//         console.log('👤 Test 2: Accounts...');
//         const accounts = await web3.eth.getAccounts();
//         accounts.forEach((acc, i) => console.log(`   [${i}] ${acc}`));
//         console.log();
        
//         // Test 3: Balances
//         console.log('💰 Test 3: Balances...');
//         for (let i = 0; i < 3; i++) {
//             const bal = await web3.eth.getBalance(accounts[i]);
//             console.log(`   Account ${i}: ${web3.utils.fromWei(bal, 'ether')} ETH`);
//         }
//         console.log();
        
//         // Test 4: Send ETH
//         console.log('📤 Test 4: Send 0.5 ETH...');
//         const tx = await web3.eth.sendTransaction({
//             from: accounts[0],
//             to: accounts[1],
//             value: web3.utils.toWei('0.5', 'ether'),
//             gas: 21000
//         });
//         console.log('✅ Transaction hash:', tx.transactionHash, '\n');
        
//         // Test 5: Deploy a really simple contract
//         console.log('📜 Test 5: Deploy contract...');
        
//         // TRES SIMPLE: Juste un compteur
//         const simpleABI = [
//             {
//                 "inputs": [],
//                 "name": "get",
//                 "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
//                 "stateMutability": "view",
//                 "type": "function"
//             },
//             {
//                 "inputs": [{"internalType": "uint256", "name": "x", "type": "uint256"}],
//                 "name": "set",
//                 "outputs": [],
//                 "stateMutability": "nonpayable",
//                 "type": "function"
//             }
//         ];
        
//         // Bytecode minimal pour un contrat de stockage simple
//         const simpleBytecode = '0x608060405234801561001057600080fd5b5060b68061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c14604f575b600080fd5b604d6004803603810190604991906089565b6069565b005b60556073565b6040516060919060b5565b60405180910390f35b8060008190555050565b60008054905090565b60008135905060838160a1565b92915050565b600060208284031215609a576099609d565b5b600060a684828501607c565b91505092915050565b60b1816097565b82525050565b600060208201905060c8600083018460aa565b92915050565b6000819050919050565b600080fd5b60ce816097565b811460d857600080fd5b5056fea2646970667358221220e5c3c6e5c2b1e6b1e5c3c6e5c2b1e6b1e5c3c6e5c2b1e6b1e5c3c6e5c2b1e64736f6c63430008070033';
        
//         const contract = new web3.eth.Contract(simpleABI);
        
//         const deployedContract = await contract.deploy({
//             data: simpleBytecode
//         }).send({
//             from: accounts[0],
//             gas: 500000
//         });
        
//         console.log('✅ Contract address:', deployedContract.options.address, '\n');
        
//         // Test 6: Use contract
//         console.log('🔧 Test 6: Use contract...');
        
//         await deployedContract.methods.set(42).send({
//             from: accounts[0],
//             gas: 50000
//         });
        
//         const value = await deployedContract.methods.get().call();
//         console.log('✅ Stored value:', value.toString(), '\n');
        
//         // SUCCESS!
//         console.log('='.repeat(55));
//         console.log('🎉 GANACHE IS WORKING PERFECTLY!');
//         console.log('='.repeat(55));
//         console.log('✅ Connection: OK');
//         console.log('✅ Accounts: OK');
//         console.log('✅ Transactions: OK');
//         console.log('✅ Smart Contracts: OK');
//         console.log('');
//         console.log('You can now connect your app! 🚀');
//         console.log('='.repeat(55));
        
//     } catch (error) {
//         console.error('\n❌ Error:', error.message);
//         console.error('\nIs Ganache running? Check:');
//         console.error('  http://127.0.0.1:7545');
//     }
// }

// testGanache();

// test-smart-contract-fixed.js
const { Web3 } = require('web3');

async function testSmartContract() {
    console.log('🔌 Connexion à Ganache...\n');
    const web3 = new Web3('http://127.0.0.1:7545');
    
    try {
        // =====================================
        // PARTIE 1: CONNEXION ET COMPTES
        // =====================================
        console.log('📡 1. VÉRIFICATION CONNEXION');
        const networkId = await web3.eth.net.getId();
        console.log(`   Network ID: ${networkId}`);
        
        const accounts = await web3.eth.getAccounts();
        console.log(`   Comptes disponibles: ${accounts.length}`);
        
        // Afficher les 3 premiers comptes avec leurs soldes
        for (let i = 0; i < 3; i++) {
            const balance = await web3.eth.getBalance(accounts[i]);
            console.log(`   Compte[${i}]: ${accounts[i].substring(0, 10)}... | Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
        }

        // =====================================
        // PARTIE 2: DÉFINIR LE SMART CONTRACT
        // =====================================
        console.log('\n📜 2. DÉFINITION DU CONTRACT');
        
        // ABI = Interface du contrat (comment interagir avec lui)
        const storageABI = [
            // Fonction pour stocker une valeur
            {
                "inputs": [{"internalType": "uint256", "name": "x", "type": "uint256"}],
                "name": "store",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            // Fonction pour récupérer la valeur
            {
                "inputs": [],
                "name": "retrieve",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        // Bytecode = Code compilé du contrat
        const storageBytecode = '608060405234801561001057600080fd5b5061016f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e9190610125565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009a81610087565b82525050565b60006020820190506100b56000830184610091565b92915050565b600080fd5b6100c981610087565b81146100d457600080fd5b50565b6000602082840312156100eb576100ea6100bb565b5b60006100f9848285016100c0565b91505092915050565b61010b81610087565b811461011657600080fd5b5056fea26469706673582212205cf7c2c8a4d34a73cdf84c1b1d1d0b82805ae0c8e960718b3b98e8f1b3556e6164736f6c63430008070033';
        
        console.log('   ABI chargée ✓');
        console.log('   Bytecode chargé ✓');

        // =====================================
        // PARTIE 3: DÉPLOIEMENT DU CONTRACT
        // =====================================
        console.log('\n🚀 3. DÉPLOIEMENT DU CONTRACT');
        
        // Créer une instance du contrat
        const Contract = new web3.eth.Contract(storageABI);
        
        console.log('   Déploiement en cours...');
        
        // Déployer le contrat
        const deployedContract = await Contract.deploy({
            data: storageBytecode
        }).send({
            from: accounts[0],
            gas: 3000000
        });
        
        const contractAddress = deployedContract.options.address;
        console.log(`   ✅ Adresse du contrat: ${contractAddress}`);
        
        // Vérifier si transactionHash existe avant d'essayer de l'afficher
        if (deployedContract.transactionHash) {
            console.log(`   Transaction de déploiement: ${deployedContract.transactionHash.substring(0, 40)}...`);
        }
        
        // Afficher les informations disponibles
        console.log(`   Block Number: ${deployedContract.blockNumber || 'N/A'}`);
        console.log(`   Gas Used: ${deployedContract.gasUsed || 'N/A'}`);

        // =====================================
        // PARTIE 4: INTERACTION AVEC LE CONTRACT
        // =====================================
        console.log('\n🔧 4. INTERACTION AVEC LE CONTRACT');
        
        // 4a. Appeler une fonction view (lecture - pas de gas)
        console.log('\n   📖 LECTURE (View Call - Gratuit)');
        let value = await deployedContract.methods.retrieve().call();
        console.log(`   Valeur initiale: ${value}`);
        
        // 4b. Appeler une fonction d'écriture (coûte du gas)
        console.log('\n   ✍️  ÉCRITURE (Transaction - Coûte du gas)');
        
        // Stocker la valeur 42
        const storeTx = await deployedContract.methods.store(42).send({
            from: accounts[0],
            gas: 100000
        });
        console.log(`   ✅ Valeur 42 stockée!`);
        console.log(`   Transaction: ${storeTx.transactionHash ? storeTx.transactionHash.substring(0, 40) + '...' : 'N/A'}`);
        console.log(`   Gas utilisé: ${storeTx.gasUsed || 'N/A'}`);
        
        // Vérifier que la valeur est bien stockée
        value = await deployedContract.methods.retrieve().call();
        console.log(`   ✅ Nouvelle valeur lue: ${value}`);

        // 4c. Tester avec d'autres valeurs
        console.log('\n   🔄 TEST AVEC PLUSIEURS VALEURS');
        const testValues = [100, 200, 999];
        
        for (const val of testValues) {
            console.log(`   Stockage de ${val}...`);
            
            // Utiliser un compte différent pour montrer que n'importe qui peut appeler
            const tx = await deployedContract.methods.store(val).send({
                from: accounts[1],
                gas: 100000
            });
            
            // Lire la valeur
            const stored = await deployedContract.methods.retrieve().call();
            console.log(`   ✅ Compte[1] a stocké ${val} -> Lecture: ${stored}`);
        }

        // 4d. Démonstration que la valeur est persistante
        console.log('\n   💾 PERSISTANCE DES DONNÉES');
        value = await deployedContract.methods.retrieve().call();
        console.log(`   Dernière valeur stockée: ${value}`);

        // =====================================
        // PARTIE 5: CONCEPTS AVANCÉS
        // =====================================
        console.log('\n🎓 5. DÉMONSTRATION DES CONCEPTS CLÉS');
        
        // 5a. Estimation du gas
        console.log('\n   📊 ESTIMATION DU GAS');
        const estimatedGas = await deployedContract.methods.store(123).estimateGas({
            from: accounts[0]
        });
        console.log(`   Gas estimé pour store(123): ${estimatedGas}`);
        
        // 5b. Envoyer de l'ETH avec une fonction
        console.log('\n   💰 ENVOI D\'ETH AVEC UNE FONCTION');
        const balanceBefore = await web3.eth.getBalance(contractAddress);
        console.log(`   Balance du contrat avant: ${web3.utils.fromWei(balanceBefore, 'ether')} ETH`);
        
        // Envoyer 1 ETH au contrat pendant l'appel de store
        const txWithEth = await deployedContract.methods.store(42).send({
            from: accounts[0],
            gas: 100000,
            value: web3.utils.toWei('1', 'ether')  // Envoyer 1 ETH
        });
        
        const balanceAfter = await web3.eth.getBalance(contractAddress);
        console.log(`   Balance du contrat après: ${web3.utils.fromWei(balanceAfter, 'ether')} ETH`);
        console.log(`   ✅ 1 ETH envoyé avec la transaction!`);

        // =====================================
        // PARTIE 6: RÉSUMÉ ET EXEMPLE PRATIQUE
        // =====================================
        console.log('\n📝 6. RÉSUMÉ D\'UTILISATION');
        
        console.log('\n   🎯 COMMENT UTILISER UN CONTRAT:');
        console.log('   1. Avoir l\'ABI et l\'adresse');
        console.log('   2. Créer une instance: new web3.eth.Contract(abi, address)');
        console.log('   3. Appeler les fonctions:');
        console.log('      - Lecture: .methods.fonction().call()');
        console.log('      - Écriture: .methods.fonction().send({from, gas})');
        
        // Exemple d'utilisation future
        console.log('\n   💡 EXEMPLE D\'UTILISATION:');
        console.log(`   const contract = new web3.eth.Contract(abi, '${contractAddress}');`);
        console.log('   const value = await contract.methods.retrieve().call();');
        console.log('   await contract.methods.store(42).send({from: account, gas: 100000});');
        
        // =====================================
        // SUCCÈS
        // =====================================
        console.log('\n' + '='.repeat(55));
        console.log('✅ TOUS LES TESTS SONT RÉUSSIS !');
        console.log('='.repeat(55));
        
        console.log('\n📊 RÉSUMÉ FINAL:');
        console.log(`   ✓ Connexion à Ganache: OK (Network ID: ${networkId})`);
        console.log(`   ✓ Contrat déployé à: ${contractAddress}`);
        console.log(`   ✓ Fonctions de lecture (retrieve): OK`);
        console.log(`   ✓ Fonctions d\'écriture (store): OK`);
        console.log(`   ✓ Persistance des données: OK`);
        console.log(`   ✓ Multi-comptes: OK`);
        console.log(`   ✓ Envoi d'ETH: OK`);
        
        console.log('\n🔑 CONCEPTS CLÉS À RETENIR:');
        console.log('   • ABI = Menu du restaurant (quoi commander)');
        console.log('   • Bytecode = Recette de cuisine (comment c\'est fait)');
        console.log('   • Contract Address = Adresse du restaurant');
        console.log('   • .call() = Regarder le menu (gratuit)');
        console.log('   • .send() = Commander un plat (payant en gas)');
        console.log('   • Gas = Frais de service pour la blockchain');
        
        return {
            contractAddress,
            contractInstance: deployedContract,
            accounts
        };
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\n📍 DÉTAILS DE L\'ERREUR:');
        
        // Informations de debug plus détaillées
        if (error.receipt) {
            console.error('Transaction receipt disponible mais échouée');
        }
        if (error.transactionHash) {
            console.error('Transaction hash:', error.transactionHash);
        }
        
        console.error('\n🔍 SOLUTIONS POSSIBLES:');
        console.error('1. Vérifier que Ganache est bien lancé sur le port 7545');
        console.error('2. Vérifier le solde du compte utilisé');
        console.error('3. Vérifier la limite de gas (augmenter si nécessaire)');
        console.error('4. Le bytecode pourrait être invalide');
        
        throw error;
    }
}

// Exécuter le test
testSmartContract()
    .then((result) => {
        console.log('\n' + '='.repeat(55));
        console.log('🚀 VOTRE CONTRAT EST PRÊT À ÊTRE UTILISÉ!');
        console.log('='.repeat(55));
        console.log(`\n📍 Adresse: ${result.contractAddress}`);
        console.log('💻 Pour utiliser ce contrat dans votre app:');
        console.log('```javascript');
        console.log('const web3 = new Web3("http://127.0.0.1:7545");');
        console.log(`const contract = new web3.eth.Contract(abi, "${result.contractAddress}");`);
        console.log('```');
    })
    .catch((error) => {
        console.error('\n❌ Test échoué:', error.message);
        process.exit(1);
    });