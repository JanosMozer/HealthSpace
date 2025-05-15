
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { Card, CardContent } from "@/components/ui/card";
import BodyDiagram from "./BodyDiagram";
import { CalendarDays, Pill } from "lucide-react";

interface PatientInfoProps {
  patient: Patient;
  isReadOnly: boolean;
  onAddHistory?: () => void;
  onNavigateToConditions?: () => void; // Add this prop
}

const PatientInfo: React.FC<PatientInfoProps> = ({ 
  patient,
  isReadOnly,
  onAddHistory,
  onNavigateToConditions // Add this prop
}) => {
  // Filter for upcoming appointments (today or in the future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = patient.appointments
    ?.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3) || [];

  // Filter for current medications
  const currentMedications = patient.currentConditions?.filter(med => med.current !== false).slice(0, 5) || [];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Left column - Upcoming appointments and current medications */}
          <div className="flex-1 space-y-6">
            {/* Upcoming appointments */}
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2 mb-3">
                <CalendarDays className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </h2>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-md">
                      <div className="flex justify-between">
                        <div className="font-medium">{appointment.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString()} {appointment.time}
                        </div>
                      </div>
                      <div className="text-sm">{appointment.place}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              )}
            </div>
            
            {/* Current medications */}
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5 text-primary" />
                Current Medications
              </h2>
              
              {currentMedications.length > 0 ? (
                <div className="space-y-2">
                  {currentMedications.map((medication, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-md">
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.medications?.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No current medications</p>
              )}
            </div>
          </div>
          
          {/* Right column - Body diagram placeholder */}
          <div className="flex-1 border-l pl-6">
            <h2 className="text-lg font-medium mb-3">Medical Conditions</h2>
            <div className="h-[300px] flex items-center justify-center">
              <BodyDiagram 
                conditions={patient.bodyConditions || []}
                readOnly={true}
                onBodyPartClick={onNavigateToConditions} // Add this prop
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          {!isReadOnly && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
            >
              Print Records
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfo;
