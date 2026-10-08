import { describe, it, expect } from 'vitest';
import { ET12, DAlessandro, HarryPartch } from './tunings';

describe('Tuning Systems', () => {
  it('should calculate 12-TET correctly', () => {
    const freqs = ET12.calculateFrequencies(110, 13);
    
    // A2 = 110 Hz
    expect(freqs[0]).toBeCloseTo(110);
    
    // A3 = 220 Hz (octave)
    expect(freqs[12]).toBeCloseTo(220);
    
    // E3 = 164.81 Hz (perfect fifth)
    expect(freqs[7]).toBeCloseTo(164.81, 1);
  });

  it('should calculate D\'Alessandro correctly', () => {
    // We use a base freq of 1.0 to check the pure ratios
    const freqs = DAlessandro.calculateFrequencies(1.0, 43); // 42 notes + octave
    
    // Root = 1.0
    expect(freqs[0]).toBeCloseTo(1.0);
    
    // Octave (note 42) = 2.0
    expect(freqs[42]).toBeCloseTo(2.0);
  });

  it('should calculate Harry Partch\'s 11-limit JI accurately', () => {
    // 43 notes per octave in Partch scale
    const freqs = HarryPartch.calculateFrequencies(196.0, 44, 0); // Root G3 = 196 Hz
    
    // Root = 196 Hz (Ratio 1/1)
    expect(freqs[0]).toBeCloseTo(196.0, 2);
    expect(HarryPartch.getNoteName?.(0)).toBe('G');

    // Perfect fifth in Partch (Ratio 3/2 at degree 25)
    expect(freqs[25]).toBeCloseTo(196.0 * 1.5, 2);
    expect(HarryPartch.getNoteName?.(25)).toBe('D');

    // Complete Octave (Ratio 2/1 at degree 43)
    expect(freqs[43]).toBeCloseTo(196.0 * 2.0, 2);
  });
});
