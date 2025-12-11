import { createClient } from '@supabase/supabase-js';

// IMPORTANT : Remplacez ces valeurs par celles de votre projet Supabase (Settings > API)
const supabaseUrl = 'https://vbluadwejpjfrwzefnys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibHVhZHdlanBqZnJ3emVmbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzg0MzAsImV4cCI6MjA4MDk1NDQzMH0.xp7Wy-n3Z6QXNF3A8m6_qgeBHvX5QNg_rXJzDn7fL3w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
