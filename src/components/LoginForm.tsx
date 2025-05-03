
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock login for demo purposes
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Admin login
      if (email.toLowerCase() === 'admin' && password === '3581') {
        toast({
          title: "Admin login successful",
          description: "Welcome, Administrator.",
        });
        navigate('/doctor-dashboard');
      }
      // Doctor login
      else if (email.endsWith('@doctor.med')) {
        toast({
          title: "Login successful",
          description: "Welcome back, Doctor.",
        });
        navigate('/doctor-dashboard');
      } 
      // Patient login using 9-digit ID
      else if (email.length === 9 && !isNaN(Number(email))) {
        // Patient login using 9-digit ID
        const birthDatePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (birthDatePattern.test(password)) {
          toast({
            title: "Patient login successful",
            description: "Redirecting to your profile.",
          });
          navigate(`/patient-profile/${email}`);
        } else {
          toast({
            title: "Invalid credentials",
            description: "Please check your birth date (YYYY-MM-DD).",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg border border-primary/20">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-foreground">Medical Portal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access patient records
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4 rounded-md">
          <div>
            <Label htmlFor="email">Email, Admin, or Patient ID</Label>
            <Input
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@doctor.med, admin, or 9-digit ID"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password or Birth Date</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password or YYYY-MM-DD"
              required
              className="mt-1"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
