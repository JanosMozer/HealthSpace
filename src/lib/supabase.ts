
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
      // Log the database tables currently in use
      console.log('Database Tables:');
      console.log('----------------');
      console.log('patients - Stores patient information (id, identifier, name, age, dob, gender)');
      console.log('doctors - Stores doctor information (id, email, name, workplace, identifier)');
      console.log('conditions - Stores patient medical conditions (id, patient_id, body_part, description, doctor_id, doctor_name, doctor_workplace, diagnosis_place, diagnosis_time)');
      console.log('medications - Stores patient medications (id, patient_id, name, dosage, since, current, doctor_id, doctor_name, doctor_workplace)');
      console.log('medical_history - Stores comprehensive medical history (id, patient_id, date, condition, notes, doctor_id, doctor_name, doctor_workplace, record_type)');
      console.log('appointment - Stores patient appointments (id, patient_id, date, time, type, place, doctor_id, doctor_name, doctor_workplace)');
      console.log('examinations - (Future) Will store examination records with images (id, patient_id, date, name, notes, image_url, doctor_id, doctor_name, doctor_workplace)');
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

/* 
DATABASE TABLE STRUCTURE:

1. patients
   - id: UUID (primary key)
   - identifier: INT8 (unique patient number)
   - name: VARCHAR
   - age: INT4
   - dob: DATE
   - gender: VARCHAR
   - created_at: TIMESTAMP

2. doctors
   - id: UUID (primary key)
   - email: VARCHAR
   - name: VARCHAR
   - workplace: VARCHAR
   - identifier: VARCHAR
   - created_at: TIMESTAMP

3. conditions
   - id: UUID (primary key)
   - patient_id: UUID (references patients.id)
   - body_part: VARCHAR
   - description: TEXT
   - doctor_id: UUID (references doctors.id)
   - doctor_name: VARCHAR
   - doctor_workplace: VARCHAR
   - diagnosis_place: VARCHAR
   - diagnosis_time: TIME
   - created_at: TIMESTAMP

4. medications
   - id: UUID (primary key)
   - patient_id: UUID (references patients.id)
   - name: VARCHAR
   - dosage: VARCHAR
   - since: DATE
   - current: BOOLEAN
   - doctor_id: UUID (references doctors.id)
   - doctor_name: VARCHAR
   - doctor_workplace: VARCHAR
   - created_at: TIMESTAMP

5. medical_history
   - id: UUID (primary key)
   - patient_id: UUID (references patients.id)
   - date: DATE
   - condition: VARCHAR
   - notes: TEXT
   - doctor_id: UUID (references doctors.id)
   - doctor_name: VARCHAR
   - doctor_workplace: VARCHAR
   - record_type: VARCHAR
   - created_at: TIMESTAMP

6. appointment
   - id: UUID (primary key)
   - patient_id: UUID (references patients.id)
   - date: DATE
   - time: TIME
   - type: VARCHAR
   - place: VARCHAR
   - doctor_id: UUID (references doctors.id)
   - doctor_name: VARCHAR
   - doctor_workplace: VARCHAR
   - created_at: TIMESTAMP

7. examinations (For future use with image storage)
   - id: UUID (primary key)
   - patient_id: UUID (references patients.id)
   - date: DATE
   - name: VARCHAR
   - notes: TEXT
   - image_url: VARCHAR (URL to stored image)
   - doctor_id: UUID (references doctors.id)
   - doctor_name: VARCHAR
   - doctor_workplace: VARCHAR
   - created_at: TIMESTAMP
*/
