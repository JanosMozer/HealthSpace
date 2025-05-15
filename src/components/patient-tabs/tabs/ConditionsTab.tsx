import React from 'react';
import { useForm } from 'react-hook-form';
import { TabsContent } from '@/components/ui/tabs';
import { BodyPart, Patient } from '@/types/patient';
import { bodyPartOptions } from '@/lib/constants';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { supabase } from '../../../lib/supabase';

interface ConditionsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddCondition?: (bodyPart: BodyPart) => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const ConditionsTab = ({ patient, isDoctor }: ConditionsTabProps) => {
  const conditionForm = useForm({
    defaultValues: {
      bodyPart: '',
      description: '',
      date: new Date().toISOString().split('T')[0], // Use date instead of time
    },
  });

  const handleConditionSubmit = async (data: any) => {
    if (!data.bodyPart || !data.description || !data.date) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        body_part: data.bodyPart,
        description: data.description,
        date: data.date,
      };

      const { error } = await supabase.from('conditions').insert(payload);
      if (error) throw error;

      toast({
        title: "Condition Added",
        description: "The condition has been saved successfully.",
      });

      conditionForm.reset();
    } catch (error) {
      console.error("Error saving condition:", error);
      toast({
        title: "Error",
        description: "Failed to save condition.",
        variant: "destructive",
      });
    }
  };

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

      <Form {...conditionForm}>
        <form onSubmit={conditionForm.handleSubmit(handleConditionSubmit)}>
          <FormField
            control={conditionForm.control}
            name="bodyPart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Part</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyPartOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={conditionForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Input placeholder="Condition description..." {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={conditionForm.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Input type="date" {...field} />
              </FormItem>
            )}
          />
          <Button type="submit">Save Condition</Button>
        </form>
      </Form>
    </TabsContent>
  );
};

export default ConditionsTab;
