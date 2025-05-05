
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { CalendarDays, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PatientInfoProps {
  patient: Patient;
  isReadOnly: boolean;
  onAddHistory?: () => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ 
  patient,
  isReadOnly,
  onAddHistory
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary">{patient.name}</h1>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ID: {patient.identifier}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {patient.age} years old ({patient.gender})
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start mt-4 md:mt-0">
            {!isReadOnly && (
              <Button
                size="sm"
                variant="outline"
                className="mr-2"
                onClick={() => window.print()}
              >
                Print Records
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfo;
