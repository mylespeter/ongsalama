// app/api/send-notification-expert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expertiseId } = body;

    const supabase = await createClient();

    // Récupérer les infos de l'expertise
    const { data: expertise, error } = await supabase
      .from('expertises')
      .select(`
        sinistre:sinistres(numero_dossier, type_sinistre, lieu),
        expert:users!expertises_expert_id_fkey(email, nom)
      `)
      .eq('id', expertiseId)
      .single();

    if (error || !expertise) {
      return NextResponse.json({ success: false, error: 'Expertise non trouvée' }, { status: 404 });
    }

    const expert = Array.isArray(expertise.expert) ? expertise.expert[0] : expertise.expert;
    const sinistre = Array.isArray(expertise.sinistre) ? expertise.sinistre[0] : expertise.sinistre;

    if (!expert?.email || !sinistre) {
      return NextResponse.json({ success: false, error: 'Données manquantes' }, { status: 400 });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔍 Nouvelle mission d'expertise</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563;">Bonjour <strong>${expert.nom}</strong>,</p>
          <p style="color: #4b5563;">Une nouvelle mission d'expertise vous a été assignée.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📋 Dossier :</strong> ${sinistre.numero_dossier}</p>
            <p style="margin: 5px 0;"><strong>🔍 Type :</strong> ${sinistre.type_sinistre}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> ${sinistre.lieu}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/expert/missions" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Voir mes missions
          </a>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(expert.email, `🔍 Nouvelle mission - ${sinistre.numero_dossier}`, html);

    return NextResponse.json({ success: result.success });
  } catch (error: any) {
    console.error('❌ Erreur API notification expert:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}