
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Patient } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import TabsHeader from './TabsHeader';
import AppointmentsTab from './tabs/AppointmentsTab';
import MedicationsTab from './tabs/MedicationsTab';
import ConditionsTab from './tabs/ConditionsTab';
import ExaminationsTab from './tabs/ExaminationsTab';
import MedicalHistoryTab from './tabs/MedicalHistoryTab';

interface PatientTabsProps {
  patient: Patient;
  isDoctor: boolean;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const PatientTabs: React.FC<PatientTabsProps> = ({
  patient,
  isDoctor,
  setPatient
}) => {
  const { toast } = useToast();
  const { doctor } = useAuth();

  return (
    <Card className="mt-6">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsHeader />
        
        <CardContent className="pt-6">
          {/* Individual Tab Components */}
          <AppointmentsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            setPatient={setPatient} 
          />
          
          <MedicationsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            setPatient={setPatient} 
          />
          
          <ConditionsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            setPatient={setPatient} 
          />
          
          <ExaminationsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            setPatient={setPatient} 
          />
          
          <MedicalHistoryTab 
            patient={patient} 
            isDoctor={isDoctor} 
            setPatient={setPatient} 
          />
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default PatientTabs;
