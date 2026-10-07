import React, { useState } from 'react';
import { oscService } from '../core/osc/OscService';

interface FretletProps {
  id: number;
  degree: number; // e.g. 0 to 42 for D'Alessandro
  absoluteDegree?: number;
  positionMm: number; // distance from nut in mm
  visibleLengthMm: number; // visual bound
  isFlipped: boolean;
  frequency: number;
  isActive: boolean;
  onHover: (freq: number) => void;
  onClick: () => void;
  clickMode: 'play' | 'ghost' | 'chord';
  isGhost?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  isChordActive?: boolean;
  isShiftPressed?: boolean;
  onToggleChordNote?: () => void;
  realDegree?: number;
}

export const Fretlet: React.FC<FretletProps> = ({ 
  positionMm, 
  visibleLengthMm, 
  isFlipped,
  frequency, 
  isActive, 
  onHover, 
  onClick,
  clickMode,
  isGhost,
  onContextMenu,
  absoluteDegree,
  isChordActive,
  isShiftPressed,
  onToggleChordNote,
  realDegree
}) => {
  const [localOscActive, setLocalOscActive] = useState(false);

  // Nut is on the left if flipped, right if not flipped.
  const positionPercent = (positionMm / visibleLengthMm) * 100;
  

  // Don't render frets that are mathematically outside our visible fretboard range
  // Added a 0.1mm epsilon to prevent floating point errors from hiding the exact limit fret (e.g. fret 21)
  if (positionMm > visibleLengthMm + 0.1) return null;

  const handleClick = () => {
    if ((clickMode === 'chord' || isShiftPressed) && !isGhost) {
      if (onToggleChordNote) onToggleChordNote();
      
      // Short blip for feedback
      setLocalOscActive(true);
      if (absoluteDegree !== undefined) {
        oscService.triggerNote(absoluteDegree, true);
      }
      setTimeout(() => {
        setLocalOscActive(false);
        if (absoluteDegree !== undefined) {
          oscService.triggerNote(absoluteDegree, false);
        }
      }, 150);
    } else if (clickMode === 'play' && !isGhost) {
      setLocalOscActive(true);
      if (absoluteDegree !== undefined) {
        oscService.triggerNote(absoluteDegree, true);
      }
      onClick();
      setTimeout(() => {
        setLocalOscActive(false);
        if (absoluteDegree !== undefined) {
          oscService.triggerNote(absoluteDegree, false);
        }
      }, 150);
    } else {
      onClick();
    }
  };

  return (
    <div 
      className={`fretlet ${isActive ? 'active' : ''} ${localOscActive ? 'active-osc' : ''} ${isGhost ? 'ghost' : ''} ${isChordActive ? 'chord-active' : ''}`}
      style={{ left: isFlipped ? `${positionPercent}%` : `${100 - positionPercent}%` }}
      onMouseEnter={() => onHover(frequency)}
      onPointerDown={handleClick}
      onContextMenu={onContextMenu}
      title={`${realDegree !== undefined ? `Grado: ${realDegree} | ` : ''}${frequency.toFixed(2)} Hz | ${positionMm.toFixed(2)} mm`}
    >
      <div className="fretlet-line"></div>
    </div>
  );
};
