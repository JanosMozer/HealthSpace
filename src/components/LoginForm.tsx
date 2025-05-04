import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

const LoginForm = () => {
  const [patientId, setPatientId] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorWorkplace, setDoctorWorkplace] = useState("");
  const [doctorIdentifier, setDoctorIdentifier] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate patient exists
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('identifier', patientId)
        .single();
      
      if (error || !data) {
        toast({
          title: "Patient not found",
          description: "Please check your patient ID and try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate date of birth matches
      const patientDobDate = new Date(patientDob).toISOString().split('T')[0];
      const dbDobDate = new Date(data.dob).toISOString().split('T')[0];
      
      if (patientDobDate !== dbDobDate) {
        toast({
          title: "Invalid credentials",
          description: "The date of birth does not match our records.",
          variant: "destructive"
        });
        return;
      }
      
      // Store patient session
      sessionStorage.setItem("patientId", data.identifier);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${data.name}`,
      });
      
      navigate(`/patient-profile/${data.identifier}`);
      
    } catch (error) {
      console.error("Patient login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSignup = async () => {
    // ... validation ...
    try {
      console.log('Using Supabase client for signup:', supabase); // Add this line
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ name: doctorName, password: doctorPassword }])
        .select();
    } catch (error) {
      console.error("Doctor signup error:", error);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      // Sign up logic
      try {
        // Check if identifier already exists
        const { data: existingDoctor, error: checkError } = await supabase
          .from('doctors')
          .select('identifier')
          .eq('identifier', doctorIdentifier)
          .maybeSingle();
          
        if (existingDoctor) {
          toast({
            title: "Registration failed",
            description: "This identifier is already in use.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Create new doctor
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            email: doctorEmail,
            name: doctorName,
            workplace: doctorWorkplace,
            identifier: doctorIdentifier
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Auto login after signup
        const loginResult = await login(doctorIdentifier, doctorPassword);
        
        if (loginResult.success) {
          toast({
            title: "Registration successful",
            description: `Welcome, Dr. ${doctorName}`,
          });
          navigate("/doctor-dashboard");
        } else {
          toast({
            title: "Registration successful",
            description: "Your account has been created. Please log in.",
          });
          setIsSignUp(false);
        }
        
      } catch (error) {
        console.error("Doctor registration error:", error);
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Login logic
      try {
        const result = await login(doctorEmail, doctorPassword);
        
        if (result.success) {
          navigate("/doctor-dashboard");
        } else {
          toast({
            title: "Login failed",
            description: result.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Doctor login error:", error);
        toast({
          title: "Login failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-primary">
      <Tabs defaultValue="patient" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          <TabsContent value="patient">
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  placeholder="Enter your 9-digit ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientDob">Date of Birth</Label>
                <Input
                  id="patientDob"
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: YYYY-MM-DD</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="doctor">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{isSignUp ? "Create Account" : "Doctor Login"}</h3>
              <Button 
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="p-0 h-auto"
              >
                {isSignUp ? "Back to Login" : "Sign Up"}
              </Button>
            </div>
            
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              {isSignUp ? (
                // Sign Up Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="doctorEmail">Email</Label>
                    <Input
                      id="doctorEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorPassword">Password</Label>
                    <Input
                      id="doctorPassword"
                      type="password"
                      placeholder="Create a password"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Full Name</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. Jane Smith"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorWorkplace">Workplace</Label>
                    <Input
                      id="doctorWorkplace"
                      placeholder="Hospital or Clinic Name"
                      value={doctorWorkplace}
                      onChange={(e) => setDoctorWorkplace(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorIdentifier">Identifier</Label>
                    <Input
                      id="doctorIdentifier"
                      placeholder="Your unique doctor ID"
                      value={doctorIdentifier}
                      onChange={(e) => setDoctorIdentifier(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">A unique identifier for your account</p>
                  </div>
                </>
              ) : (
                // Login Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="doctorEmail">Email/Identifier</Label>
                    <Input
                      id="doctorEmail"
                      placeholder="Enter your email or ID"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorPassword">Password</Label>
                    <Input
                      id="doctorPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Use "3581" for demo admin login</p>
                  </div>
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 
                  (isSignUp ? "Creating Account..." : "Logging in...") : 
                  (isSignUp ? "Create Account" : "Login")}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default LoginForm;
