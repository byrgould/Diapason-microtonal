import { EIKOSANY_DATA } from './eikosany-data';
import { HEXANY_1_6, HEXANY_5_6 } from './hexany-data';
import { PENTADEKANY_2_6, PENTADEKANY_4_6 } from './pentadekany-data';
import { MONANY_0_6, MONANY_6_6 } from './monany-data';
import { OTHER_COLLECTIONS } from './other-collections';
import { PARTCH_COLLECTIONS } from './partch-collections';

export interface PresetSubset {
  id: string;
  group: string;
  name: string;
  degrees: number[];
}

const CPS_MACROS: PresetSubset[] = [
  { group: "Colecciones Completas CPS", id: 'da-monany-0-6', name: '0)6 Monany', degrees: [0] },
  { group: "Colecciones Completas CPS", id: 'da-hexany-1-6', name: '1)6 Hexany', degrees: [0, 7, 14, 21, 25, 34] },
  { group: "Colecciones Completas CPS", id: 'da-pentadekany-2-6', name: '2)6 Pentadekany', degrees: [2, 6, 7, 12, 14, 17, 22, 25, 27, 31, 33, 34, 37, 41] },
  { group: "Colecciones Completas CPS", id: 'da-eikosany-3-6', name: '3)6 Eikosany', degrees: [2, 3, 6, 9, 12, 13, 16, 17, 20, 22, 24, 26, 27, 30, 31, 33, 35, 37, 40, 41] },
  { group: "Colecciones Completas CPS", id: 'da-pentadekany-4-6', name: '4)6 Pentadekany', degrees: [1, 3, 8, 9, 13, 16, 20, 23, 24, 26, 30, 32, 35, 36, 40] },
  { group: "Colecciones Completas CPS", id: 'da-hexany-5-6', name: '5)6 Hexany', degrees: [1, 8, 15, 23, 32, 36] },
  { group: "Colecciones Completas CPS", id: 'da-monany-6-6', name: '6)6 Monany', degrees: [15] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-4', name: 'Linear position +26: Grado 4', degrees: [4] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-5', name: 'Linear position +26: Grado 5', degrees: [5] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-10', name: 'Linear position +9: Grado 10', degrees: [10] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-11', name: 'Linear position +9: Grado 11', degrees: [11] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-18', name: 'Linear position -1: Grado 18', degrees: [18] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-19', name: 'Linear position -1: Grado 19', degrees: [19] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-28', name: '3)6 1-3-7-9-11-15 Eikosany: Grado 28', degrees: [28] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-29', name: '3)6 1-3-7-9-11-15 Eikosany: Grado 29', degrees: [29] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-38', name: 'Linear position +36: Grado 38', degrees: [38] },
  { group: "Pigtails (Teclas Adicionales)", id: 'da-pigtail-39', name: 'Linear position +36: Grado 39', degrees: [39] }
];

const PARTCH_MACROS: PresetSubset[] = [
  { group: "Identidades de Límite (Completas)", id: 'hp-limit-1', name: 'Límite 1 (Fundamental)', degrees: [0] },
  { group: "Identidades de Límite (Completas)", id: 'hp-limit-3', name: 'Identidades Exactas Límite 3', degrees: [8, 11, 18, 25, 32, 35] },
  { group: "Identidades de Límite (Completas)", id: 'hp-limit-5', name: 'Identidades Exactas Límite 5', degrees: [1, 4, 7, 12, 14, 19, 24, 29, 31, 36, 39, 42] },
  { group: "Identidades de Límite (Completas)", id: 'hp-limit-7', name: 'Identidades Exactas Límite 7', degrees: [3, 9, 10, 16, 17, 21, 22, 26, 27, 33, 34, 40] },
  { group: "Identidades de Límite (Completas)", id: 'hp-limit-11', name: 'Identidades Exactas Límite 11', degrees: [2, 5, 6, 13, 15, 20, 23, 28, 30, 37, 38, 41] }
];

export const DALESSANDRO_PRESETS: PresetSubset[] = [...CPS_MACROS];
export const PARTCH_PRESETS: PresetSubset[] = [...PARTCH_MACROS];

function flattenD(category: string, obj: any, prefixId: string) {
  if (!obj) return;
  for (const [key, arr] of Object.entries(obj)) {
    if (Array.isArray(arr)) {
      arr.forEach((item: any, idx: number) => {
        let groupName = `${category} - ${item.group || key}`;
        let itemName = item.name;

        // Specialized handling for "Otras Colecciones" to preserve the parent keys (e.g., Pentatonic, Diatonic, Tetrachords)
        if (category === 'Otras Colecciones') {
          const formattedKey = key.replace(/_/g, ' ');
          groupName = `${category} - ${formattedKey}`;
          if (item.group) {
            itemName = `${item.group}: ${item.name}`;
          }
        }

        DALESSANDRO_PRESETS.push({
          id: `${prefixId}-${key.toLowerCase()}-${idx}`,
          group: groupName,
          name: itemName,
          degrees: item.degrees
        });
      });
    }
  }
}

flattenD('0)6 Monany', MONANY_0_6, '0-6-m');
flattenD('1)6 Hexany', HEXANY_1_6, '1-6-h');
flattenD('2)6 Pentadekany', PENTADEKANY_2_6, '2-6-p');
flattenD('3)6 Eikosany', EIKOSANY_DATA, '3-6-e');
flattenD('4)6 Pentadekany', PENTADEKANY_4_6, '4-6-p');
flattenD('5)6 Hexany', HEXANY_5_6, '5-6-h');
flattenD('6)6 Monany', MONANY_6_6, '6-6-m');
flattenD('Otras Colecciones', OTHER_COLLECTIONS, 'other');

for (const [category, arr] of Object.entries(PARTCH_COLLECTIONS)) {
  if (Array.isArray(arr)) {
    arr.forEach((item: any, idx: number) => {
      const formattedCategory = category.replace(/_/g, ' ');
      const groupName = item.group ? `${item.group} - ${formattedCategory}` : formattedCategory;
      
      PARTCH_PRESETS.push({
        id: `partch-${category.toLowerCase()}-${idx}`,
        group: groupName,
        name: item.name,
        degrees: item.degrees
      });
    });
  }
}

export function generateRelativeFrets(
  absoluteDegrees: number[],
  startingDegree: number,
  totalNotesInOctave: number,
  maxFrets: number = 100
): number[] {
  const activeFrets: number[] = [];
  const degreeSet = new Set(absoluteDegrees);

  for (let relativeFret = 1; relativeFret <= maxFrets; relativeFret++) {
    let currentAbsoluteDegree = (startingDegree + relativeFret) % totalNotesInOctave;
    if (currentAbsoluteDegree < 0) currentAbsoluteDegree += totalNotesInOctave;
    if (degreeSet.has(currentAbsoluteDegree)) {
      activeFrets.push(relativeFret);
    }
  }

  return activeFrets;
}
