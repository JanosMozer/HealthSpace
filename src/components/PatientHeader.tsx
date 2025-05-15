import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PatientHeaderProps {
  connectionStatus: any;
  patient: any;
}

const PatientHeader = ({ connectionStatus, patient }: PatientHeaderProps) => {
  const navigate = useNavigate();
  const { user, isDoctor, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                className={`h-2 w-2 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm text-muted-foreground">
                {connectionStatus.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Patient ID: {patient.identifier}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
                <LogOut className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
