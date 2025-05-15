
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
import ImagingResultsTab from './tabs/ImagingResultsTab';
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
    <Card className="mt-6 print:border-none">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsHeader />
        
        <CardContent className="pt-6">
          <TabsContent value="appointments" className="mt-0">
            <AppointmentsTab 
              patient={patient} 
              isDoctor={isDoctor} 
              setPatient={setPatient} 
            />
          </TabsContent>
          
          <TabsContent value="medications" className="mt-0">
            <MedicationsTab 
              patient={patient} 
              isDoctor={isDoctor} 
              setPatient={setPatient} 
            />
          </TabsContent>
          
          <TabsContent value="conditions" className="mt-0">
            <ConditionsTab 
              patient={patient} 
              isDoctor={isDoctor} 
              setPatient={setPatient} 
            />
          </TabsContent>
          
          <TabsContent value="examinations" className="mt-0">
            <ImagingResultsTab 
              patient={patient} 
              isDoctor={isDoctor} 
              setPatient={setPatient} 
            />
          </TabsContent>
          
          <TabsContent value="medicalHistory" className="mt-0">
            <MedicalHistoryTab 
              patient={patient} 
              isDoctor={isDoctor} 
              setPatient={setPatient} 
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default PatientTabs;
