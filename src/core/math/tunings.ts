export interface TuningSystem {
  name: string;
  notesPerOctave: number;
  calculateFrequencies: (baseFreq: number, totalNotes: number, startingDegree?: number) => number[];
  getNoteName?: (degree: number, baseFreq?: number) => string;
  calculateFrequency?: (referenceFreq: number, referenceDegree: number, targetDegree: number) => number;
}

export const ET12: TuningSystem = {
  name: "12-TET",
  notesPerOctave: 12,
  calculateFrequency: (referenceFreq: number, referenceDegree: number, targetDegree: number) => {
    return referenceFreq * Math.pow(2, (targetDegree - referenceDegree) / 12);
  },
  calculateFrequencies: (baseFreq: number, totalNotes: number, _startingDegree: number = 0) => {
    return Array.from({ length: totalNotes }, (_, i) => {
      return baseFreq * Math.pow(2, i / 12);
    });
  },
  getNoteName: (_degree: number, baseFreq?: number) => {
    if (!baseFreq) return "";
    const noteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
    const midiNote = Math.round(69 + 12 * Math.log2(baseFreq / 440));
    let idx = midiNote % 12;
    if (idx < 0) idx += 12;
    return noteNames[idx];
  }
};

const p2 = (n: number) => Math.pow(2, n);
const p3 = (n: number) => Math.pow(3, n);
const p11 = (n: number) => Math.pow(11, n);

export const DALESSANDRO_RATIOS = [
  1 * p2(8), 
  (3*7*9*11) / p2(3), 
  (3*11) * p2(3), 
  (3*5*9) * 2,
  (p3(2)*5*9*11) / p2(4), 
  (7*11/9) * p2(5), 
  (5*7) * p2(3), 
  9 * p2(5),
  (3*5*7*11) / p2(2), 
  (3*9*11) * p2(0), 
  (7/3) * p2(7), 
  (9*3*5*9) / p2(2),
  (7*11) * p2(2), 
  (5*7*9) * p2(0), 
  5 * p2(6), 
  (3*5*7*9*11) / p2(5),
  (3*5*11) * 2, 
  (3*7) * p2(4), 
  (3*5*7*9/11) * p2(2), 
  (1/3) * p2(10),
  (7*9*11) / 2, 
  11 * p2(5), 
  (5*9) * p2(3), 
  (3*5*9*11) / p2(2),
  (3*7*9) * 2, 
  3 * p2(7), 
  (5*7*11) * p2(0), 
  (9*11) * p2(2),
  (p3(2)*5*9) * p2(0), 
  (7*11/3) * p2(4), 
  (3*5*7) * p2(2), 
  (3*9) * p2(4),
  (5*7*9*11) / p2(3), 
  (5*11) * p2(3), 
  7 * p2(6), 
  (3*7*11) * 2,
  (3*5*7*9) / 2, 
  (3*5) * p2(5), 
  p11(2) * p2(2), 
  (p3(2)*5*7*9*11) / p2(6),
  (5*9*11) * p2(0), 
  (7*9) * p2(3)
];

export const DAlessandro: TuningSystem = {
  name: "D'Alessandro",
  notesPerOctave: 42,
  calculateFrequency: (referenceFreq: number, referenceDegree: number, targetDegree: number) => {
    let wrapTarget = targetDegree % 42;
    if (wrapTarget < 0) wrapTarget += 42;
    let wrapRef = referenceDegree % 42;
    if (wrapRef < 0) wrapRef += 42;

    const baseRatio = DALESSANDRO_RATIOS[wrapRef];
    const targetRatio = DALESSANDRO_RATIOS[wrapTarget];
    const octaveShift = Math.floor(targetDegree / 42) - Math.floor(referenceDegree / 42);
    
    return referenceFreq * (targetRatio / baseRatio) * Math.pow(2, octaveShift);
  },
  calculateFrequencies: (baseFreq: number, totalNotes: number, startingDegree: number = 0) => {
    let wrapRef = startingDegree % 42;
    if (wrapRef < 0) wrapRef += 42;
    const baseRatio = DALESSANDRO_RATIOS[wrapRef];

    return Array.from({ length: totalNotes }, (_, i) => {
      const currentAbsoluteDegree = startingDegree + i;
      let wrappedDegree = currentAbsoluteDegree % 42;
      if (wrappedDegree < 0) wrappedDegree += 42;
      const octaveShift = Math.floor(currentAbsoluteDegree / 42) - Math.floor(startingDegree / 42);
      
      const targetRatio = DALESSANDRO_RATIOS[wrappedDegree];
      return baseFreq * (targetRatio / baseRatio) * Math.pow(2, octaveShift);
    });
  },
  getNoteName: (degree: number) => {
    const names = [
      "C\\", "C/ or B♯", "C", "C+", "C♯", "C♯", "D♭", "D\\", "D/", "D", 
      "D+", "D+", "D♯", "E♭", "E\\", "E/", "E", "E+ or F♭", "F\\", "F\\", 
      "F/ or E♯", "F", "F+", "F♯", "G♭", "G\\", "G/", "G", "G+", "G♯", 
      "A♭", "A\\", "A/", "A", "A+", "A♯", "B♭", "B\\", "B/", "B/", "B", "B+ or C♭"
    ];
    let normalizedDegree = degree % 42;
    if (normalizedDegree < 0) normalizedDegree += 42;
    return (names[normalizedDegree] || "").split(" or ")[0];
  }
};

export const PARTCH_NOTE_NAMES = [
  "G", "G+", "G↑", "A♭7+", "A♭", "A↓+", "A♭↑", "A", "A+", "Aㄥ", "B♭7", "B♭-", "B♭", "B♭↑-", "B", "C7↓+", "Bㄥ", "C7+", "C", "C+", "C↑", "D♭7", "C♯ㄥ", "D↓", "D-", "D", "Dㄥ-", "E♭7", "D↑ㄥ-", "E♭", "E↓+", "E", "E+", "Eㄥ", "F7+", "F", "F+", "F♯↓+", "F↑", "F♯+", "F♯ㄥ", "G↓", "G-"
];

export const PARTCH_RATIOS = [
  1/1, 81/80, 33/32, 21/20, 16/15, 12/11, 11/10, 10/9, 9/8, 8/7, 7/6, 32/27, 6/5, 11/9, 5/4, 
  14/11, 9/7, 21/16, 4/3, 27/20, 11/8, 7/5, 10/7, 16/11, 40/27, 3/2, 32/21, 14/9, 11/7, 8/5, 
  18/11, 5/3, 27/16, 12/7, 7/4, 16/9, 9/5, 20/11, 11/6, 15/8, 40/21, 64/33, 160/81
];

export const HarryPartch: TuningSystem = {
  name: "Harry Partch's 11-limit JI",
  notesPerOctave: 43,
  getNoteName: (degree: number) => {
    let normalizedDegree = degree % 43;
    if (normalizedDegree < 0) normalizedDegree += 43;
    return PARTCH_NOTE_NAMES[normalizedDegree] || "";
  },
  calculateFrequency: (referenceFreq: number, referenceDegree: number, targetDegree: number) => {
    let wrapTarget = targetDegree % 43;
    if (wrapTarget < 0) wrapTarget += 43;
    let wrapRef = referenceDegree % 43;
    if (wrapRef < 0) wrapRef += 43;

    const baseRatio = PARTCH_RATIOS[wrapRef];
    const targetRatio = PARTCH_RATIOS[wrapTarget];
    const octaveShift = Math.floor(targetDegree / 43) - Math.floor(referenceDegree / 43);
    
    return referenceFreq * (targetRatio / baseRatio) * Math.pow(2, octaveShift);
  },
  calculateFrequencies: (baseFreq: number, totalNotes: number, startingDegree: number = 0) => {
    let wrapRef = startingDegree % 43;
    if (wrapRef < 0) wrapRef += 43;
    const baseRatio = PARTCH_RATIOS[wrapRef];

    return Array.from({ length: totalNotes }, (_, i) => {
      const currentAbsoluteDegree = startingDegree + i;
      let wrappedDegree = currentAbsoluteDegree % 43;
      if (wrappedDegree < 0) wrappedDegree += 43;
      const octaveShift = Math.floor(currentAbsoluteDegree / 43) - Math.floor(startingDegree / 43);
      
      const targetRatio = PARTCH_RATIOS[wrappedDegree];
      return baseFreq * (targetRatio / baseRatio) * Math.pow(2, octaveShift);
    });
  }
};
