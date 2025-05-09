
import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Patient, MedicalHistoryRecord } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicalHistoryTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddHistoryRecord?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const MedicalHistoryTab = ({ patient, isDoctor, onAddHistoryRecord, setPatient }: MedicalHistoryTabProps) => {
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const { doctor } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Effect to fetch all medical history for the patient when tab is first viewed
  useEffect(() => {
    if (patient.id) {
      fetchMedicalHistory();
    }
  }, [patient.id]);

  // Fetch all medical history records
  const fetchMedicalHistory = async () => {
    if (!patient.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data && setPatient) {
        // Transform the data to our MedicalHistoryRecord format
        const medicalHistory = data.map(record => ({
          date: record.date,
          condition: record.condition,
          notes: record.notes,
          doctorName: record.doctor_name || 'Unknown',
          doctorWorkplace: record.doctor_workplace || '',
          recordType: record.record_type as MedicalHistoryRecord['recordType'],
        }));
        
        setPatient(prev => ({
          ...prev,
          medicalHistory
        }));
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve complete medical history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      recordType: 'general',
    }
  });

  // Submit history form
  const handleHistorySubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      // Add doctor information to the record
      const doctorName = doctor?.name || 'Unknown Doctor';
      const doctorWorkplace = doctor?.workplace || '';
      const doctorId = doctor?.id;
      
      const { error } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id,
          date: data.date,
          condition: data.condition,
          notes: data.notes,
          doctor_id: doctorId,
          doctor_name: doctorName,
          doctor_workplace: doctorWorkplace,
          record_type: data.recordType,
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
              doctorName: doctorName,
              doctorWorkplace: doctorWorkplace,
              recordType: data.recordType,
            },
            ...prev.medicalHistory
          ]
        }));
      }
      
      historyForm.reset();
      toast({
        title: "Medical record added",
        description: "The medical record has been saved successfully.",
      });
      
    } catch (error) {
      console.error('Error adding medical history:', error);
      toast({
        title: "Error",
        description: "Failed to add medical record.",
        variant: "destructive"
      });
    }
  };

  return (
    <TabsContent value="history">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical History</h3>
        {isDoctor && (
          <Button 
            variant="outline"
            onClick={onAddHistoryRecord}
            className="flex items-center gap-2"
          >
            <span className="text-xs">+</span> Add Medical Record
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
              <FormField
                control={historyForm.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="condition">Medical Condition</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="examination">Examination</SelectItem>
                      </SelectContent>
                    </Select>
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
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading medical records...</p>
        </div>
      ) : patient && patient.medicalHistory && patient.medicalHistory.length > 0 ? (
        <div className="space-y-4">
          {patient.medicalHistory.map((entry, index) => (
            <div 
              key={index} 
              className={`border rounded-md p-3 shadow-sm cursor-pointer ${entry.recordType ? `bg-${getRecordTypeColor(entry.recordType)}-50` : ''}`}
              onClick={() => toggleHistoryItem(`history-${index}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{entry.condition}</h4>
                  {entry.doctorName && (
                    <p className="text-xs text-muted-foreground">
                      Doctor: {entry.doctorName}
                      {entry.doctorWorkplace && `, ${entry.doctorWorkplace}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                  {entry.recordType && (
                    <div className="text-xs mt-1 px-2 py-0.5 bg-muted inline-block rounded-full">
                      {formatRecordType(entry.recordType)}
                    </div>
                  )}
                </div>
              </div>
              {expandedHistory === `history-${index}` ? (
                <p className="text-sm mt-2">{entry.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground truncate mt-1">
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

const getRecordTypeColor = (recordType: string): string => {
  switch (recordType) {
    case 'medication': return 'blue';
    case 'condition': return 'amber';
    case 'appointment': return 'green';
    case 'examination': return 'purple';
    default: return 'gray';
  }
};

const formatRecordType = (recordType: string): string => {
  switch (recordType) {
    case 'medication': return 'Medication';
    case 'condition': return 'Condition';
    case 'appointment': return 'Appointment';
    case 'examination': return 'Examination';
    case 'general': return 'General';
    default: return recordType.charAt(0).toUpperCase() + recordType.slice(1);
  }
};

export default MedicalHistoryTab;
