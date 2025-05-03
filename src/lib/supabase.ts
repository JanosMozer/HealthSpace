
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://vrgndduiezexrrjyklso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZ25kZHVpZXpleHJyanlrbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzg5NTksImV4cCI6MjA2MTg1NDk1OX0.l85Y6N8zSj_OfIo1ffASHkutif42jP1yp4JTSpwYGUk';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
