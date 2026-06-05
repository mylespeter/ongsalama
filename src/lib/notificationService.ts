// lib/notificationService.ts
import { sendEmail } from './email';
import { emailTemplates } from './emailTemplates';
import { supabase } from './supabase';

type NotificationType = keyof typeof emailTemplates;

export async function notifierAssure(
  sinistreId: string,
  typeNotification: NotificationType,
  extraData: any = {}
) {
  try {
    console.log(`📧 Préparation notification "${typeNotification}" pour sinistre ${sinistreId}`);
    
    // Récupérer les infos du sinistre et de l'assuré
    const { data, error } = await supabase
      .from('sinistres')
      .select(`
        numero_dossier,
        type_sinistre,
        assure:users!sinistres_assure_id_fkey(email, nom)
      `)
      .eq('id', sinistreId)
      .single();

    if (error) {
      console.error('❌ Erreur récupération sinistre:', error);
      return false;
    }

    // Gérer le cas où assure est un tableau (problème de typage Supabase)
    const assureData = Array.isArray(data.assure) ? data.assure[0] : data.assure;

    if (!assureData?.email) {
      console.error('❌ Assuré non trouvé ou pas d\'email');
      return false;
    }

    const templateData = {
      assureName: assureData.nom,
      assureEmail: assureData.email,
      numeroDossier: data.numero_dossier,
      typeSinistre: data.type_sinistre,
      ...extraData,
    };

    const template = emailTemplates[typeNotification](templateData);

    // Envoyer l'email
    const result = await sendEmail(
      assureData.email,
      template.subject,
      template.html
    );

    // Enregistrer la notification en BDD
    await supabase.from('sinistre_communications').insert({
      sinistre_id: sinistreId,
      type: 'notification',
      contenu: `📧 Email "${template.subject}" envoyé à ${assureData.email}`,
      expediteur_id: null,
    });

    console.log(`✅ Notification envoyée: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    return result.success;

  } catch (error) {
    console.error('❌ Erreur notification:', error);
    return false;
  }
}

export async function notifierExpertNouvelleMission(
  expertiseId: string,
  expertEmail: string,
  expertName: string,
  sinistreNumero: string,
  typeSinistre: string,
  lieu: string
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔍 Nouvelle mission d'expertise</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563;">Bonjour <strong>${expertName}</strong>,</p>
          <p style="color: #4b5563;">Une nouvelle mission d'expertise vous a été assignée.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📋 Dossier :</strong> ${sinistreNumero}</p>
            <p style="margin: 5px 0;"><strong>🔍 Type :</strong> ${typeSinistre}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> ${lieu}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/expert/missions" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Voir mes missions
          </a>
        </div>
      </body>
      </html>
    `;

    await sendEmail(expertEmail, `🔍 Nouvelle mission - ${sinistreNumero}`, html);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification expert:', error);
    return false;
  }
}