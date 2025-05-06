
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Patient, BodyPart } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

import TabsHeader from './TabsHeader';
import AppointmentsTab from './tabs/AppointmentsTab';
import MedicationsTab from './tabs/MedicationsTab';
import ConditionsTab from './tabs/ConditionsTab';
import ExaminationsTab from './tabs/ExaminationsTab';
import MedicalHistoryTab from './tabs/MedicalHistoryTab';

interface PatientTabsProps {
  patient: Patient;
  isDoctor: boolean;
  onAddCondition?: (bodyPart: BodyPart) => void;
  onAddMedication?: () => void;
  onAddAppointment?: () => void;
  onAddHistoryRecord?: () => void;
  onAddExamination?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const PatientTabs: React.FC<PatientTabsProps> = ({
  patient,
  isDoctor,
  onAddCondition,
  onAddMedication,
  onAddAppointment,
  onAddHistoryRecord,
  onAddExamination,
  setPatient
}) => {
  const { toast } = useToast();

  return (
    <Card className="mt-6">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsHeader />
        
        <CardContent className="pt-6">
          {/* Individual Tab Components */}
          <AppointmentsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddAppointment={onAddAppointment} 
            setPatient={setPatient} 
          />
          
          <MedicationsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddMedication={onAddMedication} 
            setPatient={setPatient} 
          />
          
          <ConditionsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddCondition={onAddCondition} 
            setPatient={setPatient} 
          />
          
          <ExaminationsTab 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddExamination={onAddExamination} 
            setPatient={setPatient} 
          />
          
          <MedicalHistoryTab 
            patient={patient} 
            isDoctor={isDoctor} 
            onAddHistoryRecord={onAddHistoryRecord} 
            setPatient={setPatient} 
          />
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default PatientTabs;
