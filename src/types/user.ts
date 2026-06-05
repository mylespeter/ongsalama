
// app/types/user.ts
export type UserRole = 'admin' | 'check_in_admin' | 'teacher' | 'student' | 'alumni' | 'agent';

export interface User {
  id: string;
  username: string;
  password: string; // En pratique, il faudrait hacher les mots de passe
  role: UserRole;
  active?: boolean; // Rendue optionnelle
  name: string;
  email: string;
  profil_url: string;
  privileged?: boolean; // Ajouté pour la barre de statut des privilèges
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