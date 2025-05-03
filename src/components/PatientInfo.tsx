
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText } from 'lucide-react';
import { BodyPart } from '@/types/patient';

// Define patient type
interface PatientType {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  currentConditions: {
    name: string;
    since: string;
    medications: string[];
  }[];
  medicalHistory: {
    date: string;
    condition: string;
    notes: string;
  }[];
  bodyConditions: {
    bodyPart: BodyPart;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
  }[];
}

interface PatientInfoProps {
  patient: PatientType;
  isReadOnly?: boolean;
}

const PatientInfo = ({ patient, isReadOnly = true }: PatientInfoProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

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
                  <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
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

      {/* Current conditions */}
      <Card>
        <CardHeader className="py-4 flex flex-row justify-between items-center">
          <CardTitle className="text-xl text-primary">Current Conditions</CardTitle>
          {!isReadOnly && (
            <Button variant="outline" size="sm">
              Add Condition
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {patient.currentConditions.length > 0 ? (
            <div className="divide-y divide-border">
              {patient.currentConditions.map((condition, index) => (
                <div key={index} className="py-3">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h4 className="font-medium">{condition.name}</h4>
                      <p className="text-sm text-muted-foreground">Since {condition.since}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Current Medications</p>
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
              {!isReadOnly ? (
                <div className="bg-muted p-6 rounded-md">
                  <p className="text-muted-foreground">No conditions recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add current conditions using the button above
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No current conditions</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical history toggle button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={toggleHistory}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <FileText className="h-4 w-4 mr-2" />
          {showHistory ? "Hide Medical History" : "View Medical History"}
        </Button>
      </div>

      {/* Medical history (expandable) */}
      {showHistory && (
        <Card>
          <CardHeader className="py-4 flex flex-row justify-between items-center">
            <CardTitle className="text-xl text-primary">Medical History</CardTitle>
            {!isReadOnly && (
              <Button variant="outline" size="sm">
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
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Complete Records
                  </Button>
                </div>
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
      )}
    </div>
  );
};

export default PatientInfo;
