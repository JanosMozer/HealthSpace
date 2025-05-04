
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientHeaderProps {
  connectionStatus: any;
}

const PatientHeader = ({ connectionStatus }: PatientHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <header className="border-b border-border bg-primary">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/doctor-dashboard')}
            className="mr-4 text-white hover:bg-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">Patient Profile</h1>
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
