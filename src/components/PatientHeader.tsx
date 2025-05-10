
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
            {/* Display patient information in header */}
            {patient && (
              <div className="text-white">
                <h1 className="text-lg font-bold">{patient.name}</h1>
                <div className="flex items-center text-xs space-x-4">
                  <span>ID: {patient.identifier}</span>
                  <span>{patient.age} years ({patient.gender})</span>
                  <span>DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Doctor information */}
            {isDoctor && doctor && (
              <div className="hidden md:block text-right text-white text-sm">
                <span>{doctor.name}</span>
                {doctor.workplace && (
                  <span className="ml-1">, {doctor.workplace}</span>
                )}
              </div>
            )}
            
            {isDoctor && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePatientSearch}
                className="text-white hover:bg-primary/80"
                title="Search Patients"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-white hover:bg-primary/80"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
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
