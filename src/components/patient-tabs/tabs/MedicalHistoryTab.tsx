
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Patient } from '@/types/patient';
import { supabase } from '@/lib/supabase';

interface MedicalHistoryTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddHistoryRecord?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const MedicalHistoryTab = ({ patient, isDoctor, onAddHistoryRecord, setPatient }: MedicalHistoryTabProps) => {
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // Toggle history item expansion
  const toggleHistoryItem = (id: string) => {
    setExpandedHistory(expandedHistory === id ? null : id);
  };

  // Form for adding medical history
  const historyForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      condition: '',
      notes: '',
    }
  });

  // Submit history form
  const handleHistorySubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id,
          date: data.date,
          condition: data.condition,
          notes: data.notes,
        });
        
      if (error) throw error;
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          medicalHistory: [
            {
              date: data.date,
              condition: data.condition,
              notes: data.notes,
            },
            ...prev.medicalHistory
          ]
        }));
      }
      
      historyForm.reset();
      
    } catch (error) {
      console.error('Error adding medical history:', error);
    }
  };

  return (
    <TabsContent value="history">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical History</h3>
        {isDoctor && (
          <Button 
            size="sm"
            onClick={onAddHistoryRecord}
          >
            Add Medical Record
          </Button>
        )}
      </div>
      
      {isDoctor && (
        <Form {...historyForm}>
          <form onSubmit={historyForm.handleSubmit(handleHistorySubmit)} className="space-y-4 mb-6 p-4 border border-border rounded-md">
            <h4 className="font-medium">Add New Medical Record</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={historyForm.control}
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
                control={historyForm.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <Input placeholder="Condition name..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={historyForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Save Medical Record</Button>
            </div>
          </form>
        </Form>
      )}
      
      {patient && patient.medicalHistory && patient.medicalHistory.length > 0 ? (
        <div className="space-y-4">
          {patient.medicalHistory.map((entry, index) => (
            <div 
              key={index} 
              className="border border-border rounded-md p-3 shadow-sm cursor-pointer"
              onClick={() => toggleHistoryItem(`history-${index}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{entry.condition}</h4>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              {expandedHistory === `history-${index}` ? (
                <p className="text-sm">{entry.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground truncate">
                  {entry.notes}
                </p>
              )}
              {entry.notes && (
                <p className="text-xs text-primary mt-2">
                  {expandedHistory === `history-${index}` ? "Click to collapse" : "Click to expand"}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No medical history on record</p>
        </div>
      )}
    </TabsContent>
  );
};

export default MedicalHistoryTab;
