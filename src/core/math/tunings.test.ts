import { describe, it, expect } from 'vitest';
import { ET12, DAlessandro } from './tunings';

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
});
