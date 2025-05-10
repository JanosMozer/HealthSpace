
import { useState, useEffect } from 'react';
import { BodyPart } from '@/types/patient';

interface Condition {
  bodyPart: BodyPart;
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
  const [organSVGs, setOrganSVGs] = useState<Record<string, string>>({});
  
  // Available body parts and their corresponding SVG files
  const bodyPartSVGs: Record<BodyPart, string> = {
    brain: 'brain.svg',
    heart: 'heart.svg',
    lungs: 'lungs.svg',
    liver: 'liver.svg',
    stomach: 'stomach.svg',
    pancreas: 'pancreas.svg',
    largeIntestine: 'large_intestine.svg',
    kidneys: 'kidney.svg', // Note: file is kidney.svg but part is kidneys
    thyroid: 'thyroid.svg',
    bladder: 'bladder.svg',
    smallIntestine: '', // No SVG file for these parts
    head: '',
    leftArm: '',
    rightArm: '',
    leftLeg: '',
    rightLeg: ''
  };
  
  // Load SVG content for each organ
  useEffect(() => {
    const loadOrganSVGs = async () => {
      const loadedSVGs: Record<string, string> = {};
      
      for (const [part, svgFile] of Object.entries(bodyPartSVGs)) {
        if (svgFile) {
          try {
            const response = await fetch(`/SVG_parts/${svgFile}`);
            if (response.ok) {
              const svgContent = await response.text();
              loadedSVGs[part] = extractSVGContent(svgContent);
            } else {
              console.error(`Failed to load SVG for ${part}: ${response.status}`);
            }
          } catch (error) {
            console.error(`Error loading SVG for ${part}:`, error);
          }
        }
      }
      
      setOrganSVGs(loadedSVGs);
    };
    
    loadOrganSVGs();
  }, []);
  
  // Helper function to extract the inner content from SVG
  const extractSVGContent = (svgString: string): string => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) return '';
    
    // Get only the path/group elements inside the SVG
    return Array.from(svgElement.children)
      .filter(node => node.tagName !== 'title' && node.tagName !== 'desc')
      .map(node => node.outerHTML)
      .join('');
  };
  
  // Get condition for a body part
  const getCondition = (part: BodyPart) => {
    return conditions.find(condition => condition.bodyPart === part);
  };
  
  // Handle click on a body part
  const handlePartClick = (part: BodyPart) => {
    if (readOnly) return;
    
    if (onAddCondition) {
      onAddCondition(part);
    } else {
      setSelectedPart(part === selectedPart ? null : part);
    }
  };

  // Handle hover on a body part
  const handlePartHover = (part: BodyPart | null) => {
    if (readOnly) return;
    setHoveredPart(part);
  };
  
  // Get CSS class for a body part based on condition
  const getPartClass = (part: BodyPart) => {
    const condition = getCondition(part);
    const isHovered = hoveredPart === part;
    const baseClasses = "transition-all duration-300 " + (readOnly ? "" : "cursor-pointer ");
    
    if (!condition) {
      return baseClasses + (isHovered && !readOnly ? "fill-gray-300" : "fill-gray-200");
    }
    
    // Highlight affected body parts
    return baseClasses + "fill-primary";
  };

  // Get affected body parts from conditions
  const affectedParts = conditions.map(condition => condition.bodyPart);

  return (
    <div className="relative">
      {/* Human Silhouette with Organ Overlays */}
      <div className="relative w-full max-w-[300px] mx-auto">
        {/* Base Silhouette */}
        <img 
          src="/SVG_parts/standing_human_body_silhouette.svg" 
          alt="Human body silhouette"
          className="w-full h-auto"
        />
        
        {/* Organ SVG Overlays */}
        <svg 
          className="absolute top-0 left-0 w-full h-full" 
          viewBox="0 0 512 1024" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {Object.entries(organSVGs).map(([part, svgContent]) => {
            const bodyPart = part as BodyPart;
            const isAffected = affectedParts.includes(bodyPart);
            
            if (!isAffected) return null;
            
            // Position and scale the organs appropriately
            let transform = "";
            switch (bodyPart) {
              case 'brain':
                transform = "translate(170, 60) scale(0.8)";
                break;
              case 'heart':
                transform = "translate(200, 220) scale(0.6)";
                break;
              case 'lungs':
                transform = "translate(150, 200) scale(0.8)";
                break;
              case 'liver':
                transform = "translate(190, 280) scale(0.7)";
                break;
              case 'stomach':
                transform = "translate(220, 300) scale(0.7)";
                break;
              case 'pancreas':
                transform = "translate(200, 320) scale(0.7)";
                break;
              case 'largeIntestine':
                transform = "translate(170, 350) scale(0.7)";
                break;
              case 'kidneys':
                transform = "translate(170, 300) scale(0.7)";
                break;
              case 'thyroid':
                transform = "translate(210, 150) scale(0.6)";
                break;
              case 'bladder':
                transform = "translate(210, 400) scale(0.6)";
                break;
              default:
                transform = "";
            }
            
            return (
              <g 
                key={bodyPart}
                transform={transform} 
                className={getPartClass(bodyPart)}
                onClick={() => handlePartClick(bodyPart)}
                onMouseEnter={() => handlePartHover(bodyPart)}
                onMouseLeave={() => handlePartHover(null)}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            );
          })}
          
          {/* Clickable regions for parts without specific SVGs */}
          {['head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'].map((partName) => {
            const part = partName as BodyPart;
            const isAffected = affectedParts.includes(part);
            
            let pathData = "";
            switch (part) {
              case 'head':
                pathData = "M256,100 a50,60 0 1,0 0.1,0 z";
                break;
              case 'leftArm':
                pathData = "M180,240 L120,380 L150,400 L190,260 z";
                break;
              case 'rightArm':
                pathData = "M320,240 L380,380 L350,400 L310,260 z";
                break;
              case 'leftLeg':
                pathData = "M230,500 L200,900 L240,900 L260,500 z";
                break;
              case 'rightLeg':
                pathData = "M280,500 L310,900 L270,900 L250,500 z";
                break;
              default:
                return null;
            }
            
            return (
              <path 
                key={part}
                d={pathData}
                className={`${isAffected ? 'fill-primary opacity-40' : 'fill-transparent'} stroke-transparent hover:fill-gray-300 hover:opacity-30 cursor-pointer`}
                onClick={() => handlePartClick(part)}
                onMouseEnter={() => handlePartHover(part)}
                onMouseLeave={() => handlePartHover(null)}
              />
            );
          })}
        </svg>
      </div>
      
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
    </div>
  );
};

export default BodyDiagram;
