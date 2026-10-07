export interface StringProperties {
  baseFreq: number; // Hz (open string)
  scaleLength: number; // mm (e.g. 650)
  gauge: number; // mm or inches
  isWound: boolean;
  material: string;
  tension: number; // kg
  enabled: boolean;
  actionHeight: number; // mm (height at 12th fret)
  useTrueTemperament?: boolean; // Flag to enable string tension compensation
}

/**
 * Calculates the exact fret position in millimeters from the nut (0).
 * 
 * @param targetFreq The desired frequency for this fret
 * @param stringProps Physical properties of the string
 * @returns The distance from the nut in mm
 */
export function calculateFretPosition(targetFreq: number, stringProps: StringProperties): number {
  if (targetFreq <= stringProps.baseFreq) return 0;

  // 1. Ideal String Math (No compensation)
  // L2 = L1 * (f1 / f2)
  const idealVibratingLength = stringProps.scaleLength * (stringProps.baseFreq / targetFreq);
  let fretPositionFromNut = stringProps.scaleLength - idealVibratingLength;

  // 2. Dynamic Intonation Compensation (True Temperament approximation)
  if (stringProps.useTrueTemperament) {
    const stretchFactor = stringProps.actionHeight * 0.1; // simplified coefficient
    const massFactor = stringProps.isWound ? 1.02 : 1.0;  // wound strings are stiffer
    const compensation = (fretPositionFromNut / stringProps.scaleLength) * stretchFactor * massFactor;
    fretPositionFromNut -= compensation;
  }

  return fretPositionFromNut;
}
