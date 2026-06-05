
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DrugTraceability {
    // Structure pour un lot
    struct Lot {
        uint256 id;
        string numeroLot;
        string codeUnique;
        string medicamentCode;
        string hashLot;
        uint256 quantiteTotale;
        uint256 dateFabrication;
        uint256 dateExpiration;
        bool exists;
    }
    
    // Structure pour un mouvement
    struct Mouvement {
        uint256 id;
        uint256 lotId;
        string typeMouvement;
        uint256 quantite;
        string hashMouvement;
        string commentaire;
        uint256 timestamp;
        address emetteur;
    }
    
    // Propriétaire du contrat
    address public owner;
    
    // Mapping des lots (ID => Lot)
    mapping(uint256 => Lot) public lots;
    
    // Mapping des mouvements par lot
    mapping(uint256 => Mouvement[]) public mouvementsByLot;
    
    // Mapping pour vérifier les hashs
    mapping(string => bool) public hashExists;
    
    // Compteurs
    uint256 public lotCount;
    uint256 public mouvementCount;
    
    // Événements
    event LotCreated(uint256 lotId, string numeroLot, address createdBy);
    event MouvementAdded(uint256 mouvementId, uint256 lotId, string typeMouvement, address emetteur);
    
    // Constructeur - le déployeur devient propriétaire
    constructor() {
        owner = msg.sender;
    }
    
    // Créer un nouveau lot
    function createLot(
        string memory _numeroLot,
        string memory _codeUnique,
        string memory _medicamentCode,
        string memory _hashLot,
        uint256 _quantiteTotale,
        uint256 _dateFabrication,
        uint256 _dateExpiration
    ) public returns (uint256) {
        // On accepte toutes les adresses pour créer un lot (ou seulement le owner si vous voulez)
        // Décommentez la ligne suivante si vous voulez restreindre au propriétaire :
        // require(msg.sender == owner, "Seul le proprietaire peut creer un lot");
        
        lotCount++;
        uint256 newLotId = lotCount;
        
        lots[newLotId] = Lot({
            id: newLotId,
            numeroLot: _numeroLot,
            codeUnique: _codeUnique,
            medicamentCode: _medicamentCode,
            hashLot: _hashLot,
            quantiteTotale: _quantiteTotale,
            dateFabrication: _dateFabrication,
            dateExpiration: _dateExpiration,
            exists: true
        });
        
        // Enregistrer le hash
        hashExists[_hashLot] = true;
        
        emit LotCreated(newLotId, _numeroLot, msg.sender);
        
        return newLotId;
    }
    
    // Ajouter un mouvement à un lot
    function addMouvement(
        uint256 _lotId,
        string memory _typeMouvement,
        uint256 _quantite,
        string memory _hashMouvement,
        string memory _commentaire
    ) public returns (uint256) {
        require(lots[_lotId].exists, "Lot inexistant");
        // Décommentez si vous voulez restreindre :
        // require(msg.sender == owner, "Seul le proprietaire peut ajouter un mouvement");
        
        mouvementCount++;
        uint256 newMouvementId = mouvementCount;
        
        mouvementsByLot[_lotId].push(Mouvement({
            id: newMouvementId,
            lotId: _lotId,
            typeMouvement: _typeMouvement,
            quantite: _quantite,
            hashMouvement: _hashMouvement,
            commentaire: _commentaire,
            timestamp: block.timestamp,
            emetteur: msg.sender
        }));
        
        // Enregistrer le hash
        hashExists[_hashMouvement] = true;
        
        emit MouvementAdded(newMouvementId, _lotId, _typeMouvement, msg.sender);
        
        return newMouvementId;
    }
    
    // Récupérer les informations d'un lot
    function getLot(uint256 _lotId) public view returns (
        uint256 id,
        string memory numeroLot,
        string memory codeUnique,
        string memory medicamentCode,
        string memory hashLot,
        uint256 quantiteTotale,
        uint256 dateFabrication,
        uint256 dateExpiration,
        bool exists
    ) {
        require(lots[_lotId].exists, "Lot inexistant");
        Lot storage lot = lots[_lotId];
        return (
            lot.id,
            lot.numeroLot,
            lot.codeUnique,
            lot.medicamentCode,
            lot.hashLot,
            lot.quantiteTotale,
            lot.dateFabrication,
            lot.dateExpiration,
            lot.exists
        );
    }
    
    // Récupérer un mouvement spécifique d'un lot
    function getMouvement(uint256 _lotId, uint256 _mouvementIndex) public view returns (
        uint256 id,
        uint256 lotId,
        string memory typeMouvement,
        uint256 quantite,
        string memory hashMouvement,
        string memory commentaire,
        uint256 timestamp,
        address emetteur
    ) {
        require(mouvementsByLot[_lotId].length > _mouvementIndex, "Mouvement inexistant");
        Mouvement storage mvt = mouvementsByLot[_lotId][_mouvementIndex];
        return (
            mvt.id,
            mvt.lotId,
            mvt.typeMouvement,
            mvt.quantite,
            mvt.hashMouvement,
            mvt.commentaire,
            mvt.timestamp,
            mvt.emetteur
        );
    }
    
    // Récupérer le nombre de mouvements d'un lot
    function getMouvementCount(uint256 _lotId) public view returns (uint256) {
        return mouvementsByLot[_lotId].length;
    }
    
    // Vérifier si un hash existe
    function verifyHash(string memory _hash) public view returns (bool) {
        return hashExists[_hash];
    }
    
    // Récupérer le nombre total de lots
    function getLotCount() public view returns (uint256) {
        return lotCount;
    }
    
    // Récupérer le nombre total de mouvements
    function getMouvementCountTotal() public view returns (uint256) {
        return mouvementCount;
    }
}