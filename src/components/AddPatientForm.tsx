import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

const AddPatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: 'Not Specified',
    profileType: 'patient', // Default to patient for doctors adding patients
    patientId: generateRandomId(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Generate a random 9-digit ID
  function generateRandomId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, profileType: value }));
  };
  
  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check connection on component mount
  useState(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      if (!isConnected) {
        toast({
          title: "Database Connection Issue",
          description: "Unable to connect to the database. Some features may not work properly.",
          variant: "destructive"
        });
      }
    };
    
    checkConnection();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formData.profileType === 'patient') {
      try {
        // Calculate age from DOB
        const age = calculateAge(formData.dob);
        
        console.log("Attempting to create patient with data:", {
          identifier: formData.patientId,
          name: formData.name,
          dob: formData.dob,
          gender: formData.gender,
          age
        });
        
        // Insert into Supabase
        const { data, error } = await supabase
          .from('patients')
          .insert({
            identifier: formData.patientId,
            name: formData.name,
            dob: formData.dob,
            gender: formData.gender,
            age: age
          })
          .select();
          
        console.log("Patient creation result:", { data, error });
        
        if (error) {
          if (error.code === '42501') {
            console.error("Permission denied error. This is likely due to RLS policies.");
            toast({
              title: "Permission Error",
              description: "Your account doesn't have permission to create patients. Please check database permissions.",
              variant: "destructive"
            });
          } else {
             console.error("Error creating patient:", error);
             toast({
               title: "Error",
               description: "Failed to create patient profile. Please try again.",
               variant: "destructive"
             });
            // throw error; // Re-throwing might be appropriate depending on desired flow
          }
          setIsSubmitting(false); // Ensure button is re-enabled on error
          return; // Stop execution if there was an error
        }

        toast({
          title: "Patient profile created",
          description: `Patient ID: ${formData.patientId}`,
        });
        
        // Navigate to the patient profile
        navigate(`/patient-profile/${formData.patientId}`);
      } catch (error) {
        console.error("Error creating patient:", error);
        toast({
          title: "Error",
          description: "Failed to create patient profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Doctor creation - for development purposes only
      try {
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            email: formData.email,
            name: formData.name,
            workplace: "Hospital",
            identifier: formData.patientId
          })
          .select();
          
        console.log("Doctor creation result:", { data, error });
        
        if (error) {
          console.error("Doctor registration error:", error);
          toast({
            title: "Registration failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        toast({
          title: "Profile created successfully",
          description: `Doctor account created for ${formData.email}`,
        });
        
        navigate('/doctor-dashboard');
      } catch (error) {
        console.error("Error creating doctor:", error);
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Patient</DialogTitle>
        <DialogDescription>
          Add a new patient to the system
        </DialogDescription>
      </DialogHeader>
      
      {connectionStatus === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Database connection issues detected. Patient data may be saved in demo mode only.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={handleGenderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Not Specified">Not Specified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID (Auto-generated)</Label>
          <Input
            id="patientId"
            name="patientId"
            value={formData.patientId}
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Patient will use this ID and their birth date (YYYY-MM-DD) to log in
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            className="bg-medical-secondary hover:bg-medical-accent" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientForm;
