import type { TuningSystem } from '../math/tunings';
import { ET12 } from '../math/tunings';
import type { StringProperties } from '../math/physics';
import { GUITAR_MODELS } from './GuitarModels';

export interface GuitarString extends StringProperties {
  id: number;
  name: string;
  tuningSystem: TuningSystem;
  totalFrets: number;
  startingDegree?: number;
  defaultDegree?: number;
  activeFrets?: number[]; // Array of fret indices to render (if undefined, render all)
  ghostFrets?: number[]; // Array of fret indices to visually shadow
  activePresetIds?: string[]; // To track explicitly which UI buttons are active
}

// 12-TET MIDI degrees (C4 = 60)
export const ET12_DEGREES_GUITAR: Record<number, number> = {
  1: 64, // E4
  2: 59, // B3
  3: 55, // G3
  4: 50, // D3
  5: 45, // A2
  6: 40, // E2
  7: 38, // D2
  8: 36, // C2
};

export const ET12_DEGREES_VIOLA: Record<number, number> = {
  1: 69, // A4
  2: 62, // D4
  3: 55, // G3
  4: 48, // C3
};

export const ET12_DEGREES_BASS: Record<number, number> = {
  1: 43, // G2
  2: 38, // D2
  3: 33, // A1
  4: 28, // E1
};

export const ET12_DEGREES_CELLO: Record<number, number> = {
  1: 57, // A3
  2: 50, // D3
  3: 43, // G2
  4: 36, // C2
};

export const ET12_DEGREES_VIOLIN: Record<number, number> = {
  1: 76, // E5
  2: 69, // A4
  3: 62, // D4
  4: 55, // G3
};

export interface FretboardState {
  modelId: string;
  strings: GuitarString[];
  scaleLength: number; // Global scale length in mm
  visibleFretboardLength: number; // mm from nut to the physical end of the fretboard
}

export interface ChordNote {
  stringId: number;
  relativeFret: number;
  absoluteDegree: number;
}

export function createFretboardState(modelId: string, tuningSystem: TuningSystem = ET12): FretboardState {
  const model = GUITAR_MODELS[modelId];
  if (!model) throw new Error(`Model not found: ${modelId}`);

  let physicalBoundaryMm = 0;
  
  if (modelId === 'viola-4-4') {
    physicalBoundaryMm = 311; // Exact fingerboard length for Viola 4/4
  } else if (modelId === 'violin-4-4') {
    physicalBoundaryMm = 270; // Exact fingerboard length for Violin 4/4
  } else if (modelId === 'cello-4-4') {
    physicalBoundaryMm = 580; // Exact fingerboard length for Cello 4/4
  } else if (modelId === 'contrabajo-3-4') {
    physicalBoundaryMm = 850; // Exact fingerboard length for Contrabajo 3/4
  } else {
    // Calculate physical visual boundary based on 12-TET max frets limit
    const maxFretRatio = Math.pow(2, model.maxFrets / 12);
    physicalBoundaryMm = model.scaleLength * (1 - 1 / maxFretRatio);
  }

  return {
    modelId: model.id,
    scaleLength: model.scaleLength,
    visibleFretboardLength: physicalBoundaryMm,
    strings: model.defaultStrings.map(s => {
      let startingDegree = 0;
      if (tuningSystem.name === '12-TET') {
        if (modelId === 'viola-4-4') {
          startingDegree = ET12_DEGREES_VIOLA[s.id] || 0;
        } else if (modelId === 'violin-4-4') {
          startingDegree = ET12_DEGREES_VIOLIN[s.id] || 0;
        } else if (modelId === 'cello-4-4') {
          startingDegree = ET12_DEGREES_CELLO[s.id] || 0;
        } else if (modelId === 'contrabajo-3-4') {
          startingDegree = ET12_DEGREES_BASS[s.id] || 0;
        } else {
          startingDegree = ET12_DEGREES_GUITAR[s.id] || 0;
        }
      }
      return {
        id: s.id,
        name: s.name,
        baseFreq: s.baseFreq,
        scaleLength: model.scaleLength,
        gauge: s.gauge,
        isWound: s.isWound,
        material: s.material,
        tension: s.tension,
        enabled: s.enabled,
        actionHeight: s.actionHeight,
        useTrueTemperament: false,
        tuningSystem: tuningSystem,
        startingDegree: startingDegree,
        defaultDegree: startingDegree,
        totalFrets: model.maxFrets > 0 ? model.maxFrets + 1 : 25 // 25 virtual frets (0 to 24) to reach the 4/1 double octave
      };
    })
  };
}

export const initialFretboardState: FretboardState = createFretboardState('pyramid-8-classical');
