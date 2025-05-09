
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
  diagnosisTime?: string;
  diagnosisPlace?: string;
}

// Appointment
export interface Appointment {
  id?: string; // Optional: if you assign a client-side ID before DB ID is known
  date: string;
  time?: string;
  type: string;
  place: string;
  doctorName?: string;
  doctorWorkplace?: string;
  status?: 'pending' | 'done';
}

// Examination record
export interface Examination {
  date: string;
  name: string;
  notes: string;
  doctorName?: string;
  doctorWorkplace?: string;
  imageUrl?: string; // URL to the image stored in a cloud storage service
}

// Enhanced medical history record with doctor information
export interface MedicalHistoryRecord {
  date: string;
  condition: string;
  notes: string;
  doctorName?: string;
  doctorWorkplace?: string;
  recordType?: 'medication' | 'condition' | 'appointment' | 'general' | 'examination';
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
