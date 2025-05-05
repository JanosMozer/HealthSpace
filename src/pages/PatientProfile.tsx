
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PatientInfo from '@/components/PatientInfo';
import PatientTabs from '@/components/PatientTabs';
import { useToast } from '@/hooks/use-toast';
import { BodyPart, Patient, Appointment } from '@/types/patient';
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
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  
  // State for body part selection
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  
  // Patient data
  const [patient, setPatient] = useState<Patient>({
    id: '',
    name: '',
    age: 0,
    dob: '',
    gender: '',
    identifier: patientId || '',
    currentConditions: [],
    medicalHistory: [],
    bodyConditions: [],
    appointments: [],
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
      if (!patientId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching patient with ID:", patientId);
        
        // First try direct patient data fetch
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('identifier', patientId);
        
        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
          toast({
            title: "Error",
            description: "Failed to load patient data. Using local data.",
            variant: "destructive"
          });
        }
        
        if (!patientsData || patientsData.length === 0) {
          console.error('No patient found with identifier:', patientId);
          toast({
            title: "Not Found",
            description: "Patient record not found. Using local data.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Use the first patient found
        const patientData = patientsData[0];
        console.log("Patient data retrieved:", patientData);
        
        // Try to fetch related data with proper error handling
        let conditionsData: any[] = [];
        let medicationsData: any[] = [];
        let historyData: any[] = [];
        let appointmentsData: any[] = [];
        
        try {
          // Fetch conditions
          const { data: conditions, error: conditionsError } = await supabase
            .from('conditions')
            .select('*')
            .eq('patient_id', patientData.id);
          
          if (conditionsError) {
            console.error('Error fetching conditions:', conditionsError);
          } else if (conditions) {
            conditionsData = conditions;
          }
        } catch (e) {
          console.error('Failed to fetch conditions:', e);
        }
        
        try {
          // Fetch medications
          const { data: medications, error: medicationsError } = await supabase
            .from('medications')
            .select('*')
            .eq('patient_id', patientData.id);
          
          if (medicationsError) {
            console.error('Error fetching medications:', medicationsError);
          } else if (medications) {
            medicationsData = medications;
          }
        } catch (e) {
          console.error('Failed to fetch medications:', e);
        }
        
        try {
          // Fetch medical history
          const { data: history, error: historyError } = await supabase
            .from('medical_history')
            .select('*')
            .eq('patient_id', patientData.id)
            .order('date', { ascending: false });
          
          if (historyError) {
            console.error('Error fetching medical history:', historyError);
          } else if (history) {
            historyData = history;
          }
        } catch (e) {
          console.error('Failed to fetch medical history:', e);
        }
        
        try {
          // Fetch appointments
          const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientData.id)
            .order('date', { ascending: true });
          
          if (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
          } else if (appointments) {
            appointmentsData = appointments;
          }
        } catch (e) {
          console.error('Failed to fetch appointments:', e);
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
        
        const appointments = appointmentsData?.map(appointment => ({
          date: appointment.date,
          type: appointment.type,
          place: appointment.place,
        })) || [];
        
        setPatient({
          id: patientData.id,
          name: patientData.name || 'Patient',
          age: patientData.age || 0,
          dob: patientData.dob || '',
          gender: patientData.gender || '',
          identifier: patientData.identifier || patientId,
          currentConditions,
          medicalHistory,
          bodyConditions,
          appointments,
        });
        
      } catch (error) {
        console.error('Error in data fetching:', error);
        toast({
          title: "Error",
          description: "An error occurred while loading patient data. Using local data.",
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
  
  // Handler for adding medical history record
  const handleAddHistoryRecord = () => {
    if (!isDoctor) return;
    setIsAddingHistoryRecord(true);
  };
  
  // Handler for adding appointment
  const handleAddAppointment = () => {
    if (!isDoctor) return;
    setIsAddingAppointment(true);
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
          onAddHistory={handleAddHistoryRecord}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">{patient.name || 'Patient'}</h1>
            <p className="text-lg text-muted-foreground">ID: {patient.identifier}</p>
            <p className="text-sm text-muted-foreground">
              {patient.age} years old ({patient.gender}), DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Tabbed sections with pictograms */}
        <div className="mt-8">
          <PatientTabs 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddCondition={handleAddCondition} 
            onAddMedication={handleAddMedication}
            onAddAppointment={handleAddAppointment}
            onAddHistoryRecord={handleAddHistoryRecord}
            setPatient={setPatient}
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
        isAddingAppointment={isAddingAppointment}
        setIsAddingAppointment={setIsAddingAppointment}
      />
    </div>
  );
};

export default PatientProfile;
