import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadSavedFretboardState, 
  saveFretboardState, 
  loadSavedAppSettings, 
  saveAppSettings, 
  clearSavedStorage,
  defaultAppSettings
} from './storage';
import { initialFretboardState } from '../models/FretboardState';

describe('Storage Service: LocalStorage Persistence', () => {
  beforeEach(() => {
    clearSavedStorage();
  });

  it('should return initial defaults when localStorage is empty', () => {
    const fretboard = loadSavedFretboardState();
    expect(fretboard.modelId).toBe(initialFretboardState.modelId);
    expect(fretboard.strings.length).toBe(initialFretboardState.strings.length);

    const settings = loadSavedAppSettings();
    expect(settings).toEqual(defaultAppSettings);
  });

  it('should persist and rehydrate app settings', () => {
    saveAppSettings({
      isFlipped: false,
      visualGuide: 'Harmonics',
      clickMode: 'chord',
      useTrueTemperament: true,
      currentTuningName: 'DAlessandro'
    });

    const loaded = loadSavedAppSettings();
    expect(loaded.isFlipped).toBe(false);
    expect(loaded.visualGuide).toBe('Harmonics');
    expect(loaded.clickMode).toBe('chord');
    expect(loaded.useTrueTemperament).toBe(true);
    expect(loaded.currentTuningName).toBe('DAlessandro');
  });

  it('should persist and rehydrate fretboard state with active tuning systems', () => {
    const customState = {
      ...initialFretboardState,
      strings: initialFretboardState.strings.map((s, idx) => 
        idx === 0 ? { ...s, gauge: 0.95, tension: 8.5 } : s
      )
    };

    saveFretboardState(customState);
    const rehydrated = loadSavedFretboardState();

    expect(rehydrated.strings[0].gauge).toBe(0.95);
    expect(rehydrated.strings[0].tension).toBe(8.5);
    expect(typeof rehydrated.strings[0].tuningSystem.calculateFrequencies).toBe('function');
  });

  it('should handle corrupted JSON gracefully without crashing', () => {
    localStorage.setItem('diapason_fretboard_state_v1', '{ invalid json [(');
    const recovered = loadSavedFretboardState();
    expect(recovered.modelId).toBe(initialFretboardState.modelId);
  });
});
