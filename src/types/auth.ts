export interface UserActivity {
  user_id: string;
  created_at: string;
  page_url?: string;
  action_type?: string;
  users?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    departement?: string;
    profil_url?: string;
    active: boolean;
    last_login?: string;
  };
}

export interface OnlineUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  departement?: string;
  profil_url?: string;
  active: boolean;
  last_activity: string;
  current_page?: string;
  is_online: boolean;
}