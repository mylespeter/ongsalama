// app/admin/acteurs/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Récupérer tous les utilisateurs
export async function getUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Créer un utilisateur
export async function createUser(data: {
  email: string;
  nom: string;
  telephone?: string;
  mot_de_passe: string;
  role: 'admin' | 'agent' | 'expert' | 'assure';
}) {
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      email: data.email.toLowerCase().trim(),
      nom: data.nom,
      telephone: data.telephone,
      mot_de_passe: data.mot_de_passe,
      role: data.role,
      first_login: true,
    }])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
  return user;
}

// Mettre à jour un utilisateur
export async function updateUser(id: string, data: {
  email?: string;
  nom?: string;
  telephone?: string;
  mot_de_passe?: string;
  role?: 'admin' | 'agent' | 'expert' | 'assure';
}) {
  const supabase = await createClient();
  
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (data.email) {
    updateData.email = data.email.toLowerCase().trim();
  }

  if (!data.mot_de_passe) {
    delete updateData.mot_de_passe;
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
  return user;
}

// Supprimer un utilisateur
export async function deleteUser(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/admin/acteurs');
}