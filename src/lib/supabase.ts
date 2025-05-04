
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://vrgndduiezexrrjyklso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZ25kZHVpZXpleHJyanlrbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzg5NTksImV4cCI6MjA2MTg1NDk1OX0.l85Y6N8zSj_OfIo1ffASHkutif42jP1yp4JTSpwYGUk';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('patients').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (e) {
    console.error('Failed to check Supabase connection:', e);
    return false;
  }
};

// Helper for debugging
export const getSupabaseStatus = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test patients table access
    const patientsResult = await supabase.from('patients').select('*').limit(1);
    console.log('Patients query result:', patientsResult);

    // Test doctors table access
    const doctorsResult = await supabase.from('doctors').select('*').limit(1);
    console.log('Doctors query result:', doctorsResult);
    
    return {
      isConnected: true,
      patientsAccess: !patientsResult.error,
      doctorsAccess: !doctorsResult.error,
      errors: {
        patients: patientsResult.error,
        doctors: doctorsResult.error
      }
    };
  } catch (e) {
    console.error('Supabase status check error:', e);
    return {
      isConnected: false,
      error: e
    };
  }
};
