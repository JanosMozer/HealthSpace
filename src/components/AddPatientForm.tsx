
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
    profileType: 'patient',
    patientId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special validation for patient ID
    if (name === 'patientId') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Only update with digits and limit to 9 characters
      setFormData(prev => ({ 
        ...prev, 
        [name]: digitsOnly.substring(0, 9) 
      }));
      
      // Clear error when field is modified
      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
      
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
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

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    if (!value.trim()) {
      newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      setErrors(newErrors);
      return false;
    }
    
    // Special validation for patient ID
    if (name === 'patientId') {
      if (!/^\d{9}$/.test(value)) {
        newErrors[name] = 'Patient ID must be exactly 9 digits';
        setErrors(newErrors);
        return false;
      }
    }
    
    return true;
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
    
    // Reset errors
    setErrors({});
    
    // Validate all fields
    const isNameValid = validateField('name', formData.name);
    const isDobValid = validateField('dob', formData.dob);
    const isIdValid = validateField('patientId', formData.patientId);
    
    if (!isNameValid || !isDobValid || !isIdValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    
    // Additional check for patient ID format
    if (formData.patientId.length !== 9) {
      setErrors(prev => ({
        ...prev,
        patientId: 'Patient ID must be exactly 9 digits'
      }));
      toast({
        title: "Validation Error",
        description: "Patient ID must be exactly 9 digits",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
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
        }
        setIsSubmitting(false);
        return;
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
            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            required
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            className={errors.dob ? 'border-red-500 focus-visible:ring-red-500' : ''}
            required
          />
          {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={handleGenderChange}
          >
            <SelectTrigger className={errors.gender ? 'border-red-500 focus-visible:ring-red-500' : ''}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Not Specified">Not Specified</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            name="patientId"
            placeholder="Enter 9-digit patient ID"
            value={formData.patientId}
            onChange={handleInputChange}
            className={errors.patientId ? 'border-red-500 focus-visible:ring-red-500' : ''}
            required
            maxLength={9}
          />
          {errors.patientId ? (
            <p className="text-xs text-red-500">{errors.patientId}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Patient ID must be exactly 9 digits
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Patient will use this ID and their birth date to log in
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
