
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText } from 'lucide-react';

// Mock patient type
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
    bodyPart: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
  }[];
}

interface PatientInfoProps {
  patient: PatientType;
}

const PatientInfo = ({ patient }: PatientInfoProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-6">
      {/* Top bar with basic info */}
      <Card className="bg-medical-primary border-medical-secondary">
        <CardHeader className="py-4">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
            </div>
            <div className="flex space-x-6">
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{patient.dob}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current conditions */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Current Conditions</CardTitle>
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
            <p className="text-muted-foreground text-center py-4">No current conditions</p>
          )}
        </CardContent>
      </Card>

      {/* Medical history toggle button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={toggleHistory}
          className="border-medical-accent text-medical-accent hover:bg-medical-accent/10"
        >
          <FileText className="h-4 w-4 mr-2" />
          {showHistory ? "Hide Medical History" : "View Medical History"}
        </Button>
      </div>

      {/* Medical history (expandable) */}
      {showHistory && (
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xl">Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {patient.medicalHistory.map((entry, index) => (
                  <div key={index} className="border border-border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{entry.condition}</h4>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                    <p className="text-sm">{entry.notes}</p>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View Complete Records
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No medical history on record</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientInfo;
