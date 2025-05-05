import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddPatientForm from './AddPatientForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import debounce from 'lodash.debounce'; 

const PatientSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up debounced search
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [searchQuery]);

  // Trigger search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);

    try {
      // Search by ID
      const { data: patientsById, error: errorById } = await supabase
        .from('patients')
        .select('*')
        .ilike('identifier', `${query}%`)
        .limit(10);
      
      if (errorById) throw errorById;

      // Search by name
      const { data: patientsByName, error: errorByName } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);
          
      if (errorByName) throw errorByName;
      
      // Combine results, remove duplicates
      let combinedResults = [...(patientsById || [])];
      
      if (patientsByName) {
        patientsByName.forEach(nameResult => {
          if (!combinedResults.find(p => p.id === nameResult.id)) {
            combinedResults.push(nameResult);
          }
        });
      }
      
      // Format results to include conditions
      if (combinedResults.length > 0) {
        // For each patient, fetch their conditions
        const patientsWithConditions = await Promise.all(
          combinedResults.map(async (patient) => {
            const { data: conditions } = await supabase
              .from('conditions')
              .select('description')
              .eq('patient_id', patient.id);
              
            return {
              ...patient,
              conditions: conditions 
                ? conditions.map(c => c.description) 
                : []
            };
          })
        );
        
        setSearchResults(patientsWithConditions);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for patients:', error);
      toast({
        title: "Error",
        description: "Failed to search for patients",
        variant: "destructive"
      });
      
      // Fall back to mock data for demo
      // Filter mock data based on query
      const mockPatients = [
        { id: '123456789', name: 'John Doe', dob: '1980-05-15', conditions: ['Hypertension', 'Diabetes'] },
        { id: '234567890', name: 'Jane Smith', dob: '1975-10-22', conditions: ['Asthma'] },
        { id: '345678901', name: 'Greg Johnson', dob: '1990-03-14', conditions: ['Arthritis'] },
      ];
      
      const filteredMock = mockPatients.filter(
        patient => 
          patient.id.startsWith(query) || 
          patient.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filteredMock);
      
      toast({
        title: "Using demo data",
        description: "Showing sample patient data due to database error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const viewPatient = (patientId: string) => {
    navigate(`/patient-profile/${patientId}`);
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="rounded-md border border-border animate-fade-in">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Conditions</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3].map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-9 w-20 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="rounded-md border border-border animate-fade-in">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Conditions</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {searchResults.map((patient) => (
                <tr key={patient.id || patient.identifier}>
                  <td className="px-4 py-3 text-sm">{patient.identifier || patient.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                  <td className="px-4 py-3 text-sm">{patient.dob}</td>
                  <td className="px-4 py-3 text-sm">
                    {patient.conditions && patient.conditions.length > 0
                      ? patient.conditions.join(', ')
                      : 'None recorded'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => viewPatient(patient.identifier || patient.id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (debouncedSearchTerm && !isSearching) {
      return (
        <div className="rounded-md border border-border p-8 text-center animate-fade-in">
          <p className="text-muted-foreground">No patients found matching "{debouncedSearchTerm}"</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Patient Management</h2>
        <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
          <DialogTrigger asChild>
            <Button className="bg-medical-accent hover:bg-medical-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <AddPatientForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {renderSearchResults()}
    </div>
  );
};

export default PatientSearch;
