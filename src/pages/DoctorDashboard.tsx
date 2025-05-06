
import PatientSearch from '@/components/PatientSearch';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { doctor, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-primary">
        <div className="medical-container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white">PatientCanvas</h1>
            {doctor && (
              <span className="text-sm text-white/80">
                Dr. {doctor.name}
              </span>
            )}
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-primary/80">Logout</Button>
        </div>
      </header>
      
      <main className="medical-container py-8">
        <PatientSearch />
      </main>
    </div>
  );
};

export default DoctorDashboard;
