
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
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Validation function
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    newErrors[name] = !value.trim();
    setErrors(newErrors);
    return !!value.trim();
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const isIdValid = validateField('patientId', patientId);
    const isDobValid = validateField('patientDob', patientDob);
    
    if (!isIdValid || !isDobValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
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
        setLoading(false);
        return;
      }
      
      // Validate date of birth matches
      const patientDobDate = patientDob;
      const dbDobDate = data.dob;
      
      if (patientDobDate !== dbDobDate) {
        toast({
          title: "Invalid credentials",
          description: "The date of birth does not match our records.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Store patient session
      sessionStorage.setItem("patientId", data.identifier);
      sessionStorage.setItem("userType", "patient");
      
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
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Validate sign-up fields
      const isEmailValid = validateField('doctorEmail', doctorEmail);
      const isPasswordValid = validateField('doctorPassword', doctorPassword);
      const isNameValid = validateField('doctorName', doctorName);
      const isWorkplaceValid = validateField('doctorWorkplace', doctorWorkplace);
      const isIdentifierValid = validateField('doctorIdentifier', doctorIdentifier);
      
      if (!isEmailValid || !isPasswordValid || !isNameValid || !isWorkplaceValid || !isIdentifierValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Validate login fields
      const isEmailValid = validateField('doctorEmail', doctorEmail);
      const isPasswordValid = validateField('doctorPassword', doctorPassword);
      
      if (!isEmailValid || !isPasswordValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }
    
    setLoading(true);
    
    if (isSignUp) {
      // Sign up logic
      try {
        console.log('Using Supabase client instance in handleDoctorSubmit:', supabase);
        console.log('Attempting a test SELECT from doctors...');
        const { data: testData, error: testError } = await supabase
          .from('doctors')
          .select('id')
          .limit(1);

        if (testError) {
          console.error('SELECT failed:', testError);
        } else {
          console.log('SELECT successful:', testData);
        }
        console.log(' INSERT:', {
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
          .select();

        console.log('Doctor INSERT result:', { data, error });

        if (error) {
          console.error("Doctor signup INSERT error:", error);
          toast({
            title: "Signup Failed",
            description: error.message || "Could not create doctor account.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Signup successful",
          description: "Doctor account created. Please log in.",
        });
        setIsSignUp(false);

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
          sessionStorage.setItem("userType", "doctor");
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
                  placeholder="Enter your patient ID"
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    validateField('patientId', e.target.value);
                  }}
                  className={errors.patientId ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  required
                />
                {errors.patientId && <p className="text-xs text-red-500">Patient ID is required</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientDob">Date of Birth</Label>
                <Input
                  id="patientDob"
                  type="password"
                  placeholder="Enter your date of birth (YYYY-MM-DD)"
                  value={patientDob}
                  onChange={(e) => {
                    setPatientDob(e.target.value);
                    validateField('patientDob', e.target.value);
                  }}
                  className={errors.patientDob ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  required
                />
                {errors.patientDob && <p className="text-xs text-red-500">Date of birth is required</p>}
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
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
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
                      onChange={(e) => {
                        setDoctorEmail(e.target.value);
                        validateField('doctorEmail', e.target.value);
                      }}
                      className={errors.doctorEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorEmail && <p className="text-xs text-red-500">Email is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorPassword">Password</Label>
                    <Input
                      id="doctorPassword"
                      type="password"
                      placeholder="Create a password"
                      value={doctorPassword}
                      onChange={(e) => {
                        setDoctorPassword(e.target.value);
                        validateField('doctorPassword', e.target.value);
                      }}
                      className={errors.doctorPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorPassword && <p className="text-xs text-red-500">Password is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Full Name</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. Jane Smith"
                      value={doctorName}
                      onChange={(e) => {
                        setDoctorName(e.target.value);
                        validateField('doctorName', e.target.value);
                      }}
                      className={errors.doctorName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorName && <p className="text-xs text-red-500">Full name is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorWorkplace">Workplace</Label>
                    <Input
                      id="doctorWorkplace"
                      placeholder="Hospital or Clinic Name"
                      value={doctorWorkplace}
                      onChange={(e) => {
                        setDoctorWorkplace(e.target.value);
                        validateField('doctorWorkplace', e.target.value);
                      }}
                      className={errors.doctorWorkplace ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorWorkplace && <p className="text-xs text-red-500">Workplace is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorIdentifier">Identifier</Label>
                    <Input
                      id="doctorIdentifier"
                      placeholder="Your unique doctor ID"
                      value={doctorIdentifier}
                      onChange={(e) => {
                        setDoctorIdentifier(e.target.value);
                        validateField('doctorIdentifier', e.target.value);
                      }}
                      className={errors.doctorIdentifier ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorIdentifier && <p className="text-xs text-red-500">Identifier is required</p>}
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
                      onChange={(e) => {
                        setDoctorEmail(e.target.value);
                        validateField('doctorEmail', e.target.value);
                      }}
                      className={errors.doctorEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorEmail && <p className="text-xs text-red-500">Email or identifier is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctorPassword">Password</Label>
                    <Input
                      id="doctorPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={doctorPassword}
                      onChange={(e) => {
                        setDoctorPassword(e.target.value);
                        validateField('doctorPassword', e.target.value);
                      }}
                      className={errors.doctorPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      required
                    />
                    {errors.doctorPassword && <p className="text-xs text-red-500">Password is required</p>}
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
