
import { useState } from 'react';
import { BodyPart } from '@/types/patient';
import { 
  BodySvg,
  ConditionDetails,
  HoverLabel,
  Condition
} from './body-diagram';

interface BodyDiagramProps {
  conditions: Condition[];
  onAddCondition?: (bodyPart: BodyPart) => void;
  readOnly?: boolean;
  onNavigateToConditions?: () => void;
}

const BodyDiagram = ({ 
  conditions = [], 
  onAddCondition, 
  readOnly = false,
  onNavigateToConditions
}: BodyDiagramProps) => {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<BodyPart | null>(null);
  
  // Get condition for a body part
  const getCondition = (part: BodyPart) => {
    return conditions.find(condition => condition.bodyPart === part);
  };
  
  // Handle click on a body part
  const handlePartClick = (part: BodyPart) => {
    if (readOnly) {
      // Navigate to conditions tab when clicking on a part in read-only mode
      if (onNavigateToConditions) {
        onNavigateToConditions();
      }
      return;
    }
    
    if (onAddCondition) {
      onAddCondition(part);
    } else {
      setSelectedPart(part === selectedPart ? null : part);
    }
  };

  // Handle hover on a body part
  const handlePartHover = (part: BodyPart | null) => {
    setHoveredPart(part);
  };

  // Get affected body parts from conditions
  const affectedParts = conditions.map(condition => condition.bodyPart);

  return (
    <div className="relative">
      {/* Human Silhouette with Organ Overlays */}
      <div className="relative w-full max-w-[300px] mx-auto">
        <BodySvg 
          affectedParts={affectedParts}
          hoveredPart={hoveredPart}
          onPartClick={handlePartClick}
          onPartHover={handlePartHover}
        />
      </div>
      
      {/* Hover label */}
      <HoverLabel bodyPart={hoveredPart} />
      
      {/* Condition details when body part is selected */}
      {selectedPart && (
        <ConditionDetails 
          bodyPart={selectedPart} 
          condition={getCondition(selectedPart)} 
        />
      )}
    </div>
  );
};

export default BodyDiagram;
