import { OrganRendererProps } from './types';

const OrganRenderer = ({ 
  part, 
  isAffected, 
  isHovered, 
  onClick, 
  onHover, 
  transform, 
  paths 
}: OrganRendererProps) => {
  // Get CSS class for a body part based on condition
  const getPartClass = () => {
    const baseClasses = "transition-all duration-300 cursor-pointer ";
    
    // If affected (has condition), keep it white/visible, or red when hovered
    if (isAffected) {
      return baseClasses + (isHovered ? "fill-red-600" : "fill-white");
    }
    
    // If no condition but hovered, show in red with transparency
    if (isHovered) {
      return baseClasses + "fill-red-600 opacity-40";
    }
    
    // No condition and not hovered - make transparent
    return baseClasses + "fill-transparent stroke-transparent";
  };
  
  return (
    <g 
      id={part} 
      className={getPartClass()}
      onClick={() => onClick(part)}
      onMouseEnter={() => onHover(part)}
      onMouseLeave={() => onHover(null)}
      transform={transform}
    >
      {paths}
    </g>
  );
};

export default OrganRenderer;
