import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { Patient, Appointment } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AppointmentsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddAppointment?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const AppointmentsTab = ({ patient, isDoctor, onAddAppointment, setPatient }: AppointmentsTabProps) => {
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const today = startOfDay(new Date());
  const { doctor } = useAuth();
  const { toast } = useToast();
  
  const appointmentForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: '',
      place: '',
    }
  });
  
  // Toggle past appointments visibility
  const togglePastAppointments = () => {
    setShowPastAppointments(!showPastAppointments);
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
  const filterAppointments = (appointments: Appointment[] = [], pending = true) => {
    return appointments.filter(app => pending ? isFutureDate(app.date) : !isFutureDate(app.date));
  };

  // Submit appointment form
  const handleAppointmentSubmit = async (data: any) => {
    if (!patient.id) {
      console.error("Patient UUID is missing in AppointmentsTab");
      return;
    }
    
    try {
      // Add doctor information
      const doctorName = doctor?.name || 'Unknown Doctor';
      const doctorId = doctor?.id;
      
      const payload = {
        patient_id: patient.id, // Using patient UUID, not identifier
        date: data.date,
        time: data.time,
        type: data.type,
        place: data.place,
        doctor_id: doctorId,
        doctor_name: doctorName,
        doctor_workplace: doctor?.workplace || 'Unknown'
      };
      
      console.log("Submitting appointment (AppointmentsTab):", payload);

      const { data: insertedData, error: insertError } = await supabase
        .from('appointment')
        .insert(payload)
        .select();
        
      if (insertError) {
        console.error('Error adding appointment (AppointmentsTab):', insertError);
        toast({
          title: "Error",
          description: "Failed to add appointment.",
          variant: "destructive"
        });
        return;
      }
      
      // Add to medical history
      const { error: historyError } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id, // Use UUID here
          date: data.date,
          condition: `Appointment: ${data.type}`,
          notes: `Scheduled for ${data.date} at ${data.time || 'N/A'}. Location: ${data.place}`,
          doctor_id: doctorId,
          doctor_name: doctorName,
          record_type: 'appointment',
        });
      
      if (historyError) console.error('Error adding to medical history:', historyError);
      
      if (setPatient && insertedData && insertedData.length > 0) {
        const newAppointmentEntry = {
          id: insertedData[0].id,
          date: insertedData[0].date,
          time: insertedData[0].time,
          type: insertedData[0].type,
          place: insertedData[0].place,
        };
        
        setPatient(prev => ({
          ...prev,
          appointments: [
            ...(prev.appointments || []),
            newAppointmentEntry
          ],
          // Add to medical history
          medicalHistory: [
            {
              date: data.date,
              condition: `Appointment: ${data.type}`,
              notes: `Scheduled for ${data.date} at ${data.time || 'N/A'}. Location: ${data.place}`,
              doctorName: doctorName,
              recordType: 'appointment',
            },
            ...prev.medicalHistory
          ]
        }));
      }
      
      appointmentForm.reset();
      setIsFormOpen(false);
      toast({
        title: "Appointment added",
        description: "The appointment has been saved successfully.",
      });
      
    } catch (error) {
      console.error('Error adding appointment (AppointmentsTab catch block):', error);
      toast({
        title: "Error",
        description: "Failed to add appointment.",
        variant: "destructive"
      });
    }
  };

  // Divide appointments by pending vs past
  const pendingAppointments = patient?.appointments ? filterAppointments(patient.appointments, true) : [];
  const pastAppointments = patient?.appointments ? filterAppointments(patient.appointments, false) : [];

  return (
    <TabsContent value="appointments">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Doctor Appointments</h3>
      </div>
      
      {isDoctor && (
        <Collapsible 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen}
          className="mb-6 print:hidden"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between mb-2"
            >
              <span>Add New Appointment</span>
              {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Form {...appointmentForm}>
              <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)} className="space-y-4 p-4 border border-border rounded-md">
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
          </CollapsibleContent>
        </Collapsible>
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
  );
};

export default AppointmentsTab;
