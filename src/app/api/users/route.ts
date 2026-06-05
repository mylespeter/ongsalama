// app/api/users/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  
  const supabase = await createClient();
  
  let query = supabase.from('users').select('id, email, nom, telephone, role');
  
  if (role) {
    query = query.eq('role', role);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}