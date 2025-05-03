
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AddPatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile created successfully",
        description: formData.profileType === 'patient' 
          ? `Patient ID: ${formData.patientId}` 
          : `Doctor account created for ${formData.email}`,
      });
      
      if (formData.profileType === 'patient') {
        navigate(`/patient-profile/${formData.patientId}`);
      } else {
        // In a real app, you might redirect to a different page or show additional info
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Profile</DialogTitle>
        <DialogDescription>
          Add a new doctor or patient to the system.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
            {isSubmitting ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientForm;
