import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TabsContent } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { bodyPartOptions } from '@/lib/constants';

const MedicalHistoryTab = ({ patient, isDoctor, setPatient }: MedicalHistoryTabProps) => {
  const [selectedRecordType, setSelectedRecordType] = useState<string | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const historyForm = useForm({
    defaultValues: {
      recordType: '',
      date: new Date().toISOString().split('T')[0],
      bodyPart: '',
      description: '',
      diagnosis_place: '',
      diagnosisTime: '',
      name: '',
      dosage: '',
      quantity: '',
      since: '',
      current: false,
      type: '',
      place: '',
      time: '',
    },
  });

  // Fetch medical history
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('medical_history')
          .select('*')
          .eq('patient_id', patient.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setMedicalHistory(data || []);
      } catch (error) {
        console.error('Error fetching medical history:', error);
      }
    };

    fetchMedicalHistory();
  }, [patient.id]);

  const handleHistorySubmit = async (data: any) => {
    if (!selectedRecordType) {
      toast({
        title: 'Validation Error',
        description: 'Please select a record type.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const doctorName = patient.doctor?.name || 'Unknown Doctor';
      const doctorId = patient.doctor?.id;
      const doctorWorkplace = patient.doctor?.workplace || 'Unknown Workplace';

      let payload: any = {};
      let tableName = '';

      // Determine the table and payload based on the record type
      if (selectedRecordType === 'medication') {
        tableName = 'medications';
        payload = {
          patient_id: patient.id,
          name: data.name,
          dosage: data.dosage,
          quantity: data.quantity,
          since: data.since,
          current: data.current,
          doctor_id: doctorId,
          doctor_name: doctorName,
          doctor_workplace: doctorWorkplace,
        };
      } else if (selectedRecordType === 'condition') {
        tableName = 'conditions';
        payload = {
          patient_id: patient.id,
          body_part: data.bodyPart,
          description: data.description,
          diagnosis_place: data.diagnosis_place,
          diagnosis_time: data.diagnosisTime,
          doctor_id: doctorId,
          doctor_name: doctorName,
          doctor_workplace: doctorWorkplace,
        };
      } else if (selectedRecordType === 'appointment') {
        tableName = 'appointments';
        payload = {
          patient_id: patient.id,
          date: data.date,
          time: data.time,
          type: data.type,
          place: data.place,
          doctor_id: doctorId,
          doctor_name: doctorName,
          doctor_workplace: doctorWorkplace,
        };
      }

      // Insert into the specific table
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) throw error;

      // Add to medical history
      const historyPayload = {
        patient_id: patient.id,
        date: data.date,
        condition: selectedRecordType === 'medication' ? `Medication: ${data.name}` : data.description || data.type,
        notes: selectedRecordType === 'medication' ? `Dosage: ${data.dosage}, Quantity: ${data.quantity}` : '',
        record_type: selectedRecordType,
        body_part: data.bodyPart || null,
        doctor_id: doctorId,
        doctor_name: doctorName,
        doctor_workplace: doctorWorkplace,
      };

      const { error: historyError } = await supabase.from('medical_history').insert(historyPayload);
      if (historyError) throw historyError;

      toast({
        title: 'Success',
        description: `${selectedRecordType.charAt(0).toUpperCase() + selectedRecordType.slice(1)} added successfully.`,
      });

      historyForm.reset();
      setSelectedRecordType(null);

      // Refresh medical history
      setMedicalHistory((prev) => [historyPayload, ...prev]);
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the record.',
        variant: 'destructive',
      });
    }
  };

  // Filter medical history based on search query
  const filteredHistory = medicalHistory.filter((entry) =>
    entry.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TabsContent value="medicalHistory">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Medical History</h3>
        <Input
          placeholder="Search medical history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        {filteredHistory.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-md">
            <p className="font-bold">{entry.condition}</p>
            <p className="text-sm text-muted-foreground">{entry.date}</p>
            <p className="text-sm">{entry.notes}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">Add Medical History</h3>
      </div>

      <Form {...historyForm}>
        <form onSubmit={historyForm.handleSubmit(handleHistorySubmit)} className="space-y-4">
          <FormField
            control={historyForm.control}
            name="recordType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Record Type</FormLabel>
                <Select
                  value={selectedRecordType}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedRecordType(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Conditional Fields Based on Record Type */}
          {selectedRecordType === 'medication' && (
            <>
              <FormField
                control={historyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <Input placeholder="Enter medication name" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <Input placeholder="Enter dosage" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <Input placeholder="Enter quantity" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="since"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Since</FormLabel>
                    <Input type="date" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currently Taken</FormLabel>
                    <Input type="checkbox" {...field} />
                  </FormItem>
                )}
              />
            </>
          )}

          {selectedRecordType === 'condition' && (
            <>
              <FormField
                control={historyForm.control}
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
                control={historyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <Textarea placeholder="Enter condition description" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="diagnosis_place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Place</FormLabel>
                    <Input placeholder="Enter diagnosis place" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="diagnosisTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Date</FormLabel>
                    <Input type="date" {...field} />
                  </FormItem>
                )}
              />
            </>
          )}

          {selectedRecordType === 'appointment' && (
            <>
              <FormField
                control={historyForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Input type="date" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Input type="time" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Input placeholder="Enter appointment type" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place</FormLabel>
                    <Input placeholder="Enter appointment location" {...field} />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  );
};

export default MedicalHistoryTab;
