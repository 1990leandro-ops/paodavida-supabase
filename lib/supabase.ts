import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uyfvxtyvpuhysdjdzbwp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZnZ4dHl2cHVoeXNkamR6YndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODM0MzEsImV4cCI6MjA4NzU1OTQzMX0.VI7mQR8potnYwFmXALY2nYyqqqIdiif0lLzYu11Etto";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
