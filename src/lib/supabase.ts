import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://vrgndduiezexrrjyklso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZ25kZHVpZXpleHJyanlrbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzg5NTksImV4cCI6MjA2MTg1NDk1OX0.l85Y6N8zSj_OfIo1ffASHkutif42jP1yp4JTSpwYGUk';

// --- Modify this line to add explicit headers ---
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
});
// --- End Modification ---

console.log('Supabase client initialized WITH EXPLICIT HEADERS:', supabase);
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
    
    // Test RLS policies and row access
    let dbStatus = {
      isConnected: true,
      patientsAccess: !patientsResult.error,
      doctorsAccess: !doctorsResult.error,
      tablesExist: {
        patients: false,
        doctors: false,
        conditions: false,
        medications: false,
        medical_history: false,
      },
      errors: {
        patients: patientsResult.error,
        doctors: doctorsResult.error
      }
    };
    
    // Check if tables exist and have the right structure
    try {
      // Check schema definitions - removing the catch that was causing the error
      const { data: tableList } = await supabase
        .from('_metadata')
        .select('name');
        
      if (tableList) {
        console.log('Database tables:', tableList);
      }
    } catch (e) {
      // Ignore error, this is just diagnostic
      console.log('Could not check table definitions:', e);
    }
    
    return dbStatus;
  } catch (e) {
    console.error('Supabase status check error:', e);
    return {
      isConnected: false,
      error: e
    };
  }
};

// Explicitly initialize the database by touching each table
export const initializeDatabase = async () => {
  try {
    // Try to access each table to ensure they exist
    const tables = ['patients', 'doctors', 'conditions', 'medications', 'medical_history'];
    const results = await Promise.all(
      tables.map(table => 
        supabase.from(table).select('count').limit(1)
      )
    );
    
    console.log('Database initialization results:', 
      results.map((r, i) => ({ 
        table: tables[i], 
        success: !r.error,
        error: r.error
      }))
    );
    
    // Check RLS policies (optional, can be removed if not used)
    // const { data: policies, error: rpcError } = await supabase.rpc('get_policies');
    // if (rpcError) {
    //   console.warn('Could not check RLS policies:', rpcError);
    //   supabaseErrors.rlsPolicies = rpcError.message;
    // } else {
    //   console.log('RLS Policies:', policies);
    // }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

// Check auth status to see if we have permissions
export const checkAuthStatus = async () => {
  const { data: authData } = await supabase.auth.getSession();
  console.log('Auth status:', authData);
  
  return authData;
};

// Enable debug mode with service role for development
export const enableServiceRole = async () => {
  console.log('WARNING: Attempting to bypass RLS with service role for development');
  // This is just for debugging purposes - would require a service role key in production
  return false;
};
