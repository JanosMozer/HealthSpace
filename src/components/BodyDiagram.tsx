
import { useState } from 'react';

// Define condition types and their colors
type ConditionSeverity = 'mild' | 'moderate' | 'severe';
type BodyPart = 'head' | 'brain' | 'thyroid' | 'heart' | 'lungs' | 'liver' | 
                'stomach' | 'pancreas' | 'smallIntestine' | 'largeIntestine' | 
                'kidneys' | 'bladder' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

interface Condition {
  bodyPart: BodyPart;
  severity: ConditionSeverity;
  description: string;
}

interface BodyDiagramProps {
  conditions: Condition[];
  onAddCondition?: (bodyPart: BodyPart) => void;
  readOnly?: boolean;
}

const BodyDiagram = ({ conditions = [], onAddCondition, readOnly = false }: BodyDiagramProps) => {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<BodyPart | null>(null);
  
  // Get condition for a body part
  const getCondition = (part: BodyPart) => {
    return conditions.find(condition => condition.bodyPart === part);
  };
  
  // Get CSS class for a body part based on condition severity
  const getPartClass = (part: BodyPart) => {
    const condition = getCondition(part);
    const isHovered = hoveredPart === part;
    const baseClasses = "transition-all duration-300 " + (readOnly ? "" : "cursor-pointer ");
    
    if (!condition) {
      return baseClasses + (isHovered && !readOnly ? "fill-gray-300" : "fill-gray-200");
    }
    
    switch (condition.severity) {
      case 'mild':
        return baseClasses + "fill-condition-mild";
      case 'moderate':
        return baseClasses + "fill-condition-moderate";
      case 'severe':
        return baseClasses + "fill-condition-severe";
      default:
        return baseClasses + "fill-gray-200";
    }
  };
  
  const handlePartClick = (part: BodyPart) => {
    if (readOnly) return;
    
    if (onAddCondition && !getCondition(part)) {
      onAddCondition(part);
    } else {
      setSelectedPart(part === selectedPart ? null : part);
    }
  };

  const handlePartHover = (part: BodyPart | null) => {
    if (readOnly) return;
    setHoveredPart(part);
  };

  return (
    <div className="relative">
      {/* SVG Human Body Diagram - Anatomical Version */}
      <svg viewBox="0 0 400 600" className="w-full mx-auto">
        {/* Body outline */}
        <path 
          d="M200,50 C230,50 260,65 260,100 C260,120 250,135 240,150 L240,200 L260,230 L260,350 
             C260,350 250,450 240,500 C235,525 220,560 200,575 
             C180,560 165,525 160,500 C150,450 140,350 140,350 
             L140,230 L160,200 L160,150 C150,135 140,120 140,100 
             C140,65 170,50 200,50 Z"
          className="fill-[#ffe0d0] stroke-[#ccc]"
        />
        
        {/* Head and Brain */}
        <circle 
          cx="200" 
          cy="50" 
          r="30" 
          className={getPartClass('head')}
          onClick={() => handlePartClick('head')}
          onMouseEnter={() => handlePartHover('head')}
          onMouseLeave={() => handlePartHover(null)}
        />
        <path 
          d="M185,35 C195,25 205,25 215,35 C225,45 225,55 215,65 C205,75 195,75 185,65 C175,55 175,45 185,35 Z"
          className={getPartClass('brain')}
          onClick={() => handlePartClick('brain')}
          onMouseEnter={() => handlePartHover('brain')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Thyroid */}
        <ellipse 
          cx="200" 
          cy="95" 
          rx="10" 
          ry="5" 
          className={getPartClass('thyroid')}
          onClick={() => handlePartClick('thyroid')}
          onMouseEnter={() => handlePartHover('thyroid')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Heart */}
        <path 
          d="M185,160 C175,150 175,140 185,130 C195,120 205,120 215,130 C225,140 225,150 215,160 L200,175 Z"
          className={getPartClass('heart')}
          onClick={() => handlePartClick('heart')}
          onMouseEnter={() => handlePartHover('heart')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Lungs */}
        <path 
          d="M170,140 C155,150 155,180 170,190 C175,193 180,193 180,190 L180,140 C180,137 175,137 170,140 Z
             M230,140 C245,150 245,180 230,190 C225,193 220,193 220,190 L220,140 C220,137 225,137 230,140 Z"
          className={getPartClass('lungs')}
          onClick={() => handlePartClick('lungs')}
          onMouseEnter={() => handlePartHover('lungs')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Liver */}
        <path 
          d="M170,210 C160,210 155,220 160,230 C165,240 170,245 180,245 C190,245 190,230 190,220 L190,210 Z"
          className={getPartClass('liver')}
          onClick={() => handlePartClick('liver')}
          onMouseEnter={() => handlePartHover('liver')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Stomach */}
        <path 
          d="M195,210 C205,210 215,215 220,225 C225,235 220,245 210,250 C200,255 195,250 190,245 
             C185,240 185,220 195,210 Z"
          className={getPartClass('stomach')}
          onClick={() => handlePartClick('stomach')}
          onMouseEnter={() => handlePartHover('stomach')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Pancreas */}
        <ellipse 
          cx="200" 
          cy="260" 
          rx="20" 
          ry="5" 
          className={getPartClass('pancreas')}
          onClick={() => handlePartClick('pancreas')}
          onMouseEnter={() => handlePartHover('pancreas')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Small Intestine */}
        <path 
          d="M185,270 C175,275 170,280 170,290 C170,300 180,310 190,310 
             C200,310 210,300 210,290 C210,280 205,275 195,270 Z"
          className={getPartClass('smallIntestine')}
          onClick={() => handlePartClick('smallIntestine')}
          onMouseEnter={() => handlePartHover('smallIntestine')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Large Intestine */}
        <path 
          d="M165,320 C160,320 160,330 165,335 C170,340 180,340 190,335 
             C200,330 210,330 220,335 C225,340 225,345 220,350 
             C215,355 205,355 195,350 C185,345 175,345 170,350 
             C165,355 165,360 170,365 C175,370 185,370 195,365"
          className={getPartClass('largeIntestine')}
          onClick={() => handlePartClick('largeIntestine')}
          onMouseEnter={() => handlePartHover('largeIntestine')}
          onMouseLeave={() => handlePartHover(null)}
          fill="none"
          strokeWidth="10"
          stroke="currentColor"
        />
        
        {/* Kidneys */}
        <path 
          d="M170,280 C165,275 165,270 170,265 C175,260 175,260 170,255 
             C165,250 160,255 160,260 C160,265 160,275 165,280 Z
             M230,280 C235,275 235,270 230,265 C225,260 225,260 230,255 
             C235,250 240,255 240,260 C240,265 240,275 235,280 Z"
          className={getPartClass('kidneys')}
          onClick={() => handlePartClick('kidneys')}
          onMouseEnter={() => handlePartHover('kidneys')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Bladder */}
        <ellipse 
          cx="200" 
          cy="380" 
          rx="15" 
          ry="10" 
          className={getPartClass('bladder')}
          onClick={() => handlePartClick('bladder')}
          onMouseEnter={() => handlePartHover('bladder')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Arms */}
        <rect 
          x="120" 
          y="150" 
          width="20" 
          height="100" 
          rx="10"
          className={getPartClass('leftArm')}
          onClick={() => handlePartClick('leftArm')}
          onMouseEnter={() => handlePartHover('leftArm')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        <rect 
          x="260" 
          y="150" 
          width="20" 
          height="100" 
          rx="10"
          className={getPartClass('rightArm')}
          onClick={() => handlePartClick('rightArm')}
          onMouseEnter={() => handlePartHover('rightArm')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        {/* Legs */}
        <rect 
          x="175" 
          y="400" 
          width="20" 
          height="150" 
          rx="10"
          className={getPartClass('leftLeg')}
          onClick={() => handlePartClick('leftLeg')}
          onMouseEnter={() => handlePartHover('leftLeg')}
          onMouseLeave={() => handlePartHover(null)}
        />
        
        <rect 
          x="205" 
          y="400" 
          width="20" 
          height="150" 
          rx="10"
          className={getPartClass('rightLeg')}
          onClick={() => handlePartClick('rightLeg')}
          onMouseEnter={() => handlePartHover('rightLeg')}
          onMouseLeave={() => handlePartHover(null)}
        />
      </svg>
      
      {/* Hover labels for organs */}
      {hoveredPart && !readOnly && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {hoveredPart.charAt(0).toUpperCase() + hoveredPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}
        </div>
      )}
      
      {/* Condition details when body part is selected */}
      {selectedPart && getCondition(selectedPart) && (
        <div className="mt-4 p-3 border border-border rounded-md bg-card shadow-sm">
          <h4 className="font-medium">{selectedPart.charAt(0).toUpperCase() + selectedPart.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h4>
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
