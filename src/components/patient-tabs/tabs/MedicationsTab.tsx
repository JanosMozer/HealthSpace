
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Patient } from '@/types/patient';

interface MedicationsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddMedication?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const MedicationsTab = ({ patient }: MedicationsTabProps) => {
  const [showPastMedications, setShowPastMedications] = useState(false);
  
  // Divide medications by current status
  const currentMedications = patient?.currentConditions?.filter(med => med.current !== false) || [];
  const pastMedications = patient?.currentConditions?.filter(med => med.current === false) || [];

  return (
    <TabsContent value="medications">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medications</h3>
      </div>
      
      <div className="space-y-6">
        {/* Current Medications Section */}
        <div>
          <h4 className="font-medium mb-3">Current Medications</h4>
          {currentMedications.length > 0 ? (
            <div className="divide-y divide-border">
              {currentMedications.map((med, index) => (
                <div key={`current-${index}`} className="py-3">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h4 className="font-medium">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">Since {med.since}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Dosage</p>
                      <div className="flex flex-wrap justify-end gap-1">
                        {med.medications.map((m, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed rounded-md border-muted-foreground/30">
              <p className="text-muted-foreground">No current medications</p>
            </div>
          )}
        </div>
        
        {/* Past Medications Section with Toggle */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => setShowPastMedications(!showPastMedications)}
          >
            <h4 className="font-medium">Past Medications</h4>
            <Button variant="ghost" size="sm" className="h-8">
              {showPastMedications ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showPastMedications && pastMedications.length > 0 ? (
            <div className="divide-y divide-border opacity-70">
              {pastMedications.map((med, index) => (
                <div key={`past-${index}`} className="py-3">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h4 className="font-medium">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">Since {med.since}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {med.medications.map((m, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            showPastMedications && (
              <div className="text-center py-4 border border-dashed rounded-md border-muted-foreground/30">
                <p className="text-muted-foreground">No past medications</p>
              </div>
            )
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default MedicationsTab;
