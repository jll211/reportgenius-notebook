import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szmbzwwkhjmdcptdogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bWJ6d3draGptZGNwdGRvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNjAwNDksImV4cCI6MjA1MzgzNjA0OX0.EyMlTVtR3uFRwkJSFUjqzcnfJ4jlKn3G7viSc5oNuh4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);