
import { BodyPart } from '@/types/patient';
import { Condition } from './types';

interface ConditionDetailsProps {
  bodyPart: BodyPart;
  condition: Condition | undefined;
}

const ConditionDetails = ({ bodyPart, condition }: ConditionDetailsProps) => {
  if (!condition) return null;
  
  // Format part name for display (convert camelCase to Title Case with spaces)
  const formatPartName = (part: string) => {
    return part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };
  
  return (
    <div className="mt-4 p-3 border border-border rounded-md bg-card shadow-sm">
      <h4 className="font-medium">{formatPartName(bodyPart)}</h4>
      <p className="text-sm text-muted-foreground">{condition.description}</p>
    </div>
  );
};

export default ConditionDetails;
