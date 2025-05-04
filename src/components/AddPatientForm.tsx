
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

const AddPatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: 'Not Specified',
    profileType: 'patient',
    patientId: generateRandomId(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formData.profileType === 'patient') {
      try {
        // Calculate age from DOB
        const age = calculateAge(formData.dob);
        
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
          throw error;
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
      // Handle doctor creation (not modifying this functionality)
      setTimeout(() => {
        toast({
          title: "Profile created successfully",
          description: `Doctor account created for ${formData.email}`,
        });
        
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New {formData.profileType === 'patient' ? 'Patient' : 'Doctor'}</DialogTitle>
        <DialogDescription>
          {formData.profileType === 'patient' 
            ? 'Add a new patient to the system.' 
            : 'Add a new doctor to the system.'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {formData.profileType === 'patient' ? null : (
          <RadioGroup
            defaultValue="patient"
            value={formData.profileType}
            onValueChange={handleProfileTypeChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="patient" id="patient" />
              <Label htmlFor="patient">Patient</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doctor" id="doctor" />
              <Label htmlFor="doctor">Doctor</Label>
            </div>
          </RadioGroup>
        )}

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
        
        {formData.profileType === 'patient' && (
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
        )}

        {formData.profileType === 'doctor' && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required={formData.profileType === 'doctor'}
              placeholder="doctor@doctor.med"
            />
          </div>
        )}

        {formData.profileType === 'patient' && (
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
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            className="bg-medical-secondary hover:bg-medical-accent" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : `Create ${formData.profileType === 'patient' ? 'Patient' : 'Doctor'}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientForm;
