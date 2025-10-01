import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@supabase/supabase-js';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// @ts-ignore
const isSupabase = CONFIG.auth.method === 'supabase';
// @ts-ignore
const supabaseUrl = CONFIG.supabase.url;
// @ts-ignore
const supabaseKey = CONFIG.supabase.key;

export const supabase = isSupabase
  ? createClient(supabaseUrl, supabaseKey)
  : ({} as SupabaseClient<any, 'public', any>);
