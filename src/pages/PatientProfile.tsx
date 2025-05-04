import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PatientInfo from '@/components/PatientInfo';
import PatientTabs from '@/components/PatientTabs';
import { useToast } from '@/hooks/use-toast';
import { BodyPart, Patient } from '@/types/patient';
import { supabase, getSupabaseStatus, initializeDatabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import PatientHeader from '@/components/PatientHeader';
import PatientDialogs from '@/components/PatientDialogs';

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { toast } = useToast();
  const { isDoctor } = useAuth();
  
  // Dialogs state
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isAddingHistoryRecord, setIsAddingHistoryRecord] = useState(false);
  
  // State for body part selection
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  
  // Patient data
  const [patient, setPatient] = useState<Patient>({
    id: patientId || '',
    name: '',
    age: 0,
    dob: '',
    gender: '',
    identifier: patientId || '',
    currentConditions: [],
    medicalHistory: [],
    bodyConditions: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // Check Supabase connection and initialize database
  useEffect(() => {
    const checkConnection = async () => {
      // Initialize database tables
      await initializeDatabase();
      
      // Check connection status
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
          toast({
            title: "Not Found",
            description: "Patient record not found",
            variant: "destructive"
          });
          setLoading(false); // Ensure loading stops if patient not found
          return;
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
          age: patientData.age,
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
  }, [patientId, toast, isDoctor]);

  // Handler for body part selection
  const handleAddCondition = (bodyPart: BodyPart) => {
    if (!isDoctor) return;
    
    setSelectedBodyPart(bodyPart);
    setIsEditingCondition(true);
  };
  
  // Handler for adding medication
  const handleAddMedication = () => {
    if (!isDoctor) return;
    setIsAddingMedication(true);
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
      <PatientHeader 
        connectionStatus={connectionStatus} 
        patientName={patient.name || 'Patient Profile'}
      />
      
      <main className="container max-w-7xl mx-auto py-8 px-4">
        {/* Patient information */}
        <PatientInfo 
          patient={patient} 
          isReadOnly={!isDoctor} 
          onAddHistory={() => setIsAddingHistoryRecord(true)}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">{patient.name}</h1>
            <p className="text-lg text-muted-foreground">ID: {patient.identifier}</p> {/* Moved ID below name */}
            <p className="text-sm text-muted-foreground">
              {patient.age} years old ({patient.gender}), DOB: {new Date(patient.dob).toLocaleDateString()}
            </p>
          </div>
          {isDoctor && (
            <AddDataDialog
              patient={patient}
              setPatient={setPatient}
              selectedBodyPart={selectedBodyPart}
              setSelectedBodyPart={setSelectedBodyPart}
            />
          )}
        </div>

        {/* Patient Canvas and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ... Patient Canvas ... */}

          {/* Patient Details Column */}
          <div className="md:col-span-1 space-y-6">
            <CurrentConditions conditions={patient.currentConditions} />
            <Medications medications={patient.currentConditions} /> {/* Assuming medications are part of currentConditions structure */}
            {/* <MedicalHistory history={patient.medicalHistory} /> */} {/* Commented out Medical History */}
          </div>
        </div>
        
        {/* Tabbed sections with pictograms */}
        <div className="mt-8">
          <PatientTabs 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddCondition={handleAddCondition} 
            onAddMedication={handleAddMedication}
          />
        </div>
      </main>
      
      {/* All dialog components */}
      <PatientDialogs 
        patient={patient}
        setPatient={setPatient}
        selectedBodyPart={selectedBodyPart}
        setSelectedBodyPart={setSelectedBodyPart}
        isEditingCondition={isEditingCondition}
        setIsEditingCondition={setIsEditingCondition}
        isAddingMedication={isAddingMedication}
        setIsAddingMedication={setIsAddingMedication}
        isAddingHistoryRecord={isAddingHistoryRecord}
        setIsAddingHistoryRecord={setIsAddingHistoryRecord}
      />
    </div>
  );
};

export default PatientProfile;
