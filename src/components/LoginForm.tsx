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

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      // Sign up logic
      try {
        // --- Debugging Step 1: Log the client instance ---
        console.log('Using Supabase client instance in handleDoctorSubmit:', supabase);

        // --- Debugging Step 2: Test a simple SELECT request ---
        console.log('Attempting a test SELECT from doctors...');
        const { data: testData, error: testError } = await supabase
          .from('doctors')
          .select('id') // Select a simple column
          .limit(1);

        if (testError) {
          console.error('Test SELECT failed:', testError);
          // Check network tab even on failure - did it send headers?
        } else {
          console.log('Test SELECT successful:', testData);
          // Check network tab - did it send headers?
        }
        // --- End Debugging Step 2 ---

        // --- Original INSERT logic ---
        console.log('Attempting INSERT into doctors with data:', {
          email: doctorEmail,
          name: doctorName,
          workplace: doctorWorkplace,
          identifier: doctorIdentifier,
        });
        const { data, error } = await supabase
          .from('doctors')
          .insert([
            {
              email: doctorEmail,
              name: doctorName,
              workplace: doctorWorkplace,
              identifier: doctorIdentifier,
            },
          ])
          .select(); // Add select() to get the inserted data back

        console.log('Doctor INSERT result:', { data, error });

        if (error) {
          // Log the specific error
          console.error("Doctor signup INSERT error:", error);
          // Check if it's the RLS error (42501) or still the Auth error (401)
          if (error.code === '42501') {
            toast({
              title: "Signup Failed",
              description: "Row Level Security policy prevents registration. Please check Supabase policies.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message || "Could not create doctor account.",
              variant: "destructive",
            });
          }
          return; // Stop execution on error
        }

        // If insert was successful
        toast({
          title: "Signup successful",
          description: "Doctor account created. Please log in.",
        });
        // Optionally log the user in automatically or switch view
        setIsSignUp(false); // Switch back to login view after successful signup

      } catch (error) {
        console.error("Doctor signup unexpected error:", error);
        toast({
          title: "Signup failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
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
