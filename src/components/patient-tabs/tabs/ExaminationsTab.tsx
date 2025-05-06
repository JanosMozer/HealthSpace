
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Patient, Examination } from '@/types/patient';
import { supabase } from '@/lib/supabase';

interface ExaminationsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddExamination?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const ExaminationsTab = ({ patient, isDoctor, onAddExamination, setPatient }: ExaminationsTabProps) => {
  const [expandedExamination, setExpandedExamination] = useState<string | null>(null);
  
  // Toggle examination item expansion
  const toggleExaminationItem = (id: string) => {
    setExpandedExamination(expandedExamination === id ? null : id);
  };

  // Form for adding examinations
  const examinationForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      name: '',
      notes: '',
    }
  });

  // Submit examination form
  const handleExaminationSubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('examinations')
        .insert({
          patient_id: patient.id,
          date: data.date,
          name: data.name,
          notes: data.notes,
        });
        
      if (error) throw error;
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          examinations: [
            ...(prev.examinations || []),
            {
              date: data.date,
              name: data.name,
              notes: data.notes,
            }
          ]
        }));
      }
      
      examinationForm.reset();
      
    } catch (error) {
      console.error('Error adding examination:', error);
    }
  };

  return (
    <TabsContent value="examinations">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical Examinations</h3>
        {isDoctor && (
          <Button 
            size="sm"
            onClick={onAddExamination}
          >
            Add Examination
          </Button>
        )}
      </div>
      
      {isDoctor && (
        <Form {...examinationForm}>
          <form onSubmit={examinationForm.handleSubmit(handleExaminationSubmit)} className="space-y-4 mb-6 p-4 border border-border rounded-md">
            <h4 className="font-medium">Add New Examination</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={examinationForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={examinationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Examination Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Examination name..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={examinationForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Examination notes..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Save Examination</Button>
            </div>
          </form>
        </Form>
      )}
      
      {patient && patient.examinations && patient.examinations.length > 0 ? (
        <div className="space-y-4">
          {patient.examinations.map((exam, index) => (
            <div 
              key={index} 
              className="border border-border rounded-md p-3 shadow-sm cursor-pointer"
              onClick={() => toggleExaminationItem(`exam-${index}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{exam.name}</h4>
                <span className="text-xs text-muted-foreground">{exam.date}</span>
              </div>
              {expandedExamination === `exam-${index}` ? (
                <p className="text-sm">{exam.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground truncate">
                  {exam.notes}
                </p>
              )}
              {exam.notes && (
                <p className="text-xs text-primary mt-2">
                  {expandedExamination === `exam-${index}` ? "Click to collapse" : "Click to expand"}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No examination records available</p>
        </div>
      )}
    </TabsContent>
  );
};

export default ExaminationsTab;
