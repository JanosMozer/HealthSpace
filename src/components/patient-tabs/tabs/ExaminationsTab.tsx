
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Patient, Examination } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExaminationsTabProps {
  patient: Patient;
  isDoctor: boolean;
  onAddExamination?: () => void;
  setPatient?: React.Dispatch<React.SetStateAction<Patient>>;
}

const ExaminationsTab = ({ patient, isDoctor, onAddExamination, setPatient }: ExaminationsTabProps) => {
  const [expandedExamination, setExpandedExamination] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { doctor } = useAuth();
  const { toast } = useToast();
  
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
      // Image handling would be implemented here
      // imageFile: null
    }
  });

  // Submit examination form
  const handleExaminationSubmit = async (data: any) => {
    if (!patient.id) {
      return;
    }
    
    try {
      // Add doctor information
      const doctorName = doctor?.name || 'Unknown Doctor';
      const doctorId = doctor?.id;
      
      // In a real implementation, here we would:
      // 1. Upload the image to a storage service (e.g., Supabase Storage)
      // 2. Get the URL of the uploaded image
      // 3. Store that URL in the examinations table
      
      // For now, we're just storing the examination metadata
      const { error } = await supabase
        .from('examinations')
        .insert({
          patient_id: patient.id,
          date: data.date,
          name: data.name,
          notes: data.notes,
          doctor_id: doctorId,
          doctor_name: doctorName,
          // image_url: would be set here after image upload
        });
        
      if (error) throw error;
      
      // Add to medical history as well
      const { error: historyError } = await supabase
        .from('medical_history')
        .insert({
          patient_id: patient.id,
          date: data.date,
          condition: `Examination: ${data.name}`,
          notes: data.notes,
          doctor_id: doctorId,
          doctor_name: doctorName,
          record_type: 'examination',
        });
        
      if (historyError) {
        console.error('Error adding to medical history:', historyError);
      }
      
      if (setPatient) {
        setPatient(prev => ({
          ...prev,
          examinations: [
            ...(prev.examinations || []),
            {
              date: data.date,
              name: data.name,
              notes: data.notes,
              doctorName: doctorName,
              // imageUrl: would be set here after image upload
            }
          ],
          // Also add to medical history
          medicalHistory: [
            {
              date: data.date,
              condition: `Examination: ${data.name}`,
              notes: data.notes,
              doctorName: doctorName,
              recordType: 'examination',
            },
            ...prev.medicalHistory
          ]
        }));
      }
      
      examinationForm.reset();
      setIsFormOpen(false);
      toast({
        title: "Examination added",
        description: "The examination record has been saved successfully.",
      });
      
    } catch (error) {
      console.error('Error adding examination:', error);
      toast({
        title: "Error",
        description: "Failed to add examination.",
        variant: "destructive"
      });
    }
  };

  return (
    <TabsContent value="examinations">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical Examinations</h3>
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
              <span>Add New Examination</span>
              {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Form {...examinationForm}>
              <form onSubmit={examinationForm.handleSubmit(handleExaminationSubmit)} className="space-y-4 p-4 border border-border rounded-md">
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
                
                {/* This would be implemented when we add image storage functionality 
                <FormField
                  name="imageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Examination Image</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            field.onChange(file);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Upload X-Ray, MRI scans, or other examination images
                      </p>
                    </FormItem>
                  )}
                />
                */}
                
                <div className="flex justify-end">
                  <Button type="submit">Save Examination</Button>
                </div>
              </form>
            </Form>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {patient && patient.examinations && patient.examinations.length > 0 ? (
        <div className="space-y-4">
          {patient.examinations.map((exam, index) => (
            <div 
              key={index} 
              className="border border-border rounded-md p-3 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{exam.name}</h4>
                  {exam.doctorName && (
                    <p className="text-xs text-muted-foreground">Doctor: {exam.doctorName}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{exam.date}</span>
              </div>
              
              {exam.notes && (
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto text-xs text-primary mt-1 print:hidden"
                    onClick={() => toggleExaminationItem(`exam-${index}`)}
                  >
                    {expandedExamination === `exam-${index}` ? "Hide notes" : "Show notes"}
                  </Button>
                  {expandedExamination === `exam-${index}` && (
                    <div className="print:hidden">
                      <p className="text-sm mt-2">{exam.notes}</p>
                      {exam.imageUrl && (
                        <div className="mt-2 border rounded overflow-hidden">
                          <img 
                            src={exam.imageUrl} 
                            alt={`${exam.name} scan`} 
                            className="w-full object-contain max-h-64"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="hidden print:block mt-2">
                    <p className="text-sm">{exam.notes}</p>
                    {exam.imageUrl && (
                      <div className="mt-2 border rounded overflow-hidden">
                        <img 
                          src={exam.imageUrl} 
                          alt={`${exam.name} scan`} 
                          className="w-full object-contain max-h-64"
                        />
                      </div>
                    )}
                  </div>
                </div>
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
