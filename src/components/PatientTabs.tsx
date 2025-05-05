
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Pill, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BodyPart, Patient } from '@/types/patient';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PatientTabsProps {
  patient: Patient;
  isDoctor: boolean;
  onAddCondition?: (bodyPart: BodyPart) => void;
  onAddMedication?: () => void;
  onAddAppointment?: () => void;
  onAddHistoryRecord?: () => void;
  onAddExamination?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const PatientTabs: React.FC<PatientTabsProps> = ({ 
  patient, 
  isDoctor, 
  onAddCondition,
  onAddMedication,
  onAddAppointment,
  onAddHistoryRecord,
  onAddExamination,
  setPatient
}) => {
  const { toast } = useToast();
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [expandedExamination, setExpandedExamination] = useState<string | null>(null);
  
  // Form for adding appointments
  const appointmentForm = useForm({
    defaultValues: {
      date: '',
      type: '',
      place: '',
    }
  });
  
  // Form for adding medical history
  const historyForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      condition: '',
      notes: '',
    }
  });
  
  // Form for adding medication
  const medicationForm = useForm({
    defaultValues: {
      name: '',
      dosage: '',
      since: new Date().toISOString().split('T')[0],
    }
  });
  
  // Form for adding examinations
  const examinationForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      name: '',
      notes: '',
    }
  });

  // Toggle history item expansion
  const toggleHistoryItem = (id: string) => {
    setExpandedHistory(expandedHistory === id ? null : id);
  };
  
  // Toggle examination item expansion
  const toggleExaminationItem = (id: string) => {
    setExpandedExamination(expandedExamination === id ? null : id);
  };
  
  // Submit appointment form
  const handleAppointmentSubmit = async (data: any) => {
    if (!patient.id) {
      toast({
        title: "Error",
        description: "Patient ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          date: data.date,
          type: data.type,
          place: data.place,
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appointment added successfully"
      });
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          appointments: [
            ...(prev.appointments || []),
            {
              date: data.date,
              type: data.type,
              place: data.place,
            }
          ]
        }));
      }
      
      appointmentForm.reset();
      
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Error",
        description: "Failed to add appointment",
        variant: "destructive"
      });
    }
  };
  
  // Submit history form
  const handleHistorySubmit = async (data: any) => {
    if (!patient.id) {
      toast({
        title: "Error",
        description: "Patient ID is missing",
        variant: "destructive"
      });
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
      
      toast({
        title: "Success",
        description: "Medical history added successfully"
      });
      
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
      toast({
        title: "Error",
        description: "Failed to add medical history",
        variant: "destructive"
      });
    }
  };
  
  // Submit medication form
  const handleMedicationSubmit = async (data: any) => {
    if (!patient.id) {
      toast({
        title: "Error",
        description: "Patient ID is missing",
        variant: "destructive"
      });
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
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Medication added successfully"
      });
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          currentConditions: [
            ...prev.currentConditions,
            {
              name: data.name,
              since: data.since,
              medications: [data.dosage],
            }
          ]
        }));
      }
      
      medicationForm.reset();
      
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive"
      });
    }
  };
  
  // Submit examination form
  const handleExaminationSubmit = async (data: any) => {
    if (!patient.id) {
      toast({
        title: "Error",
        description: "Patient ID is missing",
        variant: "destructive"
      });
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
      
      toast({
        title: "Success",
        description: "Examination added successfully"
      });
      
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
      toast({
        title: "Error",
        description: "Failed to add examination",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-6">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid grid-cols-5 h-auto p-0">
          <TabsTrigger 
            value="appointments" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs font-medium">Appointments</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="medications" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <Pill className="h-5 w-5" />
            <span className="text-xs font-medium">Medications</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="conditions" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Conditions</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="examinations" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <Image className="h-5 w-5" />
            <span className="text-xs font-medium">Examinations</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="history" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Medical History</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Doctor Appointments</h3>
              {isDoctor && (
                <Button
                  size="sm"
                  onClick={onAddAppointment}
                >
                  Add Appointment
                </Button>
              )}
            </div>
            
            {isDoctor && (
              <Form {...appointmentForm}>
                <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)} className="space-y-4 mb-6 p-4 border border-border rounded-md">
                  <h4 className="font-medium">Add New Appointment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={appointmentForm.control}
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
                      control={appointmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Appointment type..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appointmentForm.control}
                      name="place"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Place</FormLabel>
                          <FormControl>
                            <Input placeholder="Appointment location..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save Appointment</Button>
                  </div>
                </form>
              </Form>
            )}
            
            {patient && patient.appointments && patient.appointments.length > 0 ? (
              <div className="space-y-4">
                {patient.appointments.map((appointment, index) => (
                  <div key={index} className="border border-border rounded-md p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{appointment.type}</h4>
                      <span className="text-xs text-muted-foreground">{appointment.date}</span>
                    </div>
                    <p className="text-sm">Location: {appointment.place}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No scheduled appointments</p>
              </div>
            )}
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Current Medications</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save Medication</Button>
                  </div>
                </form>
              </Form>
            )}
            
            {patient && patient.currentConditions && patient.currentConditions.length > 0 ? (
              <div className="divide-y divide-border">
                {patient.currentConditions.map((condition, index) => (
                  <div key={index} className="py-3">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h4 className="font-medium">{condition.name}</h4>
                        <p className="text-sm text-muted-foreground">Since {condition.since}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Dosage</p>
                        <div className="flex flex-wrap justify-end gap-1">
                          {condition.medications.map((med, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No current medications</p>
              </div>
            )}
          </TabsContent>
          
          {/* Conditions Tab */}
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
            
            {patient && patient.bodyConditions && patient.bodyConditions.length > 0 ? (
              <div className="mt-4 space-y-2">
                {patient.bodyConditions.map((condition, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">
                        {condition.bodyPart.replace(/([A-Z])/g, ' $1').trim()}
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
          
          {/* Examinations Tab */}
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
          
          {/* Medical History Tab */}
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
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default PatientTabs;
