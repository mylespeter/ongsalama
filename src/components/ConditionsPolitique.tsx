import React, { useState, ReactNode } from 'react';

// Définition des types pour les props
interface SectionContentProps {
  title: string;
  icon: string;
  children: ReactNode;
}

interface InfoCardProps {
  title: string;
  children: ReactNode;
  type?: 'default' | 'warning' | 'important';
}

const ConditionsPolitique = () => {
  const [activeSection, setActiveSection] = useState('conditions');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sections = [
    { id: 'conditions', title: 'Conditions d\'Utilisation', icon: '📋' },
    { id: 'confidentialite', title: 'Politique de Confidentialité', icon: '🔒' },
    { id: 'comptes', title: 'Gestion des Comptes', icon: '👥' },
    { id: 'contenu', title: 'Utilisation du Contenu', icon: '📚' },
    { id: 'chat', title: 'Service de Chat', icon: '💬' },
    { id: 'sanctions', title: 'Sanctions et Mesures', icon: '⚖️' },
    { id: 'propriete', title: 'Propriété Intellectuelle', icon: '📝' }
  ];

  // Composant SectionContent avec types
  const SectionContent: React.FC<SectionContentProps> = ({ title, icon, children }) => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  // Composant InfoCard avec types
  const InfoCard: React.FC<InfoCardProps> = ({ title, children, type = 'default' }) => {
    const getBorderColor = (): string => {
      switch (type) {
        case 'warning': 
          return 'border-l-red-500 bg-red-50';
        case 'important': 
          return 'border-l-yellow-500 bg-yellow-50';
        default: 
          return 'border-l-blue-500 bg-blue-50';
      }
    };

    return (
      <div className={`border-l-4 p-6 rounded-r-lg ${getBorderColor()}`}>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        {children}
      </div>
    );
  };

  const ConsentementBanner = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">
            En vous inscrivant ou en vous connectant, vous acceptez les <strong>Conditions d'utilisation</strong> et la <strong>Politique de confidentialité</strong> de cette plateforme.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Voir les détails
          </button>
          <button className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
            J'accepte
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bannière de consentement */}
      <ConsentementBanner />

      {/* Modal principal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Conditions d'Utilisation et Politique de Confidentialité</h1>
                  <p className="text-blue-100">Plateforme de Recherche de TFC et d'Assistance à la Recherche - Université</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Navigation latérale */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <nav className="p-6">
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                            activeSection === section.id
                              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600 font-semibold'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                          }`}
                        >
                          <span className="text-xl">{section.icon}</span>
                          <span>{section.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeSection === 'conditions' && (
                  <SectionContent
                    title="Conditions d'Utilisation"
                    icon="📋"
                  >
                    <InfoCard title="Accès Restreint à la Communauté Universitaire" type="default">
                      <p className="mb-4">Cette plateforme est exclusivement réservée aux membres de l'université. L'accès est strictement limité aux :</p>
                      <ul className="list-disc list-inside space-y-2 mb-4">
                        <li><strong>Étudiants</strong> actuellement inscrits dans l'université</li>
                        <li><strong>Enseignants</strong> et personnel académique en fonction</li>
                        <li><strong>Administrateurs</strong> désignés par l'université</li>
                        <li><strong>Alumni</strong> diplômés de l'université</li>
                      </ul>
                      <p className="text-red-600 font-semibold">Toute tentative d'accès non autorisé sera considérée comme une violation et pourra entraîner des poursuites.</p>
                    </InfoCard>

                    <InfoCard title="Engagements des Utilisateurs" type="default">
                      <p className="mb-4">En utilisant cette plateforme, vous vous engagez à :</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Utiliser la plateforme de manière éthique et responsable</li>
                        <li>Respecter les droits de propriété intellectuelle</li>
                        <li>Maintenir la confidentialité de vos identifiants</li>
                        <li>Signaler tout comportement suspect ou inapproprié</li>
                        <li>Respecter les autres membres de la communauté</li>
                      </ul>
                    </InfoCard>
                  </SectionContent>
                )}

                {activeSection === 'confidentialite' && (
                  <SectionContent
                    title="Politique de Confidentialité"
                    icon="🔒"
                  >
                    <InfoCard title="Collecte et Utilisation des Données" type="default">
                      <p className="mb-4">Nous collectons uniquement les informations nécessaires au bon fonctionnement de la plateforme :</p>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Données collectées :</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Nom, prénom et matricule universitaire</li>
                            <li>Adresse email institutionnelle</li>
                            <li>Rôle au sein de l'université</li>
                            <li>Historique des activités académiques</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Utilisation :</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Authentification et sécurité</li>
                            <li>Personnalisation des services</li>
                            <li>Amélioration de la plateforme</li>
                            <li>Communication académique</li>
                          </ul>
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard title="Protection des Données" type="default">
                      <p className="mb-4">Vos données sont protégées par des mesures de sécurité avancées :</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Chiffrement des données sensibles (AES-256)</li>
                        <li>Accès restreint basé sur le principe du besoin de connaître</li>
                        <li>Audits de sécurité réguliers</li>
                        <li>Conservation limitée conformément à la réglementation</li>
                      </ul>
                    </InfoCard>

                    <InfoCard title="Modification des Informations" type="warning">
                      <p className="mb-4">Seuls les administrateurs et personnes explicitement autorisées ont le droit de modifier les informations critiques.</p>
                      <p className="font-semibold text-red-600">Toute tentative non autorisée de modification constitue une violation grave et peut entraîner :</p>
                      <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>Désactivation immédiate et permanente du compte</li>
                        <li>Bannissement définitif de la plateforme</li>
                        <li>Poursuites disciplinaires au sein de l'université</li>
                        <li>Actions légales si nécessaire</li>
                      </ul>
                    </InfoCard>
                  </SectionContent>
                )}

                {activeSection === 'comptes' && (
                  <SectionContent
                    title="Gestion des Comptes"
                    icon="👥"
                  >
                    <InfoCard title="Types de Comptes et Privilèges" type="default">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-bold text-blue-800 mb-3">Étudiant</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Consultation des TFC</li>
                            <li>✓ Recherche avancée</li>
                            <li>✓ Chat d'assistance basique</li>
                            <li>✓ Soumission de demandes</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-bold text-green-800 mb-3">Enseignant</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Tous les privilèges étudiant</li>
                            <li>✓ Supervision des TFC</li>
                            <li>✓ Évaluation des travaux</li>
                            <li>✓ Assistance prioritaire</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-bold text-purple-800 mb-3">Administrateur</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Gestion complète des comptes</li>
                            <li>✓ Modération du contenu</li>
                            <li>✓ Accès aux statistiques</li>
                            <li>✓ Désactivation des comptes</li>
                          </ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-bold text-orange-800 mb-3">Alumni</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Consultation limitée</li>
                            <li>✓ Accès aux ressources basiques</li>
                            <li>✓ Réseautage académique</li>
                            <li>✓ Mentorat optionnel</li>
                          </ul>
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard title="Désactivation et Réactivation des Comptes" type="warning">
                      <p className="mb-4">En cas de désactivation pour non-respect des politiques :</p>
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <h4 className="font-bold text-red-700 mb-2">Procédure de désactivation :</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Suspension immédiate de l'accès</li>
                          <li>Notification par email à l'utilisateur</li>
                          <li>Conservation des données pendant 30 jours</li>
                          <li>Possibilité de recours dans les 7 jours</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <h4 className="font-bold text-yellow-700 mb-2">Réactivation :</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Délai minimum de 2 semaines après désactivation</li>
                          <li>Demande formelle à soumettre</li>
                          <li>Examen par le comité d'administration</li>
                          <li>Engagement écrit à respecter les politiques</li>
                        </ul>
                      </div>
                    </InfoCard>
                  </SectionContent>
                )}

                {/* Les autres sections restent identiques mais avec les composants typés */}
                {activeSection === 'contenu' && (
                  <SectionContent
                    title="Utilisation du Contenu"
                    icon="📚"
                  >
                    <InfoCard title="Propriété Intellectuelle des TFC" type="important">
                      <p className="mb-4">Les Travaux de Fin de Cycle (TFC) sont la propriété intellectuelle exclusive de leurs auteurs :</p>
                      <ul className="list-disc list-inside space-y-2 mb-4">
                        <li><strong>Interdiction absolue</strong> de distribution sans autorisation écrite de l'auteur</li>
                        <li>Utilisation strictement limitée à des fins académiques et de recherche</li>
                        <li>Citation obligatoire selon les normes académiques</li>
                        <li>Respect des droits d'auteur et licences applicables</li>
                      </ul>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-blue-800">Usage autorisé :</p>
                        <p className="text-sm">Consultation, référencement, citation dans le cadre de travaux académiques avec attribution appropriée.</p>
                      </div>
                    </InfoCard>

                    <InfoCard title="Modèle Économique et Financement" type="default">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-green-700 mb-3">Services Gratuits</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Accès de base à la plateforme</li>
                            <li>✓ Consultation des TFC</li>
                            <li>✓ Recherche et filtres basiques</li>
                            <li>✓ Profil académique</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-700 mb-3">Services Premium</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Chat avancé avec experts</li>
                            <li>✓ Accès prioritaire aux nouvelles fonctionnalités</li>
                            <li>✓ Statistiques détaillées</li>
                            <li>✓ Support personnalisé</li>
                          </ul>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        <strong>Note importante :</strong> Les fonds collectés servent exclusivement à maintenir, sécuriser et améliorer la plateforme. Aucune donnée personnelle n'est vendue ou partagée à des fins commerciales.
                      </p>
                    </InfoCard>
                  </SectionContent>
                )}

                {activeSection === 'chat' && (
                  <SectionContent
                    title="Service de Chat"
                    icon="💬"
                  >
                    <InfoCard title="Nature et Limitations du Service" type="important">
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                        <p className="font-bold text-yellow-800 text-lg">⚠️ Avertissement Important</p>
                        <p className="mt-2">Le service de chat est fourni à titre indicatif et ne constitue pas un service officiel de conseil académique.</p>
                      </div>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Les réponses du chat ne sont <strong>pas officiellement utilisables</strong> dans des contextes formels</li>
                        <li>Service à vocation de référence et d'orientation uniquement</li>
                        <li>Ne remplace pas les conseils des enseignants et responsables académiques</li>
                        <li>Les utilisateurs sont responsables de la vérification des informations reçues</li>
                      </ul>
                    </InfoCard>

                    <InfoCard title="Fonctionnalités du Chat" type="default">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-bold text-gray-700 mb-3">Version Gratuite</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Réponses automatisées basiques</li>
                            <li>✓ Orientation générale</li>
                            <li>✓ Accès aux FAQ</li>
                            <li>✓ Historique limité (7 jours)</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-bold text-blue-700 mb-3">Version Premium</h4>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Accès à des experts spécialisés</li>
                            <li>✓ Support prioritaire 24h/24</li>
                            <li>✓ Historique complet des conversations</li>
                            <li>✓ Fonctionnalités avancées d'analyse</li>
                            <li>✓ Export des conversations</li>
                          </ul>
                        </div>
                      </div>
                    </InfoCard>
                  </SectionContent>
                )}

                {/* Ajoutez les autres sections ici si nécessaire */}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-gray-600">
                    En utilisant cette plateforme, vous acceptez pleinement ces conditions et politiques.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
                    Contact
                  </button>
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
                    Centre d'aide
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConditionsPolitique;