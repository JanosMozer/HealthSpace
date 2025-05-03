
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Doctor } from '@/types/patient';

interface AuthContextType {
  doctor: Doctor | null;
  isDoctor: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedDoctor = sessionStorage.getItem('doctor');
    if (storedDoctor) {
      try {
        setDoctor(JSON.parse(storedDoctor));
      } catch (e) {
        console.error('Failed to parse stored doctor:', e);
        sessionStorage.removeItem('doctor');
      }
    }
    
    // Check for admin user session
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin && !doctor) {
      setDoctor({
        id: 'admin',
        email: 'admin@hospital.com',
        name: 'Admin User',
        workplace: 'Hospital Admin',
        identifier: 'admin'
      });
    }
    
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    // Admin hardcoded account
    if (identifier === 'admin' && password === '3581') {
      const adminDoctor = {
        id: 'admin',
        email: 'admin@hospital.com',
        name: 'Admin User',
        workplace: 'Hospital Admin',
        identifier: 'admin'
      };
      
      setDoctor(adminDoctor);
      sessionStorage.setItem('doctor', JSON.stringify(adminDoctor));
      sessionStorage.setItem('isAdmin', 'true');
      
      return { success: true, message: 'Welcome, Admin!' };
    }
    
    // Regular doctor login via Supabase
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('identifier', identifier)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Doctor not found' };
      }
      
      // In a real app, we'd check the hashed password here
      // For now, just simulate successful login
      setDoctor(data);
      sessionStorage.setItem('doctor', JSON.stringify(data));
      
      return { success: true, message: `Welcome, Dr. ${data.name}!` };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setDoctor(null);
    sessionStorage.removeItem('doctor');
    sessionStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ doctor, isDoctor: !!doctor, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
