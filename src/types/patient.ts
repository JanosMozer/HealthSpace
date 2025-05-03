
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

// Severity levels for conditions
export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

// Patient condition
export interface Condition {
  bodyPart: BodyPart;
  severity: ConditionSeverity;
  description: string;
}

// Complete patient type
export interface Patient {
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
  bodyConditions: Condition[];
}
