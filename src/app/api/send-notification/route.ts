// app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { emailTemplates } from '@/lib/emailTemplates';
import { createClient } from '@/lib/supabase/server';

// Type pour les clés valides des templates
type NotificationType = keyof typeof emailTemplates;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sinistreId, typeNotification, extraData } = body;

    // ✅ Vérifier que typeNotification est une clé valide
    if (!typeNotification || !(typeNotification in emailTemplates)) {
      return NextResponse.json(
        { success: false, error: `Type de notification invalide: ${typeNotification}` }, 
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: sinistre, error } = await supabase
      .from('sinistres')
      .select('numero_dossier, type_sinistre, assure:users!sinistres_assure_id_fkey(email, nom)')
      .eq('id', sinistreId)
      .single();

    if (error || !sinistre) {
      return NextResponse.json({ success: false, error: 'Sinistre non trouvé' }, { status: 404 });
    }

    const assure = Array.isArray(sinistre.assure) ? sinistre.assure[0] : sinistre.assure;
    
    if (!assure?.email) {
      return NextResponse.json({ success: false, error: 'Email assuré non trouvé' }, { status: 400 });
    }

    const templateData = {
      assureName: assure.nom || 'Client',
      assureEmail: assure.email,
      numeroDossier: sinistre.numero_dossier,
      typeSinistre: sinistre.type_sinistre,
      ...extraData,
    };

    // ✅ Cast explicite pour éviter l'erreur de typage
    const notificationKey = typeNotification as NotificationType;
    const template = emailTemplates[notificationKey](templateData);

    const result = await sendEmail(assure.email, template.subject, template.html);

    await supabase.from('sinistre_communications').insert({
      sinistre_id: sinistreId,
      type: 'notification',
      contenu: `📧 Email "${template.subject}" envoyé à ${assure.email}`,
      expediteur_id: null,
    });

    return NextResponse.json({ success: result.success });
  } catch (error: any) {
    console.error('❌ Erreur API notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}