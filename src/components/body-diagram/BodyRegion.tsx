
import { BodyPart } from '@/types/patient';
import { BodyPartProps } from './types';

const BodyRegion = ({ part, isAffected, isHovered, onClick, onHover }: BodyPartProps) => {
  // Get path data based on body part
  const getPathData = () => {
    switch (part) {
      case 'head':
        return "M103,28 a28,28 0 1,0 0.1,0 z";
      case 'leftArm':
        return "M90,45 L60,95 L68,100 L92,55 z";
      case 'rightArm':
        return "M118,45 L148,95 L140,100 L114,55 z";
      case 'leftLeg':
        return "M95,120 L90,180 L100,180 L103,120 z";
      case 'rightLeg':
        return "M113,120 L118,180 L108,180 L105,120 z";
      default:
        return "";
    }
  };
  
  return (
    <path 
      d={getPathData()}
      className={`transition-all duration-300 cursor-pointer ${
        isAffected 
          ? (isHovered ? "fill-red-600" : "fill-white")
          : (isHovered ? "fill-red-600 opacity-40" : "fill-transparent stroke-transparent")
      }`}
      onClick={() => onClick(part)}
      onMouseEnter={() => onHover(part)}
      onMouseLeave={() => onHover(null)}
    />
  );
};

export default BodyRegion;
