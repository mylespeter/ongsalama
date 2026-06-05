// lib/types.ts
export type UserRole = 'admin' | 'check_in_admin' | 'teacher' | 'student' | 'alumni' | 'agent';

export interface Faculte {
  id: number
  nom: string
  code: string
  created_at: string
}

export interface AnneeAcademique {
  id: number
  annee: string
  created_at: string
}

export interface Departement {
  id: number
  nom: string
  code: string
  faculte_id: number
  created_at: string
  faculte?: Faculte
}

export interface Filiere {
  id: number
  nom: string
  code: string
  departement_id: number
  created_at: string
  departement?: Departement
}


export interface SessionUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  privileged?: boolean;
  departement?: string;
  profil_url?: string;
  bio?: string;
  active?: boolean;
}
export interface User {
  id: string
  username: string
  email: string
  password: string
  role: 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin'
  name: string
  active: boolean
  privileged: boolean
  departement?: string
  profil_url?: string
  bio?: string
  last_login?: string
  created_at: string
  updated_at: string
}
export interface TFC {
  id: number
  titre: string
  resume: string
  mots_cles: string[]
  auteur: string
  auteur_email: string
  promoteur: string
  faculte_id: number
  annee_academique_id: number
  departement_id: number
  filiere_id: number
  fichier_nom: string
  fichier_chemin: string
  fichier_taille: number
  fichier_type: string
  date_soutenance: string
  note: number
  statut: string
   embedding?: number[] // Ajouter le champ embedding
  created_at: string
  updated_at: string
  
  // Relations
  faculte?: Faculte
  annee_academique?: AnneeAcademique
  departement?: Departement
  filiere?: Filiere
}

export interface TFCFormData {
  titre: string
  resume: string
  mots_cles: string
  auteur: string
  auteur_email: string
  promoteur: string
  faculte_id: number
  annee_academique_id: number
  departement_id: number
  filiere_id: number
  date_soutenance: string
  note: number
  fichier: File | null
  cas_application: string
  technologies?: string;
  fonctionnalites?: string
  doc_available?: boolean
  added_by_user_id?: string; // Nouveau champ
  added_by_name?: string;    // Nouveau champ
}