
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BodyPart } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { bodyPartOptions } from '@/lib/constants';

interface PatientDialogsProps {
  patient: any;
  setPatient: (patient: any) => void;
  selectedBodyPart: BodyPart | null;
  setSelectedBodyPart: (bodyPart: BodyPart | null) => void;
  isEditingCondition: boolean;
  setIsEditingCondition: (isEditing: boolean) => void;
  isAddingMedication: boolean;
  setIsAddingMedication: (isAdding: boolean) => void;
  isAddingHistoryRecord: boolean;
  setIsAddingHistoryRecord: (isAdding: boolean) => void;
  isAddingAppointment?: boolean;
  setIsAddingAppointment?: (isAdding: boolean) => void;
}

const PatientDialogs = ({
  patient,
  setPatient,
  selectedBodyPart,
  setSelectedBodyPart,
  isEditingCondition,
  setIsEditingCondition,
  isAddingMedication,
  setIsAddingMedication,
  isAddingHistoryRecord,
  setIsAddingHistoryRecord,
  isAddingAppointment = false,
  setIsAddingAppointment = () => {}
}: PatientDialogsProps) => {
  const { toast } = useToast();
  const [conditionForm, setConditionForm] = useState({
    description: '',
    bodyPart: selectedBodyPart || '' as BodyPart | '',
  });
  
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    since: new Date().toISOString().split('T')[0],
    current: true,
    bodyPart: '' as BodyPart | '',
  });
  
  const [historyForm, setHistoryForm] = useState({
    condition: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    recordType: 'general',
    bodyPart: '' as BodyPart | '',
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    place: '',
    time: '09:00',
    bodyPart: '' as BodyPart | '',
  });

  // Save condition to Supabase
  const saveCondition = async () => {
    if (!conditionForm.bodyPart || !patient.identifier) {
      toast({
        title: "Error",
        description: "Missing required information (patient identifier or body part)",
        variant: "destructive"
      });
      return;
    }
    
    if (!conditionForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Saving condition to database, patient identifier:", patient.identifier);
      const payload = {
        patient_id: patient.identifier,
        body_part: conditionForm.bodyPart,
        description: conditionForm.description,
      };
      console.log("Condition data:", payload);
      
      const { data, error } = await supabase
        .from('conditions')
        .insert(payload)
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      const newCondition = {
        id: data?.[0]?.id,
        bodyPart: conditionForm.bodyPart as BodyPart,
        description: conditionForm.description,
      };
      
      setPatient((prev: any) => ({
        ...prev,
        bodyConditions: [...(prev.bodyConditions || []), newCondition]
      }));
      
      toast({
        title: "Condition saved",
        description: `Added condition for ${conditionForm.bodyPart.charAt(0).toUpperCase() + conditionForm.bodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}`
      });
      
    } catch (error) {
      console.error('Error saving condition:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save condition",
        variant: "destructive"
      });
    } finally {
      setIsEditingCondition(false);
      setSelectedBodyPart(null);
      setConditionForm({ description: '', bodyPart: '' });
    }
  };
  
  // Save medication to Supabase
  const saveMedication = async () => {
    if (!patient.identifier) {
      toast({
        title: "Error",
        description: "Patient identifier is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!medicationForm.name.trim() || !medicationForm.dosage.trim() || !medicationForm.since) {
      toast({
        title: "Validation Error",
        description: "Medication Name, Dosage, and Since date are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Saving medication to database, patient identifier:", patient.identifier);
      const payload = {
        patient_id: patient.identifier,
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        since: medicationForm.since,
        current: medicationForm.current,
        body_part: medicationForm.bodyPart || null,
      };
      console.log("Medication data:", payload);
      
      const { data, error } = await supabase
        .from('medications')
        .insert(payload)
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      const newMedication = {
        id: data?.[0]?.id, 
        name: medicationForm.name,
        since: medicationForm.since,
        medications: [medicationForm.dosage],
        current: medicationForm.current,
        bodyPart: medicationForm.bodyPart as BodyPart || undefined,
      };
      
      setPatient((prev: any) => ({
        ...prev,
        medications: [...(prev.medications || []), newMedication], 
      }));
      
      toast({
        title: "Medication added",
        description: `Added ${medicationForm.name} to patient's medications`
      });
      
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save medication",
        variant: "destructive"
      });
    } finally {
      setIsAddingMedication(false);
      setMedicationForm({
        name: '',
        dosage: '',
        since: new Date().toISOString().split('T')[0],
        current: true,
        bodyPart: '',
      });
    }
  };
  
  // Save medical history record to Supabase
  const saveHistoryRecord = async () => {
    if (!patient.identifier) {
      toast({
        title: "Error",
        description: "Patient identifier is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!historyForm.condition.trim() || !historyForm.date) {
      toast({
        title: "Validation Error",
        description: "Condition and Date are required for medical history",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Saving medical history to database, patient identifier:", patient.identifier);
      const payload = {
        patient_id: patient.identifier,
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes,
        record_type: historyForm.recordType,
        body_part: historyForm.bodyPart || null,
      };
      console.log("Medical history data:", payload);
      
      const { data, error } = await supabase
        .from('medical_history')
        .insert(payload)
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      const newHistoryRecord = {
        id: data?.[0]?.id,
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes,
        recordType: historyForm.recordType,
        bodyPart: historyForm.bodyPart as BodyPart || undefined,
      };
      
      setPatient((prev: any) => ({
        ...prev,
        medicalHistory: [newHistoryRecord, ...(prev.medicalHistory || [])]
      }));
      
      toast({
        title: "Medical history updated",
        description: `Added ${historyForm.condition} to patient's medical history`
      });
      
    } catch (error) {
      console.error('Error saving history record:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save medical history record",
        variant: "destructive"
      });
    } finally {
      setIsAddingHistoryRecord(false);
      setHistoryForm({
        condition: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        recordType: 'general',
        bodyPart: '',
      });
    }
  };
  
  // Save appointment to Supabase
  const saveAppointment = async () => {
    if (!patient.identifier) { 
      toast({
        title: "Error",
        description: "Patient identifier is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!appointmentForm.type.trim() || !appointmentForm.place.trim() || !appointmentForm.date || !appointmentForm.time) {
      toast({
        title: "Validation Error",
        description: "All fields (Date, Time, Type, Place) are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Saving appointment to database, patient identifier:", patient.identifier);      
      const payload = {
        patient_id: patient.identifier,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        place: appointmentForm.place,
        body_part: appointmentForm.bodyPart || null,
      };
      console.log("Appointment data:", payload);
      
      const { data, error } = await supabase
        .from('appointment') 
        .insert(payload)
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      const newAppointment = {
        id: data?.[0]?.id,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        place: appointmentForm.place,
        bodyPart: appointmentForm.bodyPart as BodyPart || undefined,
      };
      
      setPatient((prev: any) => ({
        ...prev,
        appointments: [...(prev.appointments || []), newAppointment]
      }));
      
      toast({
        title: "Appointment added",
        description: `Added appointment for ${appointmentForm.date} at ${appointmentForm.time}`
      });
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save appointment",
        variant: "destructive"
      });
    } finally {
      setIsAddingAppointment(false);
      setAppointmentForm({
        date: new Date().toISOString().split('T')[0],
        type: '',
        place: '',
        time: '09:00',
        bodyPart: '',
      });
    }
  };

  return (
    <>
      {/* Dialog for adding conditions */}
      <Dialog open={isEditingCondition} onOpenChange={setIsEditingCondition}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Condition for {selectedBodyPart ? (
                selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()
              ) : 'Patient'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="bodyPart">Body Part</Label>
              <Select
                value={conditionForm.bodyPart}
                onValueChange={(value) => setConditionForm({...conditionForm, bodyPart: value as BodyPart})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyPartOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={conditionForm.description}
                onChange={(e) => setConditionForm({...conditionForm, description: e.target.value})}
                placeholder="Enter condition details..."
                className={!conditionForm.description.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                rows={4}
              />
              {!conditionForm.description.trim() && (
                <p className="text-xs text-red-500">Description is required</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingCondition(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveCondition}>
                Save Condition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding medications */}
      <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name</Label>
              <Input 
                id="med-name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({...medicationForm, name: e.target.value})}
                placeholder="Enter medication name"
                className={!medicationForm.name.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {!medicationForm.name.trim() && (
                <p className="text-xs text-red-500">Medication name is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input 
                id="med-dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                placeholder="e.g. 10mg twice daily"
                className={!medicationForm.dosage.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {!medicationForm.dosage.trim() && (
                <p className="text-xs text-red-500">Dosage is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-bodyPart">Related Body Part (Optional)</Label>
              <Select
                value={medicationForm.bodyPart}
                onValueChange={(value) => setMedicationForm({...medicationForm, bodyPart: value as BodyPart})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyPartOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-since">Since</Label>
              <Input 
                id="med-since"
                type="date"
                value={medicationForm.since}
                onChange={(e) => setMedicationForm({...medicationForm, since: e.target.value})}
                className={!medicationForm.since ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {!medicationForm.since && (
                <p className="text-xs text-red-500">Date is required</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingMedication(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveMedication}>
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding medical history records */}
      <Dialog open={isAddingHistoryRecord} onOpenChange={setIsAddingHistoryRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medical History Record</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="history-condition">Condition</Label>
                <Input 
                  id="history-condition"
                  value={historyForm.condition}
                  onChange={(e) => setHistoryForm({...historyForm, condition: e.target.value})}
                  placeholder="Enter condition name"
                  className={!historyForm.condition.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {!historyForm.condition.trim() && (
                  <p className="text-xs text-red-500">Condition is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="history-date">Date</Label>
                <Input 
                  id="history-date"
                  type="date"
                  value={historyForm.date}
                  onChange={(e) => setHistoryForm({...historyForm, date: e.target.value})}
                  className={!historyForm.date ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {!historyForm.date && (
                  <p className="text-xs text-red-500">Date is required</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="history-type">Record Type</Label>
                <Select
                  value={historyForm.recordType}
                  onValueChange={(value) => setHistoryForm({...historyForm, recordType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="examination">Imaging Result</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="history-bodyPart">Related Body Part (Optional)</Label>
                <Select
                  value={historyForm.bodyPart}
                  onValueChange={(value) => setHistoryForm({...historyForm, bodyPart: value as BodyPart})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyPartOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="history-notes">Notes</Label>
              <Textarea 
                id="history-notes"
                value={historyForm.notes}
                onChange={(e) => setHistoryForm({...historyForm, notes: e.target.value})}
                placeholder="Enter additional notes..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingHistoryRecord(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveHistoryRecord}>
                Add Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding appointments */}
      <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input 
                  id="appointment-date"
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                  className={!appointmentForm.date ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {!appointmentForm.date && (
                  <p className="text-xs text-red-500">Date is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-time">Time</Label>
                <Input 
                  id="appointment-time"
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                  className={!appointmentForm.time ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {!appointmentForm.time && (
                  <p className="text-xs text-red-500">Time is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-type">Type</Label>
              <Input 
                id="appointment-type"
                value={appointmentForm.type}
                onChange={(e) => setAppointmentForm({...appointmentForm, type: e.target.value})}
                placeholder="Appointment type"
                className={!appointmentForm.type.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {!appointmentForm.type.trim() && (
                <p className="text-xs text-red-500">Type is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-place">Place</Label>
              <Input 
                id="appointment-place"
                value={appointmentForm.place}
                onChange={(e) => setAppointmentForm({...appointmentForm, place: e.target.value})}
                placeholder="Appointment location"
                className={!appointmentForm.place.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {!appointmentForm.place.trim() && (
                <p className="text-xs text-red-500">Place is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-bodyPart">Related Body Part (Optional)</Label>
              <Select
                value={appointmentForm.bodyPart}
                onValueChange={(value) => setAppointmentForm({...appointmentForm, bodyPart: value as BodyPart})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyPartOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingAppointment(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveAppointment}>
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientDialogs;
