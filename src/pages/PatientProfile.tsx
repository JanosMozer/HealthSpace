
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BodyDiagram from '@/components/BodyDiagram';
import PatientInfo from '@/components/PatientInfo';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BodyPart } from '@/types/patient';

// Get this type from BodyDiagram.tsx
type ConditionSeverity = 'mild' | 'moderate' | 'severe';

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDoctor, setIsDoctor] = useState(true); // Assuming doctor by default
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [conditionForm, setConditionForm] = useState({
    severity: 'mild' as ConditionSeverity,
    description: '',
  });
  
  // Mock patient data structure with properly typed bodyConditions
  const [patient, setPatient] = useState<{
    id: string;
    name: string;
    age: number;
    dob: string;
    gender: string;
    currentConditions: {
      name: string;
      since: string;
      medications: string[];
    }[];
    medicalHistory: {
      date: string;
      condition: string;
      notes: string;
    }[];
    bodyConditions: {
      bodyPart: BodyPart;
      severity: ConditionSeverity;
      description: string;
    }[];
  }>({
    id: patientId || '000000000',
    name: '',
    age: 0,
    dob: '',
    gender: '',
    currentConditions: [],
    medicalHistory: [],
    bodyConditions: [],
  });

  // Check if the user is logged in as admin
  useEffect(() => {
    // In a real app, this would check authentication status from context or store
    const checkAuth = () => {
      const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
      setIsDoctor(isAdmin);
    };
    
    checkAuth();
  }, []);

  // Handler for body part selection
  const handleAddCondition = (bodyPart: BodyPart) => {
    if (!isDoctor) return;
    
    setSelectedBodyPart(bodyPart);
    setIsEditingCondition(true);
  };

  // Save the condition
  const saveCondition = () => {
    if (!selectedBodyPart) return;
    
    // Check if this body part already has a condition
    const existingIndex = patient.bodyConditions.findIndex(c => c.bodyPart === selectedBodyPart);
    
    const newCondition = {
      bodyPart: selectedBodyPart,
      severity: conditionForm.severity,
      description: conditionForm.description,
    };
    
    let updatedConditions = [...patient.bodyConditions];
    
    if (existingIndex >= 0) {
      // Replace existing condition
      updatedConditions[existingIndex] = newCondition;
    } else {
      // Add new condition
      updatedConditions = [...updatedConditions, newCondition];
    }
    
    setPatient({
      ...patient,
      bodyConditions: updatedConditions,
    });
    
    setIsEditingCondition(false);
    setSelectedBodyPart(null);
    setConditionForm({ severity: 'mild', description: '' });
    
    toast({
      title: "Condition saved",
      description: `Updated condition for ${selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-primary">
        <div className="medical-container flex h-16 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/doctor-dashboard')}
            className="mr-4 text-white hover:bg-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">Patient Profile</h1>
          {isDoctor && (
            <div className="ml-auto">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-primary/80"
                onClick={() => toast({ title: "Edit mode", description: "You can now edit the patient's profile" })}
              >
                Edit Patient Info
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="medical-container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Patient body diagram (right side) */}
          <div className="order-2 md:order-2 md:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-primary">Body Diagram</h2>
              <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
                <BodyDiagram 
                  conditions={patient.bodyConditions} 
                  onAddCondition={isDoctor ? handleAddCondition : undefined} 
                  readOnly={!isDoctor}
                />
                
                {isDoctor && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      {patient.bodyConditions.length > 0 
                        ? "Click on an organ to view details or add new conditions" 
                        : "Click on an organ to add a condition"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Patient information (left side) */}
          <div className="order-1 md:order-1 md:col-span-2">
            <PatientInfo patient={patient} isReadOnly={!isDoctor} />
          </div>
        </div>
      </main>
      
      {/* Dialog for adding conditions */}
      <Dialog open={isEditingCondition} onOpenChange={setIsEditingCondition}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Condition for {selectedBodyPart ? (
                selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()
              ) : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <RadioGroup 
                value={conditionForm.severity} 
                onValueChange={(value) => setConditionForm({...conditionForm, severity: value as ConditionSeverity})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mild" id="mild" />
                  <Label htmlFor="mild">Mild</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="severe" />
                  <Label htmlFor="severe">Severe</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={conditionForm.description}
                onChange={(e) => setConditionForm({...conditionForm, description: e.target.value})}
                placeholder="Enter condition details..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingCondition(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveCondition}>
                Save Condition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
