import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

let client: ReturnType<typeof createClient<Database>> | null = null;

const createSupabaseClient = () => {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key not provided');
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
    },
    global: {
      headers: {
        'x-application-name': 'bhb-bolt-ecom',
      },
    },
  });

  return client;
};

export const supabase = createSupabaseClient();