
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PatientInfo from '@/components/PatientInfo';
import PatientTabs from '@/components/PatientTabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BodyPart, Patient } from '@/types/patient';
import { supabase, getSupabaseStatus } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDoctor } = useAuth();
  
  // Dialogs state
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isAddingHistoryRecord, setIsAddingHistoryRecord] = useState(false);
  
  // Form states
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [conditionForm, setConditionForm] = useState({
    description: '',
  });
  
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    since: new Date().toISOString().split('T')[0],
  });
  
  const [historyForm, setHistoryForm] = useState({
    condition: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  
  // Patient data
  const [patient, setPatient] = useState<Patient>({
    id: patientId || '',
    name: '',
    age: 0,
    dob: '',
    gender: '',
    identifier: '',
    currentConditions: [],
    medicalHistory: [],
    bodyConditions: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // Check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      const status = await getSupabaseStatus();
      console.log("Supabase connection status:", status);
      setConnectionStatus(status);
      
      if (!status.isConnected) {
        toast({
          title: "Connection Error",
          description: "Could not connect to database service",
          variant: "destructive"
        });
      }
    };
    
    checkConnection();
  }, [toast]);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        console.log("Fetching patient with ID:", patientId);
        
        // Try fetching data without single()
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('identifier', patientId);
        
        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
          toast({
            title: "Error",
            description: "Failed to load patient data",
            variant: "destructive"
          });
          return;
        }
        
        if (!patientsData || patientsData.length === 0) {
          console.error('No patient found with identifier:', patientId);
          
          // For demonstration purposes - create a dummy patient if none exists
          if (isDoctor) {
            const dummyPatient = {
              name: "New Patient",
              identifier: patientId,
              dob: "1990-01-01",
              gender: "Not Specified",
              age: 33
            };
            
            setPatient({
              ...patient,
              ...dummyPatient
            });
            
            toast({
              title: "Demo Mode",
              description: "Using sample patient data. Database connection may not be fully set up.",
            });
            
            setLoading(false);
            return;
          } else {
            toast({
              title: "Not Found",
              description: "Patient record not found",
              variant: "destructive"
            });
            return;
          }
        }
        
        // Use the first patient found
        const patientData = patientsData[0];
        console.log("Patient data retrieved:", patientData);
        
        // Fetch conditions
        const { data: conditionsData, error: conditionsError } = await supabase
          .from('conditions')
          .select('*')
          .eq('patient_id', patientData.id);
        
        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
        }
        
        console.log("Conditions data:", conditionsData);
        
        // Fetch medications
        const { data: medicationsData, error: medicationsError } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientData.id);
        
        if (medicationsError) {
          console.error('Error fetching medications:', medicationsError);
        }
        
        console.log("Medications data:", medicationsData);
        
        // Fetch medical history
        const { data: historyData, error: historyError } = await supabase
          .from('medical_history')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('date', { ascending: false });
        
        if (historyError) {
          console.error('Error fetching medical history:', historyError);
        }
        
        console.log("History data:", historyData);
        
        // Calculate age from DOB
        const birthDate = new Date(patientData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Transform data for our components
        const currentConditions = medicationsData?.map(med => ({
          name: med.name,
          since: med.since,
          medications: [med.dosage],
        })) || [];
        
        const medicalHistory = historyData?.map(record => ({
          date: record.date,
          condition: record.condition,
          notes: record.notes,
        })) || [];
        
        const bodyConditions = conditionsData?.map(condition => ({
          bodyPart: condition.body_part as BodyPart,
          description: condition.description,
        })) || [];
        
        setPatient({
          id: patientData.id,
          name: patientData.name,
          age,
          dob: patientData.dob,
          gender: patientData.gender,
          identifier: patientData.identifier,
          currentConditions,
          medicalHistory,
          bodyConditions,
        });
        
      } catch (error) {
        console.error('Error in data fetching:', error);
        toast({
          title: "Error",
          description: "An error occurred while loading patient data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId, toast, patient.id, isDoctor]);

  // Handler for body part selection
  const handleAddCondition = (bodyPart: BodyPart) => {
    if (!isDoctor) return;
    
    setSelectedBodyPart(bodyPart);
    setIsEditingCondition(true);
  };

  // Save condition to Supabase
  const saveCondition = async () => {
    if (!selectedBodyPart || !patient.id) return;
    
    try {
      // Show status message
      console.log("Saving condition to database, patient ID:", patient.id);
      console.log("Condition data:", { 
        patient_id: patient.id, 
        body_part: selectedBodyPart, 
        description: conditionForm.description 
      });
      
      // Insert condition into Supabase
      const { data, error } = await supabase
        .from('conditions')
        .insert({
          patient_id: patient.id,
          body_part: selectedBodyPart,
          description: conditionForm.description,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newCondition = {
        bodyPart: selectedBodyPart,
        description: conditionForm.description,
      };
      
      setPatient(prev => ({
        ...prev,
        bodyConditions: [...prev.bodyConditions, newCondition]
      }));
      
      toast({
        title: "Condition saved",
        description: `Added condition for ${selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}`
      });
      
    } catch (error) {
      console.error('Error saving condition:', error);
      toast({
        title: "Error",
        description: "Failed to save condition",
        variant: "destructive"
      });
    } finally {
      setIsEditingCondition(false);
      setSelectedBodyPart(null);
      setConditionForm({ description: '' });
    }
  };
  
  // Save medication to Supabase
  const saveMedication = async () => {
    if (!patient.id) return;
    
    try {
      console.log("Saving medication to database, patient ID:", patient.id);
      console.log("Medication data:", { 
        patient_id: patient.id, 
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        since: medicationForm.since
      });
      
      // Insert medication into Supabase
      const { data, error } = await supabase
        .from('medications')
        .insert({
          patient_id: patient.id,
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          since: medicationForm.since,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newMedication = {
        name: medicationForm.name,
        since: medicationForm.since,
        medications: [medicationForm.dosage],
      };
      
      setPatient(prev => ({
        ...prev,
        currentConditions: [...prev.currentConditions, newMedication]
      }));
      
      toast({
        title: "Medication added",
        description: `Added ${medicationForm.name} to patient's medications`
      });
      
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive"
      });
    } finally {
      setIsAddingMedication(false);
      setMedicationForm({
        name: '',
        dosage: '',
        since: new Date().toISOString().split('T')[0],
      });
    }
  };
  
  // Save medical history record to Supabase
  const saveHistoryRecord = async () => {
    if (!patient.id) return;
    
    try {
      console.log("Saving medical history to database, patient ID:", patient.id);
      console.log("Medical history data:", { 
        patient_id: patient.id, 
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes
      });
      
      // Insert history record into Supabase
      const { data, error } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id,
          date: historyForm.date,
          condition: historyForm.condition,
          notes: historyForm.notes,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newHistoryRecord = {
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes,
      };
      
      setPatient(prev => ({
        ...prev,
        medicalHistory: [newHistoryRecord, ...prev.medicalHistory]
      }));
      
      toast({
        title: "Medical history updated",
        description: `Added ${historyForm.condition} to patient's medical history`
      });
      
    } catch (error) {
      console.error('Error saving history record:', error);
      toast({
        title: "Error",
        description: "Failed to save medical history record",
        variant: "destructive"
      });
    } finally {
      setIsAddingHistoryRecord(false);
      setHistoryForm({
        condition: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-primary">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/doctor-dashboard')}
            className="mr-4 text-white hover:bg-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">Patient Profile</h1>
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto py-8 px-4">
        {/* Connection status indicator for development */}
        {connectionStatus && !connectionStatus.isConnected && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4">
            <p className="font-medium">Database connection error</p>
            <p className="text-sm">Check console for details. Using demo data.</p>
          </div>
        )}
        
        {/* Patient information */}
        <PatientInfo 
          patient={patient} 
          isReadOnly={!isDoctor} 
          onAddHistory={() => setIsAddingHistoryRecord(true)}
        />
        
        {/* Tabbed sections with pictograms */}
        <PatientTabs patient={patient} isDoctor={isDoctor} />
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
      
      {/* Dialog for adding medications */}
      <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name</Label>
              <Input 
                id="med-name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({...medicationForm, name: e.target.value})}
                placeholder="Enter medication name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input 
                id="med-dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                placeholder="e.g. 10mg twice daily"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-since">Since</Label>
              <Input 
                id="med-since"
                type="date"
                value={medicationForm.since}
                onChange={(e) => setMedicationForm({...medicationForm, since: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingMedication(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveMedication}>
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding medical history records */}
      <Dialog open={isAddingHistoryRecord} onOpenChange={setIsAddingHistoryRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medical History Record</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="history-condition">Condition</Label>
              <Input 
                id="history-condition"
                value={historyForm.condition}
                onChange={(e) => setHistoryForm({...historyForm, condition: e.target.value})}
                placeholder="Enter condition name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="history-date">Date</Label>
              <Input 
                id="history-date"
                type="date"
                value={historyForm.date}
                onChange={(e) => setHistoryForm({...historyForm, date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="history-notes">Notes</Label>
              <Textarea 
                id="history-notes"
                value={historyForm.notes}
                onChange={(e) => setHistoryForm({...historyForm, notes: e.target.value})}
                placeholder="Enter additional notes..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingHistoryRecord(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveHistoryRecord}>
                Add Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
