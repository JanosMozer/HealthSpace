
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BodyPart } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  setIsAddingHistoryRecord
}: PatientDialogsProps) => {
  const { toast } = useToast();
  const [conditionForm, setConditionForm] = useState({
    description: '',
  });
  
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    since: new Date().toISOString().split('T')[0],
  });
  
  const [historyForm, setHistoryForm] = useState({
    condition: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Save condition to Supabase
  const saveCondition = async () => {
    if (!selectedBodyPart || !patient.id) return;
    
    try {
      console.log("Saving condition to database, patient ID:", patient.id);
      console.log("Condition data:", { 
        patient_id: patient.id, 
        body_part: selectedBodyPart, 
        description: conditionForm.description 
      });
      
      // Insert condition into Supabase
      const { data, error } = await supabase
        .from('conditions')
        .insert({
          patient_id: patient.id,
          body_part: selectedBodyPart,
          description: conditionForm.description,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newCondition = {
        bodyPart: selectedBodyPart,
        description: conditionForm.description,
      };
      
      setPatient(prev => ({
        ...prev,
        bodyConditions: [...prev.bodyConditions, newCondition]
      }));
      
      toast({
        title: "Condition saved",
        description: `Added condition for ${selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}`
      });
      
    } catch (error) {
      console.error('Error saving condition:', error);
      toast({
        title: "Error",
        description: "Failed to save condition",
        variant: "destructive"
      });
    } finally {
      setIsEditingCondition(false);
      setSelectedBodyPart(null);
      setConditionForm({ description: '' });
    }
  };
  
  // Save medication to Supabase
  const saveMedication = async () => {
    if (!patient.id) return;
    
    try {
      console.log("Saving medication to database, patient ID:", patient.id);
      console.log("Medication data:", { 
        patient_id: patient.id, 
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        since: medicationForm.since
      });
      
      // Insert medication into Supabase
      const { data, error } = await supabase
        .from('medications')
        .insert({
          patient_id: patient.id,
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          since: medicationForm.since,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newMedication = {
        name: medicationForm.name,
        since: medicationForm.since,
        medications: [medicationForm.dosage],
      };
      
      setPatient(prev => ({
        ...prev,
        currentConditions: [...prev.currentConditions, newMedication]
      }));
      
      toast({
        title: "Medication added",
        description: `Added ${medicationForm.name} to patient's medications`
      });
      
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive"
      });
    } finally {
      setIsAddingMedication(false);
      setMedicationForm({
        name: '',
        dosage: '',
        since: new Date().toISOString().split('T')[0],
      });
    }
  };
  
  // Save medical history record to Supabase
  const saveHistoryRecord = async () => {
    if (!patient.id) return;
    
    try {
      console.log("Saving medical history to database, patient ID:", patient.id);
      console.log("Medical history data:", { 
        patient_id: patient.id, 
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes
      });
      
      // Insert history record into Supabase
      const { data, error } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id,
          date: historyForm.date,
          condition: historyForm.condition,
          notes: historyForm.notes,
        })
        .select();
      
      console.log("Insert result:", { data, error });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const newHistoryRecord = {
        date: historyForm.date,
        condition: historyForm.condition,
        notes: historyForm.notes,
      };
      
      setPatient(prev => ({
        ...prev,
        medicalHistory: [newHistoryRecord, ...prev.medicalHistory]
      }));
      
      toast({
        title: "Medical history updated",
        description: `Added ${historyForm.condition} to patient's medical history`
      });
      
    } catch (error) {
      console.error('Error saving history record:', error);
      toast({
        title: "Error",
        description: "Failed to save medical history record",
        variant: "destructive"
      });
    } finally {
      setIsAddingHistoryRecord(false);
      setHistoryForm({
        condition: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
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
              ) : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={conditionForm.description}
                onChange={(e) => setConditionForm({...conditionForm, description: e.target.value})}
                placeholder="Enter condition details..."
                rows={4}
              />
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input 
                id="med-dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                placeholder="e.g. 10mg twice daily"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-since">Since</Label>
              <Input 
                id="med-since"
                type="date"
                value={medicationForm.since}
                onChange={(e) => setMedicationForm({...medicationForm, since: e.target.value})}
              />
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
            <div className="space-y-2">
              <Label htmlFor="history-condition">Condition</Label>
              <Input 
                id="history-condition"
                value={historyForm.condition}
                onChange={(e) => setHistoryForm({...historyForm, condition: e.target.value})}
                placeholder="Enter condition name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="history-date">Date</Label>
              <Input 
                id="history-date"
                type="date"
                value={historyForm.date}
                onChange={(e) => setHistoryForm({...historyForm, date: e.target.value})}
              />
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
    </>
  );
};

export default PatientDialogs;
