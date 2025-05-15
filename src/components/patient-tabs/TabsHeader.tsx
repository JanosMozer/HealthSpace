
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Pill, FileText, Image } from 'lucide-react';

const TabsHeader = () => {
  return (
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
        value="conditions" 
        className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
      >
        <FileText className="h-5 w-5" />
        <span className="text-xs font-medium">Conditions</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="examinations" 
        className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
      >
        <Image className="h-5 w-5" />
        <span className="text-xs font-medium">Imaging Results</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="medicalHistory" 
        className="flex flex-col items-center py-4 gap-2 data-[state=active]:bg-primary/10"
      >
        <FileText className="h-5 w-5" />
        <span className="text-xs font-medium">Medical History</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabsHeader;
