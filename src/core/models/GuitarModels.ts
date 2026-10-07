export interface GuitarModelConfig {
  id: string;
  name: string;
  scaleLength: number; // mm
  maxFrets: number; // Physical limit (usually 21 for this project)
  defaultStrings: {
    id: number;
    name: string;
    baseFreq: number; // default Hz
    gauge: number; // mm
    isWound: boolean;
    material: string;
    tension: number; // kg
    enabled: boolean;
    actionHeight: number; // mm (for future TT)
  }[];
}

export const GUITAR_MODELS: Record<string, GuitarModelConfig> = {
  'pyramid-8-classical': {
    id: 'pyramid-8-classical',
    name: 'Pyramid 8-string Classical',
    scaleLength: 650,
    maxFrets: 21,
    defaultStrings: [
      { id: 1, name: 'e¹', baseFreq: 329.63, gauge: 0.70, isWound: false, material: 'Nylon plain', tension: 7.2, enabled: true, actionHeight: 2.5 },
      { id: 2, name: 'b',  baseFreq: 246.94, gauge: 0.90, isWound: false, material: 'Nylon plain', tension: 6.7, enabled: true, actionHeight: 2.8 },
      { id: 3, name: 'g',  baseFreq: 196.00, gauge: 1.05, isWound: false, material: 'Nylon plain', tension: 5.7, enabled: true, actionHeight: 3.0 },
      { id: 4, name: 'd',  baseFreq: 146.83, gauge: 0.71, isWound: true,  material: 'Silver-plated copper on nylon silk', tension: 5.5, enabled: true, actionHeight: 3.2 },
      { id: 5, name: 'A',  baseFreq: 110.00, gauge: 0.88, isWound: true,  material: 'Silver-plated copper on nylon silk', tension: 6.4, enabled: true, actionHeight: 3.5 },
      { id: 6, name: 'E',  baseFreq: 82.41,  gauge: 1.13, isWound: true,  material: 'Silver-plated copper on nylon silk', tension: 5.8, enabled: true, actionHeight: 3.8 },
      { id: 7, name: 'D',  baseFreq: 73.42,  gauge: 1.26, isWound: true,  material: 'Silver-plated copper on nylon silk', tension: 6.2, enabled: true, actionHeight: 4.2 },
      { id: 8, name: 'C',  baseFreq: 65.41,  gauge: 1.43, isWound: true,  material: 'Silver-plated copper on nylon silk', tension: 6.4, enabled: true, actionHeight: 4.5 },
    ]
  },
  'viola-4-4': {
    id: 'viola-4-4',
    name: 'Viola 4/4 (16")',
    scaleLength: 375, // mm
    maxFrets: 0, // Not limited by frets, limited by visibleFretboardLength below
    defaultStrings: [
      { id: 1, name: 'A4', baseFreq: 440.00, gauge: 0.50, isWound: true, material: 'Steel core, chrome wound', tension: 8.2, enabled: true, actionHeight: 3.0 },
      { id: 2, name: 'D4', baseFreq: 293.66, gauge: 0.70, isWound: true, material: 'Synthetic core, silver wound', tension: 6.1, enabled: true, actionHeight: 3.5 },
      { id: 3, name: 'G3', baseFreq: 196.00, gauge: 0.90, isWound: true, material: 'Synthetic core, silver wound', tension: 5.6, enabled: true, actionHeight: 4.0 },
      { id: 4, name: 'C3', baseFreq: 130.81, gauge: 1.20, isWound: true, material: 'Synthetic core, tungsten-silver wound', tension: 5.6, enabled: true, actionHeight: 4.5 }
    ]
  },
  'violin-4-4': {
    id: 'violin-4-4',
    name: 'Violín 4/4',
    scaleLength: 328, // mm (typical vibrating string length for 4/4 violin)
    maxFrets: 0, // Not limited by frets, limited by visibleFretboardLength below
    defaultStrings: [
      { id: 1, name: 'E5', baseFreq: 659.25, gauge: 0.26, isWound: false, material: 'Steel', tension: 7.8, enabled: true, actionHeight: 2.5 },
      { id: 2, name: 'A4', baseFreq: 440.00, gauge: 0.50, isWound: true, material: 'Synthetic core, aluminum wound', tension: 5.5, enabled: true, actionHeight: 3.0 },
      { id: 3, name: 'D4', baseFreq: 293.66, gauge: 0.70, isWound: true, material: 'Synthetic core, silver wound', tension: 4.6, enabled: true, actionHeight: 3.5 },
      { id: 4, name: 'G3', baseFreq: 196.00, gauge: 0.90, isWound: true, material: 'Synthetic core, silver wound', tension: 4.8, enabled: true, actionHeight: 4.0 }
    ]
  },
  'cello-4-4': {
    id: 'cello-4-4',
    name: 'Violonchelo (Cello) 4/4',
    scaleLength: 690,
    maxFrets: 0,
    defaultStrings: [
      { id: 1, name: 'A3', baseFreq: 220.00, gauge: 0.70, isWound: true, material: 'Steel core, chrome wound', tension: 13.0, enabled: true, actionHeight: 5.5 },
      { id: 2, name: 'D3', baseFreq: 146.83, gauge: 0.90, isWound: true, material: 'Steel core, chrome wound', tension: 12.5, enabled: true, actionHeight: 6.5 },
      { id: 3, name: 'G2', baseFreq: 98.00, gauge: 1.20, isWound: true, material: 'Spiral core, tungsten/silver', tension: 12.0, enabled: true, actionHeight: 7.5 },
      { id: 4, name: 'C2', baseFreq: 65.41, gauge: 1.60, isWound: true, material: 'Spiral core, tungsten/silver', tension: 12.0, enabled: true, actionHeight: 8.5 }
    ]
  },
  'contrabajo-3-4': {
    id: 'contrabajo-3-4',
    name: 'Contrabajo 3/4 (Orquesta)',
    scaleLength: 1040,
    maxFrets: 0,
    defaultStrings: [
      { id: 1, name: 'G2', baseFreq: 98.00, gauge: 1.20, isWound: true, material: 'Steel core, chrome wound', tension: 30.0, enabled: true, actionHeight: 7.0 },
      { id: 2, name: 'D2', baseFreq: 73.42, gauge: 1.50, isWound: true, material: 'Steel core, chrome wound', tension: 29.5, enabled: true, actionHeight: 8.0 },
      { id: 3, name: 'A1', baseFreq: 55.00, gauge: 2.00, isWound: true, material: 'Steel core, chrome wound', tension: 28.0, enabled: true, actionHeight: 9.0 },
      { id: 4, name: 'E1', baseFreq: 41.20, gauge: 2.60, isWound: true, material: 'Steel core, chrome wound', tension: 27.5, enabled: true, actionHeight: 10.0 }
    ]
  }
};
