// lib/emailTemplates.ts

type SinistreEmailData = {
  assureName: string;
  assureEmail: string;
  numeroDossier: string;
  typeSinistre?: string;
  agentName?: string;
  expertName?: string;
  dateExpertise?: string;
  montantEvalue?: string;
  montantIndemnisation?: string;
  reponse?: string;
};

export const emailTemplates = {
  // 1. Sinistre déclaré
  sinistreDeclare: (data: SinistreEmailData) => ({
    subject: `✅ Sinistre déclaré - Dossier ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ AssuranceApp</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Nouveau sinistre déclaré</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Votre déclaration de sinistre a bien été enregistrée dans notre système.
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📋 N° Dossier :</strong> ${data.numeroDossier}</p>
            <p style="margin: 5px 0;"><strong>🔍 Type :</strong> ${data.typeSinistre || 'Non spécifié'}</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Votre dossier est en cours de traitement. Vous pouvez suivre son évolution dans votre espace personnel.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/sinistres/${data.numeroDossier}" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir mon dossier
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </p>
      </body>
      </html>
    `,
  }),

  // 2. Dossier pris en charge par un agent
  dossierPrisEnCharge: (data: SinistreEmailData) => ({
    subject: `✅ Dossier ${data.numeroDossier} - Pris en charge par votre agent`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #60a5fa); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💼 Dossier pris en charge</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Votre dossier avance !</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Bonne nouvelle ! Votre dossier <strong>${data.numeroDossier}</strong> a été pris en charge par notre agent <strong>${data.agentName}</strong>.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            Votre agent va maintenant analyser votre situation et vous tiendra informé de l'avancement.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // 3. Expert désigné
  expertDesigne: (data: SinistreEmailData) => ({
    subject: `🔍 Expertise programmée - Dossier ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔍 Expertise programmée</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Un expert va évaluer votre sinistre</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Un expert a été désigné pour évaluer les dommages de votre sinistre <strong>${data.numeroDossier}</strong>.
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>👨‍🔧 Expert :</strong> ${data.expertName}</p>
            ${data.dateExpertise ? `<p style="margin: 5px 0;"><strong>📅 Date prévue :</strong> ${data.dateExpertise}</p>` : ''}
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            L'expert vous contactera pour convenir des modalités de la visite.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // 4. Rapport d'expertise disponible
  rapportExpertise: (data: SinistreEmailData) => ({
    subject: `📋 Rapport d'expertise disponible - Dossier ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📋 Rapport d'expertise</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Rapport d'expertise disponible</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Le rapport d'expertise pour votre dossier <strong>${data.numeroDossier}</strong> est maintenant disponible.
          </p>
          ${data.montantEvalue ? `
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;">
            <p style="margin: 5px 0; color: #065f46; font-size: 16px;"><strong>💰 Montant évalué :</strong> ${data.montantEvalue}</p>
          </div>
          ` : ''}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/sinistres/${data.numeroDossier}" 
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Consulter le rapport
          </a>
        </div>
      </body>
      </html>
    `,
  }),

  // 5. Indemnisation en cours
  indemnisation: (data: SinistreEmailData) => ({
    subject: `💰 Indemnisation en cours - Dossier ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💰 Indemnisation</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Votre indemnisation est en cours</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            L'indemnisation pour votre dossier <strong>${data.numeroDossier}</strong> est en cours de traitement.
          </p>
          ${data.montantIndemnisation ? `
          <div style="background: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c7d2fe;">
            <p style="margin: 5px 0; color: #3730a3; font-size: 18px;"><strong>Montant :</strong> ${data.montantIndemnisation}</p>
          </div>
          ` : ''}
          <p style="color: #4b5563; line-height: 1.6;">
            Le versement sera effectué dans les plus brefs délais.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // 6. Dossier clôturé
  dossierCloture: (data: SinistreEmailData) => ({
    subject: `✅ Dossier clôturé - ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Dossier clôturé</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Votre dossier est maintenant clôturé</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Nous vous informons que votre dossier <strong>${data.numeroDossier}</strong> a été clôturé avec succès.
          </p>
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;">
            <p style="color: #065f46;">✅ Toutes les étapes ont été complétées</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Nous vous remercions de votre confiance. N'hésitez pas à nous contacter pour toute question.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // 7. Réclamation répondue
  reclamationReponse: (data: SinistreEmailData) => ({
    subject: `💬 Réponse à votre demande - Dossier ${data.numeroDossier}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💬 Réponse à votre demande</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Nous avons répondu à votre demande</h2>
          <p style="color: #4b5563; line-height: 1.6;">Bonjour <strong>${data.assureName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Suite à votre demande concernant le dossier <strong>${data.numeroDossier}</strong>, voici notre réponse :
          </p>
          <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #99f6e4;">
            <p style="color: #134e4a; line-height: 1.6;">${data.reponse}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/sinistres/${data.numeroDossier}" 
             style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir mon dossier
          </a>
        </div>
      </body>
      </html>
    `,
  }),
};