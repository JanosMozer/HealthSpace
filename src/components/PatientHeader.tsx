
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface PatientHeaderProps {
  connectionStatus: any;
  patientName?: string;
}

const PatientHeader = ({ connectionStatus, patientName = 'Patient Profile' }: PatientHeaderProps) => {
  const navigate = useNavigate();
  const { logout, isDoctor, doctor } = useAuth();

  const handleBack = () => {
    if (isDoctor) {
      navigate('/doctor-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    // For doctors, we'll redirect to the login page but with a message
    // that they can log back in. For patients, just go to the main login page.
    navigate('/');
  };

  return (
    <>
      <header className="border-b border-border bg-primary">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="mr-2 text-white hover:bg-primary/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-white">{patientName}</h1>
            {isDoctor && doctor && (
              <span className="text-sm text-white/80 ml-4">
                Dr. {doctor.name}
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-white hover:bg-primary/80"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Connection status indicator for development */}
      {connectionStatus && !connectionStatus.isConnected && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 container max-w-7xl mx-auto mt-4">
          <p className="font-medium">Database connection error</p>
          <p className="text-sm">Check console for details. Using demo data.</p>
        </div>
      )}
    </>
  );
};

export default PatientHeader;
