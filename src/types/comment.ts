// types/comment.ts
export interface Comment {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_profil_url: string | null;
  user_role: string;
  parent_id: string | null;
  has_liked: boolean;
  current_user_id: string | null;
  replies_count: number;
  replies?: Comment[]; // Pour les réponses imbriquées
}

export interface CommentFormData {
  content: string;
  parent_id?: string | null;
}