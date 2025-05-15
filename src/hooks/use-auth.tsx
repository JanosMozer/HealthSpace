
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Doctor } from '@/types/patient';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: { email: string } | null; // Add user property to fix the error
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
  const [user, setUser] = useState<{ email: string } | null>(null); // Add user state

  useEffect(() => {
    // Check for stored session
    const storedDoctor = sessionStorage.getItem('doctor');
    if (storedDoctor) {
      try {
        const doctorData = JSON.parse(storedDoctor);
        setDoctor(doctorData);
        setUser({ email: doctorData.email }); // Set user email from doctor data
      } catch (e) {
        console.error('Failed to parse stored doctor:', e);
        sessionStorage.removeItem('doctor');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    // Regular doctor login via Supabase
    try {
      // Try to find doctor by identifier or email
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(`identifier.eq.${identifier},email.eq.${identifier}`)
        .single();
      
      if (error || !data) {
        console.log('Error or no data found:', error);
        return { success: false, message: 'Doctor not found or invalid credentials' };
      }
      
      // In a real app, we'd check the hashed password here
      // For now, just simulate successful login with any password
      setDoctor(data);
      setUser({ email: data.email }); // Set user email
      sessionStorage.setItem('doctor', JSON.stringify(data));
      
      return { success: true, message: `Welcome, Dr. ${data.name}!` };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setDoctor(null);
    setUser(null); // Clear user
    sessionStorage.removeItem('doctor');
    sessionStorage.removeItem('userType');
    
    // Redirect to login page
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, doctor, isDoctor: !!doctor, loading, login, logout }}>
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
