
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Patient } from '@/types/patient';
import { supabase } from '@/lib/supabase';

interface MedicationsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddMedication?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const MedicationsTab = ({ patient, isDoctor, onAddMedication, setPatient }: MedicationsTabProps) => {
  const [showPastMedications, setShowPastMedications] = useState(false);
  
  // Form for adding medication
  const medicationForm = useForm({
    defaultValues: {
      name: '',
      dosage: '',
      since: new Date().toISOString().split('T')[0],
      current: true,
    }
  });
  
  // Submit medication form
  const handleMedicationSubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          patient_id: patient.id,
          name: data.name,
          dosage: data.dosage,
          since: data.since,
          current: data.current,
        });
        
      if (error) throw error;
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          currentConditions: [
            ...prev.currentConditions,
            {
              name: data.name,
              since: data.since,
              medications: [data.dosage],
              current: data.current,
            }
          ]
        }));
      }
      
      medicationForm.reset();
      
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  // Divide medications by current status
  const currentMedications = patient?.currentConditions?.filter(med => med.current !== false) || [];
  const pastMedications = patient?.currentConditions?.filter(med => med.current === false) || [];

  return (
    <TabsContent value="medications">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medications</h3>
        {isDoctor && (
          <Button 
            size="sm"
            onClick={onAddMedication}
          >
            Add Medication
          </Button>
        )}
      </div>
      
      {isDoctor && (
        <Form {...medicationForm}>
          <form onSubmit={medicationForm.handleSubmit(handleMedicationSubmit)} className="space-y-4 mb-6 p-4 border border-border rounded-md">
            <h4 className="font-medium">Add New Medication</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={medicationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Medication name..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={medicationForm.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10mg twice daily" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={medicationForm.control}
                name="since"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Since</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={medicationForm.control}
                name="current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-end space-x-2">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value} 
                        onChange={e => field.onChange(e.target.checked)} 
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel>Currently Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Medication</Button>
            </div>
          </form>
        </Form>
      )}
      
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
