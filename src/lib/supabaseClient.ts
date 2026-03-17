import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqbbqsbmgbfwolewgckq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxYmJxc2JtZ2Jmd29sZXdnY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTAzOTMsImV4cCI6MjA4OTI2NjM5M30.LtODvcrV5WrebLdc6Sm8bbdhakyAE7NBfMPF76UY1Vg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);