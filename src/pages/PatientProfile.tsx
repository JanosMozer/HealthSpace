
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BodyDiagram from '@/components/BodyDiagram';
import PatientInfo from '@/components/PatientInfo';
import { ArrowLeft } from 'lucide-react';

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // Mock patient data based on ID
  // In a real app, this would come from your API/database
  const patient = {
    id: patientId || '000000000',
    name: 'John Doe',
    age: 42,
    dob: '1980-05-15',
    gender: 'Male',
    currentConditions: [
      {
        name: 'Hypertension',
        since: '2018-03-22',
        medications: ['Lisinopril 10mg', 'Hydrochlorothiazide 25mg'],
      },
      {
        name: 'Type 2 Diabetes',
        since: '2019-11-05',
        medications: ['Metformin 1000mg'],
      },
    ],
    medicalHistory: [
      {
        date: '2022-09-12',
        condition: 'Influenza',
        notes: 'Patient presented with fever and chills. Prescribed Tamiflu and recommended rest.',
      },
      {
        date: '2021-07-03',
        condition: 'Ankle Sprain',
        notes: 'Grade 2 sprain of right ankle. RICE protocol recommended. Followed up after two weeks.',
      },
      {
        date: '2020-02-18',
        condition: 'Annual Check-up',
        notes: 'All vitals normal. Blood pressure slightly elevated at 140/85.',
      },
    ],
    bodyConditions: [
      {
        bodyPart: 'rightLeg',
        severity: 'mild' as const,
        description: 'Mild inflammation due to previous ankle sprain',
      },
      {
        bodyPart: 'head',
        severity: 'moderate' as const,
        description: 'Frequent migraine complaints, particularly in temporal region',
      },
      {
        bodyPart: 'abdomen',
        severity: 'severe' as const,
        description: 'Severe pain reported after meals, possibly related to digestive issues',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="medical-container flex h-16 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/doctor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Patient Profile</h1>
        </div>
      </header>
      
      <main className="medical-container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Patient body diagram (right side) */}
          <div className="order-2 md:order-2 md:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-4">Body Diagram</h2>
              <div className="bg-card border border-border rounded-lg p-4">
                <BodyDiagram conditions={patient.bodyConditions} />
              </div>
            </div>
          </div>
          
          {/* Patient information (left side) */}
          <div className="order-1 md:order-1 md:col-span-2">
            <PatientInfo patient={patient} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
