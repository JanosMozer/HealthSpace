
import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Patient, MedicalHistoryRecord, BodyPart } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react';
import { bodyPartOptions } from '@/lib/constants';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | ''>('');
  const [filteredHistory, setFilteredHistory] = useState<MedicalHistoryRecord[]>([]);

  // Effect to fetch all medical history for the patient when tab is first viewed
  useEffect(() => {
    if (patient.id) {
      fetchMedicalHistory();
    }
  }, [patient.id]);

  // Effect to filter medical history based on search term and selected body part
  useEffect(() => {
    if (!patient.medicalHistory) return;

    let filtered = [...patient.medicalHistory];

    // Filter by search term (case insensitive)
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.condition.toLowerCase().includes(searchTermLower) || 
        record.notes.toLowerCase().includes(searchTermLower) ||
        (record.doctorName && record.doctorName.toLowerCase().includes(searchTermLower))
      );
    }

    // Filter by body part
    if (selectedBodyPart) {
      filtered = filtered.filter(record => record.bodyPart === selectedBodyPart);
    }

    setFilteredHistory(filtered);
  }, [searchTerm, selectedBodyPart, patient.medicalHistory]);

  // Fetch all medical history records
  const fetchMedicalHistory = async () => {
    if (!patient.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false }); // Changed to true for oldest first
        
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
          bodyPart: record.body_part as BodyPart | undefined,
        }));
        
        setPatient(prev => ({
          ...prev,
          medicalHistory
        }));

        setFilteredHistory(medicalHistory);
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
      bodyPart: '' as BodyPart | '',
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
      
      const newRecordPayload = {
        patient_id: patient.id,
        date: data.date,
        condition: data.condition,
        notes: data.notes,
        doctor_id: doctorId,
        doctor_name: doctorName,
        doctor_workplace: doctorWorkplace,
        record_type: data.recordType,
        body_part: data.bodyPart || null,
      };

      const { data: insertedData, error } = await supabase
        .from('medical_history')
        .insert(newRecordPayload)
        .select() // Optionally select the inserted record if you need its DB-generated ID
        .single(); // Assuming you expect one record back
        
      if (error) throw error;
      
      if (setPatient) {
        const newMedicalRecordEntry: MedicalHistoryRecord = {
          date: data.date,
          condition: data.condition,
          notes: data.notes,
          doctorName: doctorName,
          doctorWorkplace: doctorWorkplace,
          recordType: data.recordType as MedicalHistoryRecord['recordType'],
          bodyPart: data.bodyPart || undefined,
        };

        setPatient(prev => {
          const updatedHistory = [...prev.medicalHistory, newMedicalRecordEntry];
          // Sort by date ascending (oldest first)
          updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return {
            ...prev,
            medicalHistory: updatedHistory
          };
        });

        // Update the filtered history as well
        setFilteredHistory(prev => {
          const updated = [...prev, newMedicalRecordEntry];
          updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return updated;
        });
      }
      
      historyForm.reset();
      setIsFormOpen(false);
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

  // Reset search filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBodyPart('');
  };

  return (
    <TabsContent value="medicalHistory">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical History</h3>
      </div>
      
      {/* Search and filter section */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg print:hidden">
        <h4 className="text-sm font-medium mb-3">Search & Filter</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select 
            value={selectedBodyPart} 
            onValueChange={(value) => setSelectedBodyPart(value as BodyPart | '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by body part" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All body parts</SelectItem>
              {bodyPartOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            Reset Filters
          </Button>
        </div>
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
              <span>Add New Medical Record</span>
              {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Form {...historyForm}>
              <form onSubmit={historyForm.handleSubmit(handleHistorySubmit)} className="space-y-4 p-4 border border-border rounded-md">
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
                            <SelectItem value="examination">Imaging Result</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
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
                            <SelectValue placeholder="Select body part (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
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
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading medical records...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => (
            <div 
              key={index} 
              className={`border rounded-md p-3 shadow-sm ${entry.recordType ? `bg-${getRecordTypeColor(entry.recordType)}-50` : ''}`}
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
                  {entry.bodyPart && (
                    <p className="text-xs text-primary">
                      Body part: {bodyPartOptions.find(bp => bp.value === entry.bodyPart)?.label || entry.bodyPart}
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
              {entry.notes && (
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto text-xs text-primary mt-1 print:hidden"
                    onClick={() => toggleHistoryItem(`history-${index}`)}
                  >
                    {expandedHistory === `history-${index}` ? "Hide notes" : "Show notes"}
                  </Button>
                  {expandedHistory === `history-${index}` && (
                    <p className="text-sm mt-2 print:hidden">{entry.notes}</p>
                  )}
                  <p className="text-sm mt-2 hidden print:block">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {searchTerm || selectedBodyPart ? (
            <div>
              <p className="text-muted-foreground">No medical records match your search criteria</p>
              <Button 
                variant="link" 
                onClick={resetFilters} 
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">No medical history on record</p>
          )}
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
    case 'examination': return 'Imaging Result';
    case 'general': return 'General';
    default: return recordType.charAt(0).toUpperCase() + recordType.slice(1);
  }
};

export default MedicalHistoryTab;
