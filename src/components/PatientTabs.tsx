
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Pill, Body, Image, FileText } from 'lucide-react';
import BodyDiagram from './BodyDiagram';
import { Patient } from '@/types/patient';

interface PatientTabsProps {
  patient: Patient;
  isDoctor: boolean;
}

const PatientTabs: React.FC<PatientTabsProps> = ({ patient, isDoctor }) => {
  return (
    <Card className="mt-6">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid grid-cols-5 h-auto p-0">
          <TabsTrigger 
            value="appointments" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs font-medium">Appointments</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="medications" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <Pill className="h-5 w-5" />
            <span className="text-xs font-medium">Medications</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="bodyDiagram" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <Body className="h-5 w-5" />
            <span className="text-xs font-medium">Body Diagram</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="imaging" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <Image className="h-5 w-5" />
            <span className="text-xs font-medium">Imaging</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="history" 
            className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Medical History</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <h3 className="text-xl font-bold mb-4">Doctor Appointments</h3>
            {patient && patient.medicalHistory && patient.medicalHistory.length > 0 ? (
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
                <p className="text-muted-foreground">No appointment history</p>
              </div>
            )}
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <h3 className="text-xl font-bold mb-4">Current Medications</h3>
            {patient && patient.currentConditions && patient.currentConditions.length > 0 ? (
              <div className="divide-y divide-border">
                {patient.currentConditions.map((condition, index) => (
                  <div key={index} className="py-3">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h4 className="font-medium">{condition.name}</h4>
                        <p className="text-sm text-muted-foreground">Since {condition.since}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Dosage</p>
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
                <p className="text-muted-foreground">No current medications</p>
              </div>
            )}
          </TabsContent>
          
          {/* Body Diagram Tab */}
          <TabsContent value="bodyDiagram">
            <h3 className="text-xl font-bold mb-4">Body Diagram</h3>
            <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
              <BodyDiagram 
                conditions={patient.bodyConditions} 
                onAddCondition={isDoctor ? undefined : undefined} 
                readOnly={!isDoctor}
              />
            </div>
            {patient && patient.bodyConditions && patient.bodyConditions.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Documented Conditions:</h4>
                {patient.bodyConditions.map((condition, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">
                        {condition.bodyPart.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{condition.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Imaging Tab */}
          <TabsContent value="imaging">
            <h3 className="text-xl font-bold mb-4">Imaging Examinations</h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No imaging records available</p>
            </div>
          </TabsContent>
          
          {/* Medical History Tab */}
          <TabsContent value="history">
            <h3 className="text-xl font-bold mb-4">Medical History</h3>
            {patient && patient.medicalHistory && patient.medicalHistory.length > 0 ? (
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
                <p className="text-muted-foreground">No medical history on record</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default PatientTabs;
