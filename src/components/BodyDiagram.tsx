
import { useState } from 'react';

// Define condition types and their colors
type ConditionSeverity = 'mild' | 'moderate' | 'severe';
type BodyPart = 'head' | 'chest' | 'abdomen' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

interface Condition {
  bodyPart: BodyPart;
  severity: ConditionSeverity;
  description: string;
}

interface BodyDiagramProps {
  conditions: Condition[];
}

const BodyDiagram = ({ conditions = [] }: BodyDiagramProps) => {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  
  // Get condition for a body part
  const getCondition = (part: BodyPart) => {
    return conditions.find(condition => condition.bodyPart === part);
  };
  
  // Get CSS class for a body part based on condition severity
  const getPartClass = (part: BodyPart) => {
    const condition = getCondition(part);
    if (!condition) return "fill-gray-400";
    
    switch (condition.severity) {
      case 'mild':
        return "fill-condition-mild cursor-pointer";
      case 'moderate':
        return "fill-condition-moderate cursor-pointer";
      case 'severe':
        return "fill-condition-severe cursor-pointer";
      default:
        return "fill-gray-400";
    }
  };
  
  const handlePartClick = (part: BodyPart) => {
    setSelectedPart(part === selectedPart ? null : part);
  };

  return (
    <div className="relative">
      {/* SVG Human Body Diagram */}
      <svg viewBox="0 0 200 400" className="w-full max-w-xs mx-auto">
        {/* Head */}
        <circle 
          cx="100" 
          cy="50" 
          r="30" 
          className={getPartClass('head')}
          onClick={() => handlePartClick('head')}
        />
        
        {/* Torso */}
        <rect 
          x="70" 
          y="85" 
          width="60" 
          height="40" 
          className={getPartClass('chest')}
          onClick={() => handlePartClick('chest')}
        />
        
        <rect 
          x="70" 
          y="125" 
          width="60" 
          height="55" 
          className={getPartClass('abdomen')}
          onClick={() => handlePartClick('abdomen')}
        />
        
        {/* Arms */}
        <rect 
          x="40" 
          y="85" 
          width="30" 
          height="80" 
          className={getPartClass('leftArm')}
          onClick={() => handlePartClick('leftArm')}
        />
        
        <rect 
          x="130" 
          y="85" 
          width="30" 
          height="80" 
          className={getPartClass('rightArm')}
          onClick={() => handlePartClick('rightArm')}
        />
        
        {/* Legs */}
        <rect 
          x="70" 
          y="180" 
          width="25" 
          height="100" 
          className={getPartClass('leftLeg')}
          onClick={() => handlePartClick('leftLeg')}
        />
        
        <rect 
          x="105" 
          y="180" 
          width="25" 
          height="100" 
          className={getPartClass('rightLeg')}
          onClick={() => handlePartClick('rightLeg')}
        />
      </svg>
      
      {/* Condition details when body part is selected */}
      {selectedPart && getCondition(selectedPart) && (
        <div className="mt-4 p-3 border border-border rounded-md bg-card shadow-sm">
          <h4 className="font-medium">{selectedPart.charAt(0).toUpperCase() + selectedPart.slice(1)}</h4>
          <p className="text-sm text-muted-foreground">{getCondition(selectedPart)?.description}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-condition-mild rounded-full mr-1"></div>
          <span>Mild</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-condition-moderate rounded-full mr-1"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-condition-severe rounded-full mr-1"></div>
          <span>Severe</span>
        </div>
      </div>
    </div>
  );
};

export default BodyDiagram;
