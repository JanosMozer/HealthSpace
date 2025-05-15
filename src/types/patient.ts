
// Define body parts that can be highlighted on the diagram
export type BodyPart = 
  | 'head' 
  | 'brain' 
  | 'thyroid' 
  | 'heart' 
  | 'lungs' 
  | 'liver' 
  | 'stomach' 
  | 'pancreas' 
  | 'smallIntestine' 
  | 'largeIntestine' 
  | 'kidneys' 
  | 'bladder' 
  | 'leftArm' 
  | 'rightArm' 
  | 'leftLeg' 
  | 'rightLeg';

// Patient condition
export interface Condition {
  bodyPart: BodyPart;
  description: string;
  doctorName?: string;
  doctorWorkplace?: string;
  diagnosisDate?: string;  // Changed from diagnosisTime to diagnosisDate
  diagnosisPlace?: string;
}

// Appointment
export interface Appointment {
  id?: string; 
  date: string;
  time?: string;
  type: string;
  place: string;
  doctorName?: string;
  doctorWorkplace?: string;
  status?: 'pending' | 'done';
  bodyPart?: BodyPart;  // Added bodyPart
}

// Renamed from Examination to ImagingResult for type consistency
export interface Examination {
  date: string;
  name: string;
  notes: string;
  doctorName?: string;
  doctorWorkplace?: string;
  imageUrl?: string;
  bodyPart?: BodyPart;  // Added bodyPart
}

// Enhanced medical history record with doctor information
export interface MedicalHistoryRecord {
  date: string;
  condition: string;
  notes: string;
  doctorName?: string;
  doctorWorkplace?: string;
  recordType?: 'medication' | 'condition' | 'appointment' | 'general' | 'examination';
  bodyPart?: BodyPart;  // Added bodyPart
}

// Complete patient type
export interface Patient {
  id: string; // This is the UUID from patients.id
  name: string;
  age: number;
  dob: string;
  gender: string;
  identifier: number; // This is the int8 identifier from patients.identifier
  currentConditions: {
    name: string;
    since: string;
    medications: string[];
    current?: boolean;
    bodyPart?: BodyPart;  // Added bodyPart
  }[];
  medicalHistory: MedicalHistoryRecord[];
  bodyConditions: Condition[];
  appointments?: Appointment[];
  examinations?: Examination[];
}

export interface Doctor {
  id: string;
  email: string;
  name: string;
  workplace: string;
  identifier: string;
}
