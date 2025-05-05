
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
}

// Appointment
export interface Appointment {
  date: string;
  type: string;
  place: string;
}

// Examination record
export interface Examination {
  date: string;
  name: string;
  notes: string;
}

// Complete patient type
export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  identifier: string;
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
