
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { BodyPart, Patient } from '@/types/patient';
import { supabase } from '@/lib/supabase';

interface ConditionsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddCondition?: (bodyPart: BodyPart) => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const ConditionsTab = ({ patient, isDoctor, onAddCondition, setPatient }: ConditionsTabProps) => {
  // Form for adding conditions with body part
  const conditionForm = useForm({
    defaultValues: {
      bodyPart: 'head' as BodyPart,
      description: '',
    }
  });

  // Get list of body parts for dropdown
  const bodyPartOptions = [
    { value: 'head', label: 'Head' },
    { value: 'brain', label: 'Brain' },
    { value: 'thyroid', label: 'Thyroid' },
    { value: 'heart', label: 'Heart' },
    { value: 'lungs', label: 'Lungs' },
    { value: 'liver', label: 'Liver' },
    { value: 'stomach', label: 'Stomach' },
    { value: 'pancreas', label: 'Pancreas' },
    { value: 'smallIntestine', label: 'Small Intestine' },
    { value: 'largeIntestine', label: 'Large Intestine' },
    { value: 'kidneys', label: 'Kidneys' },
    { value: 'bladder', label: 'Bladder' },
    { value: 'leftArm', label: 'Left Arm' },
    { value: 'rightArm', label: 'Right Arm' },
    { value: 'leftLeg', label: 'Left Leg' },
    { value: 'rightLeg', label: 'Right Leg' }
  ];

  // Submit condition form
  const handleConditionSubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('conditions')
        .insert({
          patient_id: patient.id,
          body_part: data.bodyPart,
          description: data.description,
        });
        
      if (error) throw error;
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          bodyConditions: [
            ...prev.bodyConditions,
            {
              bodyPart: data.bodyPart,
              description: data.description,
            }
          ]
        }));
      }
      
      conditionForm.reset();
      
    } catch (error) {
      console.error('Error adding condition:', error);
    }
  };

  return (
    <TabsContent value="conditions">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical Conditions</h3>
        {isDoctor && (
          <Button 
            size="sm"
            onClick={() => onAddCondition && onAddCondition('head')}
          >
            Add Condition
          </Button>
        )}
      </div>
      
      {isDoctor && (
        <Form {...conditionForm}>
          <form onSubmit={conditionForm.handleSubmit(handleConditionSubmit)} className="space-y-4 mb-6 p-4 border border-border rounded-md">
            <h4 className="font-medium">Add New Condition</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={conditionForm.control}
                name="bodyPart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Part</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        {...field}
                      >
                        {bodyPartOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={conditionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the condition..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Condition</Button>
            </div>
          </form>
        </Form>
      )}
      
      {patient && patient.bodyConditions && patient.bodyConditions.length > 0 ? (
        <div className="mt-4 space-y-2">
          {patient.bodyConditions.map((condition, index) => (
            <div key={index} className="bg-muted/50 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium capitalize">
                  {bodyPartOptions.find(bp => bp.value === condition.bodyPart)?.label || 
                    condition.bodyPart.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <p className="text-sm mt-1">{condition.description}</p>
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
