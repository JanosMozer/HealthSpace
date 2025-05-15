
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
import debounce from 'lodash/debounce';

// Define an interface for the patient data including gender
interface PatientSearchResult {
  id: string;
  identifier: string;
  name: string;
  dob: string;
  gender: string; // Added gender
}

const PatientSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
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
    if (debouncedSearchTerm.trim()) {
      performSearch(debouncedSearchTerm.trim());
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (query: string) => {
    console.log(`Performing search for: "${query}"`);
    setIsSearching(true);
    setSearchResults([]); // Clear previous results

    let results: PatientSearchResult[] = [];
    let searchError: any = null;

    try {
      // Check if the query starts with a digit
      const startsWithDigit = /^\d/.test(query);

      if (startsWithDigit && query.length > 0 && query.length <= 9) { // Added length > 0 check
        // Search by ID using corrected numeric range
        console.log(`Searching by identifier starting with: ${query}`);

        // Calculate the lower bound (e.g., "123" -> 123000000)
        const lowerBoundString = query.padEnd(9, '0');
        const lowerBound = parseInt(lowerBoundString, 10);

        // Calculate the upper bound based on query length
        // (e.g., for "123", add 10^(9-3) = 1,000,000)
        const power = 9 - query.length;
        const upperBound = lowerBound + Math.pow(10, power);

        // Ensure calculations are valid numbers
        if (!isNaN(lowerBound) && !isNaN(upperBound)) {
          console.log(`Numeric range: >= ${lowerBound}, < ${upperBound}`);
          const { data, error } = await supabase
            .from('patients')
            .select('id, identifier, name, dob, gender')
            .gte('identifier', lowerBound)
            .lt('identifier', upperBound)
            .limit(10);

          if (error) {
            console.error('Error searching by ID range:', error);
            searchError = error;
          } else {
            console.log(`Found ${data?.length || 0} patients by ID range.`);
            results = data || [];
          }
        } else {
           console.warn("Could not calculate valid numeric bounds for ID search.");
           // Proceed without ID results if bounds are invalid
        }

      } else if (!startsWithDigit && query.length > 0) { // Added length > 0 check
        // Search by name only
        console.log(`Searching by name containing: ${query}`);
        const { data, error } = await supabase
          .from('patients')
          .select('id, identifier, name, dob, gender')
          .ilike('name', `%${query}%`)
          .limit(10);

        if (error) {
          console.error('Error searching by name:', error);
          searchError = error;
        } else {
          console.log(`Found ${data?.length || 0} patients by name.`);
          results = data || [];
        }
      }
      // If query is empty, or starts with digit but > 9 digits, results will be empty

      // Handle results or errors (remains the same)
      if (searchError) {
        toast({
          title: "Search Error",
          description: searchError.message || "Failed to fetch patient data.",
          variant: "destructive"
        });
        setSearchResults([]);
      } else {
        console.log(`Setting search results: ${results.length} patients.`);
        setSearchResults(results);
      }

    } catch (error) {
      // Catch unexpected errors (remains the same)
      console.error('Unexpected error during patient search:', error);
      toast({
        title: "Search Error",
        description: "An unexpected error occurred during the search.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      console.log('Search finished.');
    }
  };

  const viewPatient = (patientId: string) => {
    navigate(`/patient-profile/${patientId}`);
  };

  const renderSearchResults = () => {
    if (isSearching && searchResults.length === 0 && debouncedSearchTerm) {
      return (
        <div className="rounded-md border border-border animate-fade-in">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Patient ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gender</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3].map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Patient ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gender</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {searchResults.map((patient) => (
                <tr key={patient.id || patient.identifier}>
                  <td className="px-4 py-3 text-sm">{patient.identifier}</td>
                  <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                  <td className="px-4 py-3 text-sm">{patient.dob}</td>
                  <td className="px-4 py-3 text-sm">{patient.gender || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewPatient(patient.identifier)}
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
    } else if (debouncedSearchTerm && !isSearching && searchResults.length === 0) {
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
