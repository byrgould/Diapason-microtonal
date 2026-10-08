import { useState, useEffect, useCallback } from 'react';
import { GuitarNeck } from './components/GuitarNeck';
import { ControlPanel } from './components/ControlPanel';
import { StringSettingsPanel } from './components/StringSettingsPanel';
import { FretConstructorPanel } from './components/FretConstructorPanel';
import { OscSettingsPanel } from './components/OscSettingsPanel';
import { createFretboardState, ET12_DEGREES_GUITAR, ET12_DEGREES_VIOLA, ET12_DEGREES_VIOLIN, ET12_DEGREES_CELLO, ET12_DEGREES_BASS } from './core/models/FretboardState';
import type { FretboardState, GuitarString, ChordNote } from './core/models/FretboardState';
import { oscService } from './core/osc/OscService';
import { GUITAR_MODELS } from './core/models/GuitarModels';
import { ET12, DAlessandro, HarryPartch } from './core/math/tunings';
import { 
  loadSavedFretboardState, 
  saveFretboardState, 
  loadSavedAppSettings, 
  saveAppSettings 
} from './core/storage/storage';
import './index.css';


// D'Alessandro exact Wilson formulas (Hz) and starting degrees
const DALESSANDRO_FREQS_GUITAR: Record<number, { freq: number, degree: number }> = {
  1: { freq: 330, degree: 16 },    // E4
  2: { freq: 247.5, degree: -2 },  // B3 (40 - 42)
  3: { freq: 198, degree: -15 },   // G3 (27 - 42)
  4: { freq: 148.5, degree: -33 }, // D3 (9 - 42)
  5: { freq: 110, degree: -51 },   // A2 (33 - 84)
  6: { freq: 82.5, degree: -68 },  // E2 (16 - 84)
  7: { freq: 74.25, degree: -75 }, // D2 (9 - 84)
  8: { freq: 66, degree: -82 },    // C2 (2 - 84)
};

const DALESSANDRO_FREQS_VIOLA: Record<number, { freq: number, degree: number }> = {
  1: { freq: 440, degree: 33 },    // A4
  2: { freq: 297, degree: 9 },     // D4
  3: { freq: 198, degree: -15 },   // G3 (27 - 42)
  4: { freq: 132, degree: -40 },   // C3 (2 - 42)
};

const DALESSANDRO_FREQS_VIOLIN: Record<number, { freq: number, degree: number }> = {
  1: { freq: 660, degree: 57 },    // E5
  2: { freq: 440, degree: 33 },    // A4
  3: { freq: 297, degree: 9 },     // D4
  4: { freq: 198, degree: -15 },   // G3
};


// Harry Partch exact base frequencies and starting degrees
const PARTCH_FREQS_VIOLA: Record<number, { freq: number, degree: number }> = {
  1: { freq: 441, degree: 51 },               // A+4 (8 + 43)
  2: { freq: 294, degree: 25 },               // D4 (3/2 * 1)
  3: { freq: 196, degree: 0 },                // G3 (1/1 * 1)
  4: { freq: 130.66666666666666, degree: -25 } // C3 (18 - 43)
};

const PARTCH_FREQS_VIOLIN: Record<number, { freq: number, degree: number }> = {
  1: { freq: 661.5, degree: 76 },             // E5
  2: { freq: 441, degree: 51 },               // A4
  3: { freq: 294, degree: 25 },               // D4
  4: { freq: 196, degree: 0 },                // G3
};


const DALESSANDRO_FREQS_CELLO: Record<number, { freq: number, degree: number }> = {
  1: { freq: 220, degree: 33 },    // A3
  2: { freq: 148.5, degree: 9 },   // D3
  3: { freq: 99, degree: -15 },    // G2
  4: { freq: 66, degree: -40 },    // C2
};

const PARTCH_FREQS_CELLO: Record<number, { freq: number, degree: number }> = {
  1: { freq: 220.5, degree: 51 },             // A3
  2: { freq: 147, degree: 25 },               // D3
  3: { freq: 98, degree: 0 },                 // G2
  4: { freq: 65.33333333333333, degree: -25 } // C2
};


const DALESSANDRO_FREQS_BASS: Record<number, { freq: number, degree: number }> = {
  1: { freq: 99, degree: -15 },    // G2
  2: { freq: 74.25, degree: -33 }, // D2 (G2 / 1.333333333) -> Wait, perfect fourth down! 
  // Wait, D'Alessandro tuning is by fourths?
  // 99 / 1.333 = 74.25
  // A1 = 74.25 / 1.333 = 55.6875 -> degree -51
  // E1 = 55.6875 / 1.333 = 41.765 -> degree -68
  3: { freq: 55.6875, degree: -51 }, // A1
  4: { freq: 41.765625, degree: -68 }, // E1
};

const PARTCH_FREQS_BASS: Record<number, { freq: number, degree: number }> = {
  1: { freq: 98, degree: 0 },                 // G2
  2: { freq: 73.5, degree: -18 },              // D2 (25 - 43)
  3: { freq: 55.125, degree: -35 },            // A+1 (8 - 43)
  4: { freq: 41.34375, degree: -53 }           // E1 
};

const PARTCH_FREQS_GUITAR: Record<number, { freq: number, degree: number }> = {
  1: { freq: 326.6666666666667, degree: 31 }, // E4 (5/3 * 1)
  2: { freq: 245, degree: 14 },               // B3 (5/4 * 1)
  3: { freq: 196, degree: 0 },                // G3 (1/1 * 1)
  4: { freq: 147, degree: -18 },              // D3 (25 - 43)
  5: { freq: 110.25, degree: -35 },           // A+2 (8 - 43)
  6: { freq: 81.66666666666667, degree: -55 },// E2 (31 - 86)
  7: { freq: 73.5, degree: -61 },             // D2 (25 - 86)
  8: { freq: 65.33333333333333, degree: -68 },// C2 (18 - 86)
};

function App() {
  const [savedSettings] = useState(() => loadSavedAppSettings());
  const [fretboardState, setFretboardState] = useState<FretboardState>(() => loadSavedFretboardState());
  const [isFlipped, setIsFlipped] = useState(savedSettings.isFlipped);
  const [useTrueTemperament, setUseTrueTemperament] = useState(savedSettings.useTrueTemperament);
  const [visualGuide, setVisualGuide] = useState<'JI' | 'Harmonics'>(savedSettings.visualGuide);
  const [clickMode, setClickMode] = useState<'play' | 'ghost' | 'chord'>(savedSettings.clickMode);
  const [chordNotes, setChordNotes] = useState<ChordNote[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveFretboardState(fretboardState);
  }, [fretboardState]);

  useEffect(() => {
    let currentTuningName: 'ET12' | 'DAlessandro' | 'HarryPartch' = 'ET12';
    const firstTuning = fretboardState.strings[0]?.tuningSystem.name;
    if (firstTuning === "D'Alessandro") currentTuningName = 'DAlessandro';
    else if (firstTuning === "Harry Partch's 11-limit JI") currentTuningName = 'HarryPartch';

    saveAppSettings({
      isFlipped,
      useTrueTemperament,
      visualGuide,
      clickMode,
      currentTuningName
    });
  }, [isFlipped, useTrueTemperament, visualGuide, clickMode, fretboardState]);

  const playChord = useCallback(() => {
    if (chordNotes.length === 0) return;
    
    // Deduplicate absolute degrees to prevent sending multiple Note On/Off commands
    // for the same pitch, which can cause hanging notes in synthesizers.
    const uniqueDegrees = Array.from(new Set(chordNotes.map(n => n.absoluteDegree)));
    
    // Note On
    uniqueDegrees.forEach(degree => {
      oscService.triggerNote(degree, true);
    });

    // Note Off
    setTimeout(() => {
      uniqueDegrees.forEach(degree => {
        oscService.triggerNote(degree, false);
      });
    }, 150);
  }, [chordNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        playChord();
      }
      if (e.key === 'Escape') {
        setChordNotes([]);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playChord]);

  const handleSelectTuning = (tuningName: 'ET12' | 'DAlessandro' | 'HarryPartch') => {
    const system = tuningName === 'ET12' ? ET12 : (tuningName === 'DAlessandro' ? DAlessandro : HarryPartch);
    const defaultModel = GUITAR_MODELS[fretboardState.modelId]; // fallback to default freqs for 12-TET

    setFretboardState(prev => ({
      ...prev,
      strings: prev.strings.map(s => {
        let newFreq = s.baseFreq;
        let startingDegree = s.startingDegree;
        let defaultDegree = s.defaultDegree;
        
        if (tuningName === 'DAlessandro') {
          let config;
          if (fretboardState.modelId === 'viola-4-4') config = DALESSANDRO_FREQS_VIOLA[s.id];
          else if (fretboardState.modelId === 'violin-4-4') config = DALESSANDRO_FREQS_VIOLIN[s.id];
          else if (fretboardState.modelId === 'cello-4-4') config = DALESSANDRO_FREQS_CELLO[s.id];
          else if (fretboardState.modelId === 'contrabajo-3-4') config = DALESSANDRO_FREQS_BASS[s.id];
          else config = DALESSANDRO_FREQS_GUITAR[s.id];
          
          if (config) {
            newFreq = config.freq;
            startingDegree = config.degree;
            defaultDegree = config.degree;
          }
        } else if (tuningName === 'HarryPartch') {
          let pConfig;
          if (fretboardState.modelId === 'viola-4-4') pConfig = PARTCH_FREQS_VIOLA[s.id];
          else if (fretboardState.modelId === 'violin-4-4') pConfig = PARTCH_FREQS_VIOLIN[s.id];
          else if (fretboardState.modelId === 'cello-4-4') pConfig = PARTCH_FREQS_CELLO[s.id];
          else if (fretboardState.modelId === 'contrabajo-3-4') pConfig = PARTCH_FREQS_BASS[s.id];
          else pConfig = PARTCH_FREQS_GUITAR[s.id];
          
          if (pConfig) {
            newFreq = pConfig.freq;
            startingDegree = pConfig.degree;
            defaultDegree = pConfig.degree;
          }
        } else if (tuningName === 'ET12') {
          const defaultString = defaultModel.defaultStrings.find(ds => ds.id === s.id);
          newFreq = defaultString ? defaultString.baseFreq : s.baseFreq;
          if (fretboardState.modelId === 'viola-4-4') startingDegree = ET12_DEGREES_VIOLA[s.id] || 0;
          else if (fretboardState.modelId === 'violin-4-4') startingDegree = ET12_DEGREES_VIOLIN[s.id] || 0;
          else if (fretboardState.modelId === 'cello-4-4') startingDegree = ET12_DEGREES_CELLO[s.id] || 0;
          else if (fretboardState.modelId === 'contrabajo-3-4') startingDegree = ET12_DEGREES_BASS[s.id] || 0;
          else startingDegree = ET12_DEGREES_GUITAR[s.id] || 0;
          defaultDegree = startingDegree;
        }

        return {
          ...s,
          baseFreq: newFreq,
          startingDegree,
          defaultDegree,
          tuningSystem: system,
          totalFrets: tuningName === 'ET12' ? (fretboardState.modelId === 'viola-4-4' || fretboardState.modelId === 'violin-4-4' || fretboardState.modelId === 'cello-4-4' || fretboardState.modelId === 'contrabajo-3-4' ? 25 : 22) : 0,
          activeFrets: undefined
        };
      })
    }));
  };

  const handleSelectInstrument = (modelId: string) => {
    // Keep current tuning system but recreate fretboard based on the new model
    const currentSystem = fretboardState.strings[0].tuningSystem;
    const newState = createFretboardState(modelId, currentSystem);
    
    // Map base frequencies for specific systems
    if (currentSystem.name === "D'Alessandro") {
      newState.strings = newState.strings.map(s => {
        let config;
        if (modelId === 'viola-4-4') config = DALESSANDRO_FREQS_VIOLA[s.id];
        else if (modelId === 'violin-4-4') config = DALESSANDRO_FREQS_VIOLIN[s.id];
        else if (modelId === 'cello-4-4') config = DALESSANDRO_FREQS_CELLO[s.id];
        else if (modelId === 'contrabajo-3-4') config = DALESSANDRO_FREQS_BASS[s.id];
        else config = DALESSANDRO_FREQS_GUITAR[s.id];
        return {
          ...s,
          baseFreq: config ? config.freq : s.baseFreq,
          startingDegree: config ? config.degree : 0,
          defaultDegree: config ? config.degree : 0,
          totalFrets: 0,
          activeFrets: undefined
        };
      });
    } else if (currentSystem.name === "Harry Partch's 11-limit JI") {
      newState.strings = newState.strings.map(s => {
        let pConfig;
        if (modelId === 'viola-4-4') pConfig = PARTCH_FREQS_VIOLA[s.id];
        else if (modelId === 'violin-4-4') pConfig = PARTCH_FREQS_VIOLIN[s.id];
        else if (modelId === 'cello-4-4') pConfig = PARTCH_FREQS_CELLO[s.id];
        else if (modelId === 'contrabajo-3-4') pConfig = PARTCH_FREQS_BASS[s.id];
        else pConfig = PARTCH_FREQS_GUITAR[s.id];
        return {
          ...s,
          baseFreq: pConfig ? pConfig.freq : s.baseFreq,
          startingDegree: pConfig ? pConfig.degree : 0,
          defaultDegree: pConfig ? pConfig.degree : 0,
          totalFrets: 0,
          activeFrets: undefined
        };
      });
    }
    
    // Always disable TT when switching instrument (specifically important for Viola/Violin)
    setUseTrueTemperament(false);
    setFretboardState(newState);
    setChordNotes([]);
  };


  const handleUpdateStringProps = (stringId: number, updates: Partial<GuitarString>) => {
    setFretboardState(prev => ({
      ...prev,
      strings: prev.strings.map(s => 
        s.id === stringId ? { ...s, ...updates } : s
      )
    }));
    // Clear chords if we modify frets to prevent invalid frets remaining selected
    if (updates.activeFrets !== undefined || updates.ghostFrets !== undefined) {
      setChordNotes([]);
    }
  };

  const handleNewFretboard = () => {
    alert("Función para construir un nuevo diapasón en construcción...");
  };

  // Display name is derived from the first string's tuning system
  const currentTuningName = fretboardState.strings[0].tuningSystem.name;
  const currentModelName = GUITAR_MODELS[fretboardState.modelId].name;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Diapasón Microtonal</h1>
        <p style={{ display: 'none' }}>
          {fretboardState.modelId === 'pyramid-8-classical' 
            ? 'Agradecimiento a Tolgahan Çoğulu | ' + currentTuningName 
            : currentModelName + ' — ' + currentTuningName}
        </p>
        
        {chordNotes.length > 0 && (
          <div className="chord-action-bar">
            <span>{chordNotes.length} nota{chordNotes.length > 1 ? 's' : ''} armada{chordNotes.length > 1 ? 's' : ''}</span>
            <button className="chord-btn play" onClick={playChord}>▶ Tocar (Espacio)</button>
            <button className="chord-btn clear" onClick={() => setChordNotes([])}>✖ Limpiar (Esc)</button>
          </div>
        )}
      </header>
      
      <ControlPanel 
        currentModelId={fretboardState.modelId}
        visualGuide={visualGuide}
        onSelectVisualGuide={setVisualGuide}
        clickMode={clickMode}
        onSelectClickMode={setClickMode}
        currentTuningName={currentTuningName}
        showTTDemo={useTrueTemperament && fretboardState.modelId !== 'viola-4-4' && fretboardState.modelId !== 'violin-4-4' && fretboardState.modelId !== 'cello-4-4' && fretboardState.modelId !== 'contrabajo-3-4'}
        onSelectInstrument={handleSelectInstrument}
        onSelectTuning={handleSelectTuning as any}
        onNewFretboard={handleNewFretboard}
        onToggleFlip={() => setIsFlipped(!isFlipped)}
        onToggleTTDemo={() => setUseTrueTemperament(!useTrueTemperament)}
      >
        <div className="panels-container">
          <StringSettingsPanel 
            fretboardState={fretboardState}
            onUpdateStringProps={handleUpdateStringProps}
          />
          <FretConstructorPanel 
            fretboardState={fretboardState}
            onUpdateStringProps={handleUpdateStringProps}
          />
          <OscSettingsPanel currentTuning={currentTuningName} />
        </div>
      </ControlPanel>

      <main className="main-content">
        
        <GuitarNeck 
          fretboardState={fretboardState} 
          isFlipped={isFlipped}
          visualGuide={visualGuide}
          showTTDemo={useTrueTemperament}
          onUpdateStringProps={handleUpdateStringProps}
          clickMode={clickMode}
          chordNotes={chordNotes}
          isShiftPressed={isShiftPressed}
          onToggleChordNote={(note) => {
            setChordNotes(prev => {
              // If the exact fret is already selected, unselect it
              const exists = prev.find(n => n.stringId === note.stringId && n.relativeFret === note.relativeFret);
              if (exists) {
                return prev.filter(n => !(n.stringId === note.stringId && n.relativeFret === note.relativeFret));
              }
              // Otherwise, remove any other fret on the same string and add the new one
              const withoutSameString = prev.filter(n => n.stringId !== note.stringId);
              return [...withoutSameString, note];
            });
          }}
        />
      </main>
    </div>
  );
}

export default App;
