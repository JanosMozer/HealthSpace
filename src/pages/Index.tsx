
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-medical-primary">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">PatientCanvas</h1>
        <p className="text-medical-light">Medical Information Management System</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Index;
