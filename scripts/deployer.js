
// scripts/deploy-contract.js
const { Web3 } = require('web3');
const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

async function updateEnvLocal(newAddress) {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    
    try {
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
            // Remplacer l'ancienne adresse
            envContent = envContent.replace(
                /NEXT_PUBLIC_CONTRACT_ADDRESS=.*(\r?\n|$)/,
                `NEXT_PUBLIC_CONTRACT_ADDRESS=${newAddress}$1`
            );
            console.log('🔄 Adresse mise à jour dans .env.local');
        } else {
            envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${newAddress}\n`;
            console.log('➕ Nouvelle adresse ajoutée à .env.local');
        }
        
        fs.writeFileSync(envPath, envContent.trim() + '\n');
        
        // Vérifier ce qui a été écrit
        console.log(`📝 Contenu de .env.local :`);
        console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${newAddress}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    }
}

async function deployContract() {
    console.log('🚀 Déploiement du contrat DrugTraceability...\n');
    
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    console.log(`✅ Connecté à Ganache`);
    console.log(`📋 Compte owner: ${accounts[0]}\n`);
    
    // Compiler le contrat
    const contractPath = path.resolve(__dirname,'..' ,'contracts', 'DrugTraceability.sol');
    const source = fs.readFileSync(contractPath, 'utf8');
    
    const input = {
        language: 'Solidity',
        sources: {
            'DrugTraceability.sol': { content: source }
        },
        settings: {
            outputSelection: {
                '*': { '*': ['*'] }
            }
        }
    };
    
    console.log('🔨 Compilation...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(err => {
            if (err.severity === 'error') {
                console.error('❌', err.formattedMessage);
                process.exit(1);
            } else {
                console.warn('⚠️', err.formattedMessage);
            }
        });
    }
    
    const contract = output.contracts['DrugTraceability.sol']['DrugTraceability'];
    
    // Sauvegarder ABI et bytecode
    const buildPath = path.resolve(__dirname, '..', 'build');
    fs.ensureDirSync(buildPath);
    
    const contractData = {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
    
    fs.writeFileSync(
        path.resolve(buildPath, 'DrugTraceability.json'),
        JSON.stringify(contractData, null, 2)
    );
    
    console.log('✅ Compilation réussie');
    
    // Déployer
    console.log('\n📜 Déploiement...');
    const Contract = new web3.eth.Contract(contract.abi);
    
    const deployTx = Contract.deploy({
        data: '0x' + contract.evm.bytecode.object
    });
    
    // Estimer le gas
    const gas = await deployTx.estimateGas({ from: accounts[0] });
    console.log(`⛽ Gas estimé: ${gas}`);
    
    const deployedContract = await deployTx.send({
        from: accounts[0],
        gas: Math.floor(gas * 1.2) // Ajouter 20% de marge
    });
    
    const address = deployedContract.options.address;
    
    console.log(`\n✅ Contrat déployé !`);
    console.log(`📍 Adresse: ${address}`);
    
    // Récupérer la transaction hash
    const txHash = deployedContract.transactionHash || 
                   deployedContract.options?.transactionHash;
    
    if (txHash) {
        console.log(`🔗 Transaction: ${txHash}`);
    }
    
    // Mettre à jour l'adresse dans .env.local
    await updateEnvLocal(address);
    
    console.log('\n🎉 Prêt à utiliser la blockchain !');
    
    return { address, txHash };
}

// Exécution
deployContract()
    .then(result => {
        console.log(`\n📊 Résumé:`);
        console.log(`   Contrat: ${result.address}`);
    })
    .catch(error => {
        console.error('\n❌ Erreur lors du déploiement:', error);
        process.exit(1);
    });