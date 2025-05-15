import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { BodyPart, Patient } from '@/types/patient';
import { bodyPartOptions } from '@/lib/constants';

interface ConditionsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddCondition?: (bodyPart: BodyPart) => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const ConditionsTab = ({ patient, isDoctor }: ConditionsTabProps) => {
  return (
    <TabsContent value="conditions">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical Conditions</h3>
      </div>
      
      {patient && patient.bodyConditions && patient.bodyConditions.length > 0 ? (
        <div className="mt-4 space-y-2">
          {patient.bodyConditions.map((condition, index) => (
            <div key={index} className="bg-muted/50 p-3 rounded-md">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium capitalize">
                    {bodyPartOptions.find(bp => bp.value === condition.bodyPart)?.label || 
                      condition.bodyPart.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {condition.doctorName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Doctor: {condition.doctorName}
                      {condition.doctorWorkplace && `, ${condition.doctorWorkplace}`}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {condition.diagnosisPlace && <p>Place: {condition.diagnosisPlace}</p>}
                  {condition.diagnosisDate && <p>Diagnosed: {condition.diagnosisDate || 'Unknown'}</p>}
                </div>
              </div>
              <p className="text-sm mt-2">{condition.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No medical conditions documented</p>
        </div>
      )}
    </TabsContent>
  );
};

export default ConditionsTab;
