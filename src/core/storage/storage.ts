import type { FretboardState } from '../models/FretboardState';
import { initialFretboardState } from '../models/FretboardState';
import { ET12, DAlessandro, HarryPartch } from '../math/tunings';

const STORAGE_KEY_FRETBOARD = 'diapason_fretboard_state_v1';
const STORAGE_KEY_SETTINGS = 'diapason_app_settings_v1';

export interface AppSettings {
  isFlipped: boolean;
  visualGuide: 'JI' | 'Harmonics';
  clickMode: 'play' | 'ghost' | 'chord';
  useTrueTemperament: boolean;
  currentTuningName: 'ET12' | 'DAlessandro' | 'HarryPartch';
}

export const defaultAppSettings: AppSettings = {
  isFlipped: true,
  visualGuide: 'JI',
  clickMode: 'play',
  useTrueTemperament: false,
  currentTuningName: 'ET12'
};

function resolveTuningSystem(name: string) {
  if (name === "D'Alessandro" || name === 'DAlessandro') return DAlessandro;
  if (name === "Harry Partch's 11-limit JI" || name === 'HarryPartch') return HarryPartch;
  return ET12;
}

export function loadSavedFretboardState(): FretboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRETBOARD);
    if (!raw) return initialFretboardState;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.modelId || !Array.isArray(parsed.strings)) {
      return initialFretboardState;
    }
    // Rehydrate tuningSystem instances from saved names
    parsed.strings = parsed.strings.map((str: any) => ({
      ...str,
      tuningSystem: resolveTuningSystem(str.tuningSystem?.name || str.tuningSystem)
    }));
    return parsed as FretboardState;
  } catch (err) {
    console.warn('[STORAGE] Failed to load fretboard state, falling back to default:', err);
    return initialFretboardState;
  }
}

export function saveFretboardState(state: FretboardState): void {
  try {
    localStorage.setItem(STORAGE_KEY_FRETBOARD, JSON.stringify(state));
  } catch (err) {
    console.warn('[STORAGE] Failed to save fretboard state:', err);
  }
}

export function loadSavedAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return defaultAppSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultAppSettings, ...parsed };
  } catch (err) {
    console.warn('[STORAGE] Failed to load app settings, using defaults:', err);
    return defaultAppSettings;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('[STORAGE] Failed to save app settings:', err);
  }
}

export function clearSavedStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_FRETBOARD);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  } catch (err) {
    console.warn('[STORAGE] Failed to clear storage:', err);
  }
}
