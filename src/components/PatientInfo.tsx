
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { Patient } from '@/types/patient';

interface PatientInfoProps {
  patient: Patient;
  isReadOnly?: boolean;
  onAddHistory?: () => void;
}

const PatientInfo = ({ 
  patient, 
  isReadOnly = true,
  onAddHistory
}: PatientInfoProps) => {
  const [showHistory, setShowHistory] = useState(false);

  // For empty profile, show a prompt for doctors to fill in information
  const isEmpty = !patient.name;

  return (
    <div className="space-y-6">
      {/* Top bar with basic info */}
      <Card className="bg-white border-primary shadow-sm">
        <CardHeader className="py-4">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              {isEmpty && !isReadOnly ? (
                <div className="bg-muted p-3 rounded-md text-muted-foreground">
                  <h2 className="text-lg font-medium">New Patient Profile</h2>
                  <p className="text-sm">Please fill in patient information</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary">{patient.name || "Patient Name"}</h2>
                  <p className="text-sm text-muted-foreground">ID: {patient.identifier}</p>
                </>
              )}
            </div>
            <div className="flex space-x-6">
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium">{patient.age || "-"} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{patient.dob || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium">{patient.gender || "-"}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medical history section */}
      <Card>
        <CardHeader className="py-4 flex flex-row justify-between items-center">
          <CardTitle className="text-xl text-primary">Medical History</CardTitle>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={onAddHistory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {patient.medicalHistory.length > 0 ? (
            <div className="space-y-4">
              {patient.medicalHistory.map((entry, index) => (
                <div key={index} className="border border-border rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{entry.condition}</h4>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-sm">{entry.notes}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {!isReadOnly ? (
                <div className="bg-muted p-6 rounded-md">
                  <p className="text-muted-foreground">No medical history recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add medical history using the button above
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No medical history on record</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientInfo;
