// 'use client';

// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// // Type Patient pour ONG Salama
// type Patient = {
//   id: string;
//   nom: string;
//   post_nom: string;
//   prenom: string;
//   age: number;
//   sexe: 'M' | 'F';
//   telephone: string;
//   adresse: string;
//   motif_visite: 'rendez-vous' | 'consultation';
//   statut: 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'termine';
//   envoye_a: string | null;
//   cree_par: string;
//   created_at: string;
//   updated_at: string;
//   medecin?: {
//     id: string;
//     username: string;
//     matricule: string;
//     telephone: string | null;
//     photo_profil: string | null;
//   } | null;
//   agent?: {
//     id: string;
//     username: string;
//     matricule: string;
//   } | null;
// };

// // Type User pour les médecins
// export type Medecin = {
//   id: string;
//   matricule: string;
//   username: string;
//   telephone: string | null;
//   photo_profil: string | null;
//   genre: 'M' | 'F' | null;
// };

// // Fonction pour convertir une image en base64
// const getBase64ImageFromUrl = async (url: string): Promise<string> => {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result as string);
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   } catch (error) {
//     console.error('Erreur chargement logo:', error);
//     return '';
//   }
// };

// // Configuration des statuts (même que dans le composant principal)
// const STATUTS = {
//   accueil: { label: 'En attente' },
//   consultation: { label: 'En consultation' },
//   laboratoire: { label: 'Au laboratoire' },
//   pharmacie: { label: 'À la pharmacie' },
//   termine: { label: 'Terminé' },
// } as const;

// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString('fr-FR', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// const formatAge = (age: number) => {
//   if (age < 1) {
//     const mois = Math.round(age * 12);
//     return `${mois} mois`;
//   } else if (age < 2) {
//     return `${age} an`;
//   }
//   return `${age} ans`;
// };

// export const generatePatientPDF = async (patient: Patient) => {
//   try {
//     // Créer un nouveau document PDF
//     const doc = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: 'a4'
//     });

//     // Couleurs de l'ONG Salama
//     const primaryColor = '#1E40AF'; // Bleu foncé
//     const secondaryColor = '#3B82F6'; // Bleu clair
//     const accentColor = '#10B981'; // Vert
//     const textColor = '#1F2937'; // Gris foncé
//     const lightGray = '#F3F4F6'; // Gris clair

//     // Dimensions de la page
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 20;
    
//     // === EN-TÊTE ===
//     // Fond bleu pour l'en-tête
//     doc.setFillColor(primaryColor);
//     doc.rect(0, 0, pageWidth, 40, 'F');

//     // Charger et ajouter le logo
//     try {
//       const logoBase64 = await getBase64ImageFromUrl('/logo.png');
//       if (logoBase64) {
//         doc.addImage(logoBase64, 'PNG', margin, 5, 25, 25);
//       }
//     } catch (error) {
//       console.error('Erreur chargement logo:', error);
//     }

//     // Titre de l'ONG
//     doc.setTextColor('#FFFFFF');
//     doc.setFontSize(20);
//     doc.setFont('helvetica', 'bold');
//     doc.text('ONG SALAMA', margin + 30, 18);
    
//     // Sous-titre
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Centre Médical - Fiche Patient', margin + 30, 28);

//     // Date d'impression
//     doc.setFontSize(7);
//     doc.text(`Imprimé le ${formatDate(new Date().toISOString())}`, pageWidth - margin - 40, 28);

//     // === CORPS DU DOCUMENT ===
//     let yPosition = 50;

//     // Numéro de référence
// const refNumber = `REF-${String(patient.id).substring(0, 8).toUpperCase()}-${new Date(patient.created_at).getFullYear()}`;    doc.setFillColor(lightGray);
//     doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, 'F');
//     doc.setTextColor(primaryColor);
//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`N° Référence: ${refNumber}`, margin + 5, yPosition + 8);

//     yPosition += 20;

//     // Badge de statut
//     const statutInfo = STATUTS[patient.statut];
//     const statutColor = patient.statut === 'termine' ? accentColor : secondaryColor;
    
//     doc.setFillColor(statutColor);
//     doc.setTextColor('#FFFFFF');
//     doc.setFontSize(12);
//     const statutText = `Statut: ${statutInfo.label}`;
//     const statutWidth = doc.getStringUnitWidth(statutText) * 12 / doc.internal.scaleFactor + 10;
//     doc.roundedRect(pageWidth / 2 - statutWidth / 2, yPosition - 5, statutWidth, 10, 3, 3, 'F');
//     doc.text(statutText, pageWidth / 2, yPosition + 2, { align: 'center' });

//     yPosition += 20;

//     // === INFORMATIONS DU PATIENT ===
//     // Section titre
//     doc.setFillColor(secondaryColor);
//     doc.setTextColor('#FFFFFF');
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
//     doc.text('INFORMATIONS DU PATIENT', pageWidth / 2, yPosition + 7, { align: 'center' });

//     yPosition += 20;

//     // Tableau des informations
//     const patientInfo = [
//       ['Nom complet', `${patient.nom} ${patient.post_nom} ${patient.prenom}`],
//       ['Âge', formatAge(patient.age)],
//       ['Sexe', patient.sexe === 'M' ? 'Masculin' : 'Féminin'],
//       ['Téléphone', patient.telephone],
//       ['Adresse', patient.adresse],
//       ['Motif de visite', patient.motif_visite === 'consultation' ? 'Consultation' : 'Rendez-vous'],
//     ];

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: [],
//       body: patientInfo,
//       theme: 'plain',
//       styles: {
//         fontSize: 11,
//         cellPadding: 5,
//         textColor: textColor,
//       },
//       columnStyles: {
//         0: {
//           font: 'helvetica',
//           fontStyle: 'bold',
//           cellWidth: 50,
//           fillColor: lightGray,
//           textColor: primaryColor,
//         },
//         1: {
//           cellWidth: 'auto',
//         },
//       },
//       alternateRowStyles: {
//         fillColor: '#FAFAFA',
//       },
//       margin: { left: margin, right: margin },
//       tableWidth: pageWidth - 2 * margin,
//     });

//     // Mettre à jour yPosition après le tableau
//     yPosition = (doc as any).lastAutoTable.finalY + 15;

//     // === MÉDECIN ASSIGNÉ ===
//     if (patient.medecin) {
//       // Section titre
//       doc.setFillColor(secondaryColor);
//       doc.setTextColor('#FFFFFF');
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
//       doc.text('MÉDECIN ASSIGNÉ', pageWidth / 2, yPosition + 7, { align: 'center' });

//       yPosition += 20;

//       // Tableau médecin
//       const medecinInfo = [
//         ['Nom du médecin', `Dr. ${patient.medecin.username}`],
//         ['Matricule', patient.medecin.matricule],
//         ['Téléphone', patient.medecin.telephone || 'Non renseigné'],
//       ];

//       (doc as any).autoTable({
//         startY: yPosition,
//         head: [],
//         body: medecinInfo,
//         theme: 'plain',
//         styles: {
//           fontSize: 11,
//           cellPadding: 5,
//           textColor: textColor,
//         },
//         columnStyles: {
//           0: {
//             font: 'helvetica',
//             fontStyle: 'bold',
//             cellWidth: 50,
//             fillColor: lightGray,
//             textColor: primaryColor,
//           },
//           1: {
//             cellWidth: 'auto',
//           },
//         },
//         alternateRowStyles: {
//           fillColor: '#FAFAFA',
//         },
//         margin: { left: margin, right: margin },
//         tableWidth: pageWidth - 2 * margin,
//       });

//       yPosition = (doc as any).lastAutoTable.finalY + 15;
//     }

//     // === ENREGISTREMENT ===
//     // Section titre
//     doc.setFillColor(secondaryColor);
//     doc.setTextColor('#FFFFFF');
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
//     doc.text('INFORMATIONS D\'ENREGISTREMENT', pageWidth / 2, yPosition + 7, { align: 'center' });

//     yPosition += 20;

//     // Tableau enregistrement
//     const enregistrementInfo = [
//       ['Enregistré par', patient.agent?.username || 'Non renseigné'],
//       ['Date d\'enregistrement', formatDate(patient.created_at)],
//       ['Dernière modification', formatDate(patient.updated_at)],
//     ];

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: [],
//       body: enregistrementInfo,
//       theme: 'plain',
//       styles: {
//         fontSize: 11,
//         cellPadding: 5,
//         textColor: textColor,
//       },
//       columnStyles: {
//         0: {
//           font: 'helvetica',
//           fontStyle: 'bold',
//           cellWidth: 50,
//           fillColor: lightGray,
//           textColor: primaryColor,
//         },
//         1: {
//           cellWidth: 'auto',
//         },
//       },
//       alternateRowStyles: {
//         fillColor: '#FAFAFA',
//       },
//       margin: { left: margin, right: margin },
//       tableWidth: pageWidth - 2 * margin,
//     });

//     yPosition = (doc as any).lastAutoTable.finalY + 20;

//     // === PIED DE PAGE ===
//     // Ligne de séparation
//     doc.setDrawColor(primaryColor);
//     doc.setLineWidth(0.5);
//     doc.line(margin, yPosition, pageWidth - margin, yPosition);

//     yPosition += 10;

//     // Texte du pied de page
//     doc.setFontSize(8);
//     doc.setTextColor('#6B7280');
//     doc.setFont('helvetica', 'normal');
    
//     // Mentions légales centrées
//     const footerTexts = [
//       'ONG SALAMA - Centre Médical',
//       'Tous droits réservés © ' + new Date().getFullYear(),
//       'Document généré électroniquement - Valable sans signature',
//       `Référence: ${refNumber}`
//     ];

//     footerTexts.forEach((text, index) => {
//       doc.text(text, pageWidth / 2, yPosition + (index * 4), { align: 'center' });
//     });

//     // === ENCADREMENT DE LA PAGE ===
//     doc.setDrawColor(primaryColor);
//     doc.setLineWidth(0.8);
//     doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

//     // === FILIGRANE ===
//     // Ajouter un filigrane léger
//     doc.saveGraphicsState();
//     doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
//     doc.setTextColor(primaryColor);
//     doc.setFontSize(50);
//     doc.setFont('helvetica', 'bold');
//     doc.text('ONG SALAMA', pageWidth / 2, pageHeight / 2, {
//       align: 'center',
//       angle: 45
//     });
//     doc.restoreGraphicsState();

//     // Sauvegarder le PDF
//     const fileName = `Patient_${patient.nom}_${patient.prenom}_${new Date().toISOString().split('T')[0]}.pdf`;
//     doc.save(fileName);

//   } catch (error) {
//     console.error('Erreur lors de la génération du PDF:', error);
//     throw error;
//   }
// };

// // Hook pour utiliser la génération PDF
// export const usePatientPDF = () => {
//   const generatePDF = async (patient: Patient) => {
//     await generatePatientPDF(patient);
//   };

//   return { generatePDF };
// };

'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type Patient pour ONG Salama
type Patient = {
  id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  age: number;
  sexe: 'M' | 'F';
  telephone: string;
  adresse: string;
  motif_visite: 'rendez-vous' | 'consultation';
  statut: 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'termine';
  envoye_a: string | null;
  cree_par: string;
  created_at: string;
  updated_at: string;
  medecin?: {
    id: string;
    username: string;
    matricule: string;
    telephone: string | null;
    photo_profil: string | null;
  } | null;
  agent?: {
    id: string;
    username: string;
    matricule: string;
  } | null;
};

// Type User pour les médecins
export type Medecin = {
  id: string;
  matricule: string;
  username: string;
  telephone: string | null;
  photo_profil: string | null;
  genre: 'M' | 'F' | null;
};

// Fonction pour convertir une image en base64
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur chargement logo:', error);
    return '';
  }
};

// Configuration des statuts
const STATUTS = {
  accueil: { label: 'En attente' },
  consultation: { label: 'En consultation' },
  laboratoire: { label: 'Au laboratoire' },
  pharmacie: { label: 'À la pharmacie' },
  termine: { label: 'Terminé' },
} as const;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatAge = (age: number) => {
  if (age < 1) {
    const mois = Math.round(age * 12);
    return `${mois} mois`;
  } else if (age < 2) {
    return `${age} an`;
  }
  return `${age} ans`;
};

export const generatePatientPDF = async (patient: Patient) => {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Palette de couleurs
    const primaryColor = '#2E7D74';
    const secondaryColor = '#7CCBA2';
    const textColor = '#1F2937';
    const lightBg = '#F5F9F7';

    // Dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // === FILIGRANE (en arrière-plan) ===
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
    doc.setTextColor(primaryColor);
    doc.setFontSize(70);
    doc.setFont('helvetica', 'bold');
    doc.text('ONG SALAMA', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();

    // === EN-TÊTE ===
    let yPosition = 20;

    // Logo
    try {
      const logoBase64 = await getBase64ImageFromUrl('/logo.png');
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 22, 22);
      }
    } catch (error) {
      console.error('Erreur chargement logo:', error);
    }

    // Titre principal
    doc.setTextColor(primaryColor);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ONG SALAMA', margin + 28, yPosition + 10);
    
    // Sous-titre
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Centre Médical - Fiche Patient', margin + 28, yPosition + 18);

    // Date à droite
    doc.setFontSize(8);
    doc.setTextColor('#6B7280');
    const dateImpression = formatDate(new Date().toISOString());
    doc.text(`Imprimé le ${dateImpression}`, pageWidth - margin, yPosition + 10, { align: 'right' });

    yPosition += 30;

    // Ligne de séparation
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    // === RÉFÉRENCE ET STATUT ===
    yPosition += 10;

    const refNumber = `REF-${String(patient.id).substring(0, 8).toUpperCase()}-${new Date(patient.created_at).getFullYear()}`;
    
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° ${refNumber}`, margin, yPosition);

    // Badge statut
    const statutInfo = STATUTS[patient.statut];
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text(`Statut: ${statutInfo.label}`, pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 12;

    // === IDENTITÉ DU PATIENT (Section) ===
    doc.setFillColor(lightBg);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTITÉ DU PATIENT', margin + 5, yPosition + 6.5);

    yPosition += 15;

    // Informations patient en VERTICAL
    const patientFields = [
      { label: 'Nom', value: patient.nom },
      { label: 'Post-nom', value: patient.post_nom },
      { label: 'Prénom', value: patient.prenom },
      { label: 'Âge', value: formatAge(patient.age) },
      { label: 'Sexe', value: patient.sexe === 'M' ? 'Masculin' : 'Féminin' },
      { label: 'Téléphone', value: patient.telephone },
      { label: 'Adresse', value: patient.adresse },
      { label: 'Motif de visite', value: patient.motif_visite === 'consultation' ? 'Consultation' : 'Rendez-vous' },
    ];

    patientFields.forEach((field) => {
      // Label
      doc.setFontSize(9);
      doc.setTextColor('#6B7280');
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, margin, yPosition);
      
      // Valeur
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(field.value, margin + 45, yPosition);
      
      yPosition += 8;
    });

    yPosition += 5;

    // === MÉDECIN ASSIGNÉ (si présent) ===
    if (patient.medecin) {
      doc.setFillColor(lightBg);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
      doc.setTextColor(primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉDECIN ASSIGNÉ', margin + 5, yPosition + 6.5);

      yPosition += 15;

      // Infos médecin en vertical
      const medecinFields = [
        { label: 'Nom', value: `Dr. ${patient.medecin.username}` },
        { label: 'Matricule', value: patient.medecin.matricule },
      ];

      if (patient.medecin.telephone) {
        medecinFields.push({ label: 'Téléphone', value: patient.medecin.telephone });
      }

      medecinFields.forEach((field) => {
        doc.setFontSize(9);
        doc.setTextColor('#6B7280');
        doc.setFont('helvetica', 'normal');
        doc.text(field.label, margin, yPosition);
        
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'bold');
        doc.text(field.value, margin + 45, yPosition);
        
        yPosition += 8;
      });

      yPosition += 2;
    }

    // === INFORMATIONS D'ENREGISTREMENT ===
    doc.setFillColor(lightBg);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ENREGISTREMENT', margin + 5, yPosition + 6.5);

    yPosition += 15;

    // Infos enregistrement en vertical
    const enregistrementFields = [
      { label: 'Enregistré par', value: patient.agent?.username || 'Non renseigné' },
      { label: 'Date création', value: formatDate(patient.created_at) },
      { label: 'Dernière modification', value: formatDate(patient.updated_at) },
    ];

    enregistrementFields.forEach((field) => {
      doc.setFontSize(9);
      doc.setTextColor('#6B7280');
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, margin, yPosition);
      
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(field.value, margin + 45, yPosition);
      
      yPosition += 8;
    });

    // === PIED DE PAGE ===
    const footerY = pageHeight - 22;
    
    // Ligne de séparation
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Mentions légales
    doc.setFontSize(7);
    doc.setTextColor('#9CA3AF');
    doc.setFont('helvetica', 'normal');
    
    const footerTexts = [
      'ONG SALAMA - Centre Médical | Tous droits réservés © ' + new Date().getFullYear(),
      `Document généré électroniquement - ${refNumber}`
    ];

    footerTexts.forEach((text, index) => {
      doc.text(text, pageWidth / 2, footerY + (index * 4), { align: 'center' });
    });

    // === ENCADREMENT LÉGER ===
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 2, 2);

    // Sauvegarder le PDF
    const fileName = `Patient_${patient.nom}_${patient.prenom}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

// Hook pour utiliser la génération PDF
export const usePatientPDF = () => {
  const generatePDF = async (patient: Patient) => {
    await generatePatientPDF(patient);
  };

  return { generatePDF };
};