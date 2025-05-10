
import { BodyPart } from '@/types/patient';

export interface Condition {
  bodyPart: BodyPart;
  description: string;
}

export interface BodyPartProps {
  part: BodyPart;
  isAffected: boolean;
  isHovered: boolean;
  onClick: (part: BodyPart) => void;
  onHover: (part: BodyPart | null) => void;
}

export interface OrganRendererProps {
  part: BodyPart;
  isAffected: boolean;
  isHovered: boolean;
  onClick: (part: BodyPart) => void;
  onHover: (part: BodyPart | null) => void;
  transform: string;
  paths: JSX.Element | JSX.Element[];
}
