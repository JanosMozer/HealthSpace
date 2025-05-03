
import PatientSearch from '@/components/PatientSearch';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="medical-container flex h-16 items-center justify-between">
          <h1 className="text-lg font-bold">PatientCanvas</h1>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      
      <main className="medical-container py-8">
        <PatientSearch />
      </main>
    </div>
  );
};

export default DoctorDashboard;
