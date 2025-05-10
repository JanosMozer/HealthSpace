
import { BodyPart } from '@/types/patient';

interface HoverLabelProps {
  bodyPart: BodyPart | null;
}

const HoverLabel = ({ bodyPart }: HoverLabelProps) => {
  if (!bodyPart) return null;
  
  // Format part name for display (convert camelCase to Title Case with spaces)
  const formatPartName = (part: string) => {
    return part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };
  
  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
      {formatPartName(bodyPart)}
    </div>
  );
};

export default HoverLabel;
