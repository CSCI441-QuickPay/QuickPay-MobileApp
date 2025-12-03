import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Read extras from expo manifest or process.env
const extras =
  (Constants.manifest && Constants.manifest.extra) ||
  (Constants.expoConfig && Constants.expoConfig.extra) ||
  {};

const SUPABASE_URL =
  extras.EXPO_PUBLIC_SUPABASE_URL ||
  extras.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  extras.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extras.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabaseConfig] Missing Supabase config. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env or to app.config.js.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);