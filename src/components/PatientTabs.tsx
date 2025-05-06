
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Pill, FileText, Image, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BodyPart, Patient } from '@/types/patient';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

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
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [showPastMedications, setShowPastMedications] = useState(false);
  const today = startOfDay(new Date());
  
  // Form for adding appointments
  const appointmentForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
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
      current: true,
    }
  });
  
  // Form for adding conditions with body part
  const conditionForm = useForm({
    defaultValues: {
      bodyPart: 'head' as BodyPart,
      description: '',
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
  
  // Toggle past appointments visibility
  const togglePastAppointments = () => {
    setShowPastAppointments(!showPastAppointments);
  };
  
  // Toggle past medications visibility
  const togglePastMedications = () => {
    setShowPastMedications(!showPastMedications);
  };
  
  // Format appointment date with time
  const formatAppointmentDateTime = (date: string, time?: string) => {
    if (!date) return 'No date';
    
    try {
      if (time) {
        return `${format(parseISO(date), 'MMM dd, yyyy')} at ${time}`;
      }
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch (e) {
      return date;
    }
  };
  
  // Check if date is in the future
  const isFutureDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return isAfter(date, today);
    } catch (e) {
      return false;
    }
  };
  
  // Filter appointments by status (pending or past)
  const filterAppointments = (appointments = [], pending = true) => {
    return appointments.filter(app => pending ? isFutureDate(app.date) : !isFutureDate(app.date));
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
          time: data.time, // Add time field
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
              time: data.time, // Include time in the state
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
          current: data.current, // Add current field
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
              current: data.current, // Include current status
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
  
  // Submit condition form
  const handleConditionSubmit = async (data: any) => {
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
        .from('conditions')
        .insert({
          patient_id: patient.id,
          body_part: data.bodyPart,
          description: data.description,
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Condition added successfully"
      });
      
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
      toast({
        title: "Error",
        description: "Failed to add condition",
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

  // Divide medications by current status
  const currentMedications = patient?.currentConditions?.filter(med => med.current !== false) || [];
  const pastMedications = patient?.currentConditions?.filter(med => med.current === false) || [];

  // Divide appointments by pending vs past
  const pendingAppointments = patient?.appointments ? filterAppointments(patient.appointments, true) : [];
  const pastAppointments = patient?.appointments ? filterAppointments(patient.appointments, false) : [];

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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="date" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appointmentForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="time" {...field} />
                            </div>
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
            
            <div className="space-y-6">
              {/* Pending Appointments Section */}
              <div>
                <h4 className="font-medium mb-3">Upcoming Appointments</h4>
                {pendingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment, index) => (
                      <div key={`pending-${index}`} className="border border-border rounded-md p-3 shadow-sm bg-muted/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{appointment.type}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatAppointmentDateTime(appointment.date, appointment.time)}
                          </span>
                        </div>
                        <p className="text-sm">Location: {appointment.place}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed rounded-md border-muted-foreground/30">
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                )}
              </div>
              
              {/* Past Appointments Section with Toggle */}
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={togglePastAppointments}
                >
                  <h4 className="font-medium">Past Appointments</h4>
                  <Button variant="ghost" size="sm" className="h-8">
                    {showPastAppointments ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {showPastAppointments && pastAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment, index) => (
                      <div key={`past-${index}`} className="border border-border rounded-md p-3 shadow-sm opacity-70">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{appointment.type}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatAppointmentDateTime(appointment.date, appointment.time)}
                          </span>
                        </div>
                        <p className="text-sm">Location: {appointment.place}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  showPastAppointments && (
                    <div className="text-center py-4 border border-dashed rounded-md border-muted-foreground/30">
                      <p className="text-muted-foreground">No past appointments</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Medications Tab */}
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
