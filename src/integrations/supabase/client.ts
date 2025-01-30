import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szmbzwwkhjmdcptdogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bWJ6d3draGptZGNwdGRvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY2NTQwNDAsImV4cCI6MjAyMjIzMDA0MH0.96XBxYn6645R3QckvGKc0nNQtUhzQh5ZXjHBrIWtZ-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);