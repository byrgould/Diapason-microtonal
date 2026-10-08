import { describe, it, expect } from 'vitest';
import { calculateFretPosition } from './physics';

describe('Physics: calculateFretPosition', () => {
  const standardString = {
    baseFreq: 110, // A2
    scaleLength: 650, // 650mm
    gauge: 0.8,
    isWound: true,
    material: 'nylon',
    tension: 7.2,
    enabled: true,
    actionHeight: 3.0,
    useTrueTemperament: false
  };

  it('should return 0 when target frequency is lower than or equal to base frequency', () => {
    expect(calculateFretPosition(110, standardString)).toBe(0);
    expect(calculateFretPosition(80, standardString)).toBe(0);
  });

  it('should compute exact 12th fret position (octave, ratio 2/1) at scaleLength / 2', () => {
    const octaveFreq = 220; // exactly double
    const pos = calculateFretPosition(octaveFreq, standardString);
    // L2 = L1 * (110 / 220) = 325 => fret = 650 - 325 = 325mm
    expect(pos).toBeCloseTo(325, 4);
  });

  it('should compute fifth (ratio 3/2) accurately', () => {
    const fifthFreq = 110 * 1.5; // 165 Hz
    const pos = calculateFretPosition(fifthFreq, standardString);
    // ideal = 650 * (1 / 1.5) = 433.333 => fret = 650 - 433.333 = 216.666
    expect(pos).toBeCloseTo(216.6667, 3);
  });

  it('should apply intonation compensation when useTrueTemperament is enabled', () => {
    const compensatedString = { ...standardString, useTrueTemperament: true };
    const rawPos = calculateFretPosition(220, standardString);
    const compPos = calculateFretPosition(220, compensatedString);

    expect(compPos).toBeLessThan(rawPos);
    expect(rawPos - compPos).toBeGreaterThan(0.1);
  });
});
