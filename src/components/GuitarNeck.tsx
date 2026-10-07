import React from 'react';
import type { FretboardState, ChordNote } from '../core/models/FretboardState';
import { String as GuitarStringComponent } from './String';

interface GuitarNeckProps {
  fretboardState: FretboardState;
  isFlipped: boolean;
  visualGuide: 'JI' | 'Harmonics';
  showTTDemo: boolean;
  onUpdateStringProps: (stringId: number, updates: any) => void;
  clickMode: 'play' | 'ghost' | 'chord';
  chordNotes: ChordNote[];
  isShiftPressed: boolean;
  onToggleChordNote: (note: ChordNote) => void;
}

export const GuitarNeck: React.FC<GuitarNeckProps> = ({ 
  fretboardState, isFlipped, visualGuide, showTTDemo, onUpdateStringProps, clickMode, chordNotes, isShiftPressed, onToggleChordNote
}) => {
  const handleFretClick = (freq: number) => {
    console.log(`OSC Message Emitted: /mnote ${freq.toFixed(2)}Hz`);
    // Future OSC implementation goes here
  };

  // The strings are from 8 (lowest) to 1 (highest).
  // The user requested heavy strings on top, light strings on bottom.
  // If isFlipped = true: High strings (1) on top, Low strings (8) on bottom -> sort ascending by id
  // If isFlipped = false: Low strings (8) on top, High strings (1) on bottom -> sort descending by id
  const renderedStrings = [...fretboardState.strings].sort((a, b) => isFlipped ? a.id - b.id : b.id - a.id);

  return (
    <div 
      className={`guitar-neck-wrapper ${isFlipped ? 'flipped' : ''}`}
      style={{
        padding: isFlipped ? '10px 20px 10px 145px' : '10px 145px 10px 20px'
      }}
    >
      <div className="guitar-neck">
        {renderedStrings.filter(s => s.enabled).map(stringData => (
          <GuitarStringComponent
            key={stringData.id}
            stringData={stringData}
            visibleLengthMm={fretboardState.visibleFretboardLength}
            modelId={fretboardState.modelId}
            isFlipped={isFlipped}
            visualGuide={visualGuide}
            showTTDemo={showTTDemo}
            onFretClick={handleFretClick}
            clickMode={clickMode}
            onUpdateStringProps={(updates) => onUpdateStringProps(stringData.id, updates)}
            chordNotes={chordNotes}
            isShiftPressed={isShiftPressed}
            onToggleChordNote={onToggleChordNote}
          />
        ))}
      </div>
    </div>
  );
};
