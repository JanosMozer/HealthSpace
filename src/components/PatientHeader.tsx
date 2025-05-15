import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Search, HeartPulse } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Patient } from '@/types/patient';

interface PatientHeaderProps {
  connectionStatus: any;
  patient?: Patient;
}

const PatientHeader = ({ connectionStatus, patient }: PatientHeaderProps) => {
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
    navigate('/');
  };

  const handlePatientSearch = () => {
    navigate('/doctor-dashboard');
  };

  return (
    <header className="bg-background border-b px-4 py-3 sticky top-0 z-50 print:hidden shadow-sm">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <HeartPulse className="h-6 w-6 text-primary mr-2" />
            <span>HealthSpace</span>
          </Link>
          {connectionStatus && (
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {connectionStatus.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isDoctor && doctor && (
            <div className="hidden md:block text-right text-sm">
              <span>{doctor.name}</span>
              {doctor.workplace && <span className="ml-1">, {doctor.workplace}</span>}
            </div>
          )}
          {isDoctor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePatientSearch}
              className="text-muted-foreground hover:bg-muted/10"
              title="Search Patients"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:bg-muted/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
