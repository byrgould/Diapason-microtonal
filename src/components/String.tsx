import React, { useMemo, useState } from 'react';
import type { GuitarString, ChordNote } from '../core/models/FretboardState';
import { calculateFretPosition } from '../core/math/physics';
import { Fretlet } from './Fretlet';
import { oscService } from '../core/osc/OscService';

interface StringProps {
  stringData: GuitarString;
  visibleLengthMm: number;
  modelId: string;
  isFlipped: boolean;
  visualGuide: 'JI' | 'Harmonics';
  showTTDemo: boolean;
  onFretClick: (freq: number) => void;
  onUpdateStringProps: (updates: any) => void;
  clickMode: 'play' | 'ghost' | 'chord';
  chordNotes: ChordNote[];
  isShiftPressed: boolean;
  onToggleChordNote: (note: ChordNote) => void;
}

export const String: React.FC<StringProps> = ({ 
  stringData, visibleLengthMm, modelId, isFlipped, visualGuide, showTTDemo, onFretClick, onUpdateStringProps, clickMode, chordNotes, isShiftPressed, onToggleChordNote
}) => {
  const [nutActive, setNutActive] = useState(false);

  const handleToggleGhost = (degree: number) => {
    const currentGhosts = stringData.ghostFrets || [];
    const newGhosts = currentGhosts.includes(degree) 
      ? currentGhosts.filter(g => g !== degree) 
      : [...currentGhosts, degree];
    onUpdateStringProps({ ghostFrets: newGhosts });
  };
  // Calculate normal frets
  const frets = useMemo(() => {
    // If showTTDemo is true, we apply TT to ALL frets of the active configuration
    // We multiply actionHeight by 40 here purely to EXAGGERATE the visual effect so the user can see the conceptual shift.
    const activeStringData = showTTDemo 
      ? { ...stringData, useTrueTemperament: true, actionHeight: stringData.actionHeight * 40 }
      : stringData;

    const freqs = stringData.tuningSystem.calculateFrequencies(stringData.baseFreq, stringData.totalFrets, stringData.startingDegree);
    
    return freqs.map((freq, index) => {
      const pos = calculateFretPosition(freq, activeStringData);
      return {
        degree: index,
        frequency: freq,
        positionMm: pos
      };
        }).filter(f => {
      // Physical limit for fretless bowed strings (Viola, Violin, Cello, Contrabajo): no frets past 4/1 ratio (2 octaves)
      if ((modelId === 'viola-4-4' || modelId === 'violin-4-4' || modelId === 'cello-4-4' || modelId === 'contrabajo-3-4') && f.frequency > stringData.baseFreq * 4 + 0.1) {
        return false;
      }
      return f.positionMm <= visibleLengthMm + 0.1;
    });
  }, [stringData, visibleLengthMm, showTTDemo, modelId]);

  // Just Intonation pure geometric markers (always use strict geometry)
  const jiMarkers = useMemo(() => {
    const limitColors = {
      L2: '#f472b6', // Pink
      L3: '#60a5fa', // Blue
      L5: '#34d399', // Emerald
      L7: '#fb923c', // Orange
      L11: '#fbbf24', // Amber
      L13: '#8b5cf6'  // Purple
    };

    let markers = [];
    if (visualGuide === 'JI') {
      markers = [
        { ratio: '9/8', name: 'Segunda Mayor (L3)', freq: stringData.baseFreq * (9/8), color: limitColors.L3 },
        { ratio: '6/5', name: 'Tercera Menor (L5)', freq: stringData.baseFreq * (6/5), color: limitColors.L5 },
        { ratio: '5/4', name: 'Tercera Mayor (L5)', freq: stringData.baseFreq * (5/4), color: limitColors.L5 },
        { ratio: '4/3', name: 'Cuarta Justa (L3)', freq: stringData.baseFreq * (4/3), color: limitColors.L3 },
        { ratio: '11/8', name: 'Cuarta Límite 11 (L11)', freq: stringData.baseFreq * (11/8), color: limitColors.L11 },
        { ratio: '3/2', name: 'Quinta Justa (L3)', freq: stringData.baseFreq * (3/2), color: limitColors.L3 },
        { ratio: '13/8', name: 'Sexta Menor Límite 13 (L13)', freq: stringData.baseFreq * (13/8), color: limitColors.L13 },
        { ratio: '7/4', name: 'Séptima Menor Límite 7 (L7)', freq: stringData.baseFreq * (7/4), color: limitColors.L7 },
        { ratio: '2/1', name: 'Octava (L2)', freq: stringData.baseFreq * 2, color: limitColors.L2 },
        { ratio: '9/4', name: 'Novena Mayor (L3)', freq: stringData.baseFreq * (9/4), color: limitColors.L3 },
        { ratio: '12/5', name: 'Décima Menor (L5)', freq: stringData.baseFreq * (12/5), color: limitColors.L5 },
        { ratio: '5/2', name: 'Décima Mayor (L5)', freq: stringData.baseFreq * (5/2), color: limitColors.L5 },
        { ratio: '8/3', name: 'Undécima Justa (L3)', freq: stringData.baseFreq * (8/3), color: limitColors.L3 },
        { ratio: '3/1', name: 'Tritava (L3)', freq: stringData.baseFreq * 3, color: limitColors.L3 },
        { ratio: '13/4', name: 'Decimotercera Menor Límite 13 (L13)', freq: stringData.baseFreq * (13/4), color: limitColors.L13 },
        { ratio: '4/1', name: 'Doble Octava (L2)', freq: stringData.baseFreq * 4, color: limitColors.L2 }
      ];
    } else {
      // Natural Harmonics
      markers = [
        // Hacia la cejuela
        { ratio: '2/1', name: 'Armónico Natural (L2)', freq: stringData.baseFreq * (2/1), color: limitColors.L2 },
        { ratio: '3/2', name: 'Armónico Natural (L3)', freq: stringData.baseFreq * (3/2), color: limitColors.L3 },
        { ratio: '4/3', name: 'Armónico Natural (L3)', freq: stringData.baseFreq * (4/3), color: limitColors.L3 },
        { ratio: '5/4', name: 'Armónico Natural (L5)', freq: stringData.baseFreq * (5/4), color: limitColors.L5 },
        { ratio: '6/5', name: 'Armónico Natural (L5)', freq: stringData.baseFreq * (6/5), color: limitColors.L5 },
        { ratio: '7/6', name: 'Armónico Natural (L7)', freq: stringData.baseFreq * (7/6), color: limitColors.L7 },
        { ratio: '8/7', name: 'Armónico Natural (L7)', freq: stringData.baseFreq * (8/7), color: limitColors.L7 },
        
        // Hacia la parte aguda
        { ratio: '5/2', name: 'Armónico Natural (L5)', freq: stringData.baseFreq * (5/2), color: limitColors.L5 },
        { ratio: '3/1', name: 'Armónico Natural (L3)', freq: stringData.baseFreq * (3/1), color: limitColors.L3 },
        { ratio: '4/1', name: 'Armónico Natural (L2)', freq: stringData.baseFreq * (4/1), color: limitColors.L2 },
        { ratio: '15/4', name: 'Armónico Natural (L5)', freq: stringData.baseFreq * (15/4), color: limitColors.L5 },
        { ratio: '9/2', name: 'Armónico Natural (L3)', freq: stringData.baseFreq * (9/2), color: limitColors.L3 },
      ];
    }
    
    // Always use useTrueTemperament=false for markers, to serve as geometric reference
    const geometricStringData = { ...stringData, useTrueTemperament: false };

    return markers.map(m => {
      const pos = calculateFretPosition(m.freq, geometricStringData);
      return { ...m, positionMm: pos };
    }).filter(m => m.positionMm <= visibleLengthMm + 0.1); // +0.1 epsilon for floating point
  }, [stringData, visibleLengthMm, visualGuide]);

  // Visual string thickness: directly based on gauge (e.g. gauge * 3 for visibility)
  const thicknessPx = Math.max(1, stringData.gauge * 3);
  
  // Visual string material: Nylon plain = semi-transparent white/silver, Wound = textured/colored
  const isNylon = stringData.material.toLowerCase().includes('nylon plain');
  const stringStyle: React.CSSProperties = {
    height: `${thicknessPx}px`,
    background: isNylon ? 'rgba(255, 255, 255, 0.7)' : undefined,
    // Note: if not nylon, it falls back to the CSS class default (.guitar-string-visual which has the wound texture)
    borderTop: isNylon ? 'none' : '1px solid rgba(255,255,255,0.3)',
    borderBottom: isNylon ? 'none' : '1px solid rgba(0,0,0,0.5)',
    boxShadow: isNylon ? '0 1px 3px rgba(255,255,255,0.4)' : undefined
  };

  let nutRealDegree: number | undefined = undefined;
  if (stringData.startingDegree !== undefined) {
    const n = stringData.tuningSystem.notesPerOctave;
    nutRealDegree = ((stringData.startingDegree % n) + n) % n;
  }

  return (
    <div className={`guitar-string-container ${isFlipped ? 'flipped' : ''}`}>
      {/* The physical string visual */}
      <div 
        className={`guitar-string ${!isNylon ? 'wound' : ''}`}
        style={stringStyle}
      ></div>
      
      {/* The frets for this string (excluding 0, which is the nut) */}
      {frets.filter(f => f.degree > 0 && (!stringData.activeFrets || stringData.activeFrets.includes(f.degree))).map(fret => {
        const absoluteDegree = stringData.startingDegree !== undefined ? stringData.startingDegree + fret.degree : undefined;
        let realDegree: number | undefined = undefined;
        if (absoluteDegree !== undefined) {
          const n = stringData.tuningSystem.notesPerOctave;
          realDegree = ((absoluteDegree % n) + n) % n;
        }

        return (
          <Fretlet
            key={fret.degree}
            id={fret.degree}
            degree={fret.degree}
            absoluteDegree={absoluteDegree}
            realDegree={realDegree}
            positionMm={fret.positionMm}
          visibleLengthMm={visibleLengthMm}
          isFlipped={isFlipped}
          frequency={fret.frequency}
          isActive={false}
          isGhost={(stringData.ghostFrets || []).includes(fret.degree)}
          onHover={() => {}}
          onClick={() => {
            if (clickMode === 'ghost') handleToggleGhost(fret.degree);
            else onFretClick(fret.frequency);
          }}
          clickMode={clickMode}
          isChordActive={chordNotes.some(n => n.stringId === stringData.id && n.relativeFret === fret.degree)}
          isShiftPressed={isShiftPressed}
          onToggleChordNote={() => {
            const absDeg = stringData.startingDegree !== undefined ? stringData.startingDegree + fret.degree : undefined;
            if (absDeg !== undefined) {
              onToggleChordNote({ stringId: stringData.id, relativeFret: fret.degree, absoluteDegree: absDeg });
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            handleToggleGhost(fret.degree);
          }}
        />
        );
      })}

      {/* Just Intonation Markers (Pure Geometry) */}
      {jiMarkers.map((marker, idx) => {
        const positionPercent = (marker.positionMm / visibleLengthMm) * 100;
        
        return (
          <div 
            key={idx}
            className="ji-marker"
            style={{ 
              left: isFlipped ? `${positionPercent}%` : `${100 - positionPercent}%`,
              backgroundColor: marker.color
            }}
            title={`${marker.ratio} (${marker.name}) | ${marker.freq.toFixed(2)} Hz`}
          >
            <span>{marker.ratio}</span>
          </div>
        );
      })}
      
      {/* Nut Visual */}
      <div 
        className={`nut-segment ${nutActive ? 'active-osc' : ''} ${chordNotes.some(n => n.stringId === stringData.id && n.relativeFret === 0) ? 'chord-active' : ''}`}
        title={`${nutRealDegree !== undefined ? `Grado: ${nutRealDegree} | ` : ''}Cuerda al aire: ${stringData.id} | ${stringData.baseFreq.toFixed(2)} Hz${stringData.tuningSystem.getNoteName && stringData.startingDegree !== undefined ? ' (' + stringData.tuningSystem.getNoteName(stringData.startingDegree) + ')' : ''}`}
        onPointerDown={() => {
          const absDegree = stringData.startingDegree !== undefined ? stringData.startingDegree : 0;
          
          if (clickMode === 'chord' || isShiftPressed) {
            onToggleChordNote({ stringId: stringData.id, relativeFret: 0, absoluteDegree: absDegree });
            
            // Short blip for feedback
            setNutActive(true);
            oscService.triggerNote(absDegree, true);
            setTimeout(() => {
              setNutActive(false);
              oscService.triggerNote(absDegree, false);
            }, 150);
          } else if (clickMode === 'play') {
            setNutActive(true);
            oscService.triggerNote(absDegree, true);
            onFretClick(stringData.baseFreq);
            setTimeout(() => {
              setNutActive(false);
              oscService.triggerNote(absDegree, false);
            }, 150);
          }
        }}
        style={{ 
          cursor: 'pointer',
          left: isFlipped ? '0%' : '100%'
        }}
      ></div>

      {/* Frequency Control Input */}
            <div 
        className="freq-control"
        style={{ left: isFlipped ? '-145px' : 'calc(100% + 10px)' }}
      >
        <select 
          value={stringData.startingDegree}
          onChange={(e) => {
            const newDegree = parseInt(e.target.value, 10);
            const ts = stringData.tuningSystem;
            if (ts.calculateFrequency && stringData.startingDegree !== undefined) {
              const newFreq = ts.calculateFrequency(stringData.baseFreq, stringData.startingDegree, newDegree);
              onUpdateStringProps({ 
                baseFreq: newFreq, 
                startingDegree: newDegree,
                totalFrets: ts.name === '12-TET' ? stringData.totalFrets : 0,
                activeFrets: undefined,
                ghostFrets: [],
                activePresetIds: []
              });
            }
          }}
          title={`Ajustar nota de la cuerda ${stringData.id}`}
          style={{ width: '125px', padding: '2px', fontSize: '0.85em', backgroundColor: '#334155', color: 'white', border: '1px solid #475569', borderRadius: '4px' }}
        >
          {(() => {
            const ts = stringData.tuningSystem;
            if (!ts.calculateFrequency || !ts.getNoteName || stringData.startingDegree === undefined) {
              return <option value={stringData.startingDegree}>{stringData.baseFreq.toFixed(2)} Hz</option>;
            }
            const N = ts.notesPerOctave;
            const top = Math.floor((N - 1) / 2);
            const bottom = -Math.ceil((N - 1) / 2);
            const options = [];
            const defaultDegree = stringData.defaultDegree ?? 0;
            for (let i = top; i >= bottom; i--) {
              const targetDegree = defaultDegree + i;
              const freq = ts.calculateFrequency(stringData.baseFreq, stringData.startingDegree, targetDegree);
              const name = ts.getNoteName(targetDegree, freq);
              let label = `${freq.toFixed(2)} Hz (${name})`;
              options.push(
                <option key={targetDegree} value={targetDegree}>
                  {label}
                </option>
              );
            }
            return options;
          })()}
        </select>
      </div>
    </div>
  );
};
