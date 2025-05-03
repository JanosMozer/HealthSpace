
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">PatientCanvas</h1>
        <p className="text-muted-foreground">Medical Information Management System</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Index;
