const FACTORS = [1, 3, 5, 7, 9, 11];

function getCombinations(arr: number[], k: number): number[][] {
    const result: number[][] = [];
    function backtrack(start: number, current: number[]) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    backtrack(0, []);
    return result;
}

const real_degrees_1_6: Record<string, number> = {
    "1": 0, "3": 25, "5": 14, "7": 34, "9": 7, "11": 21
};

const real_degrees_5_6: Record<string, number> = {
    "3·5·7·9·11": 15, "1·5·7·9·11": 32, "1·3·7·9·11": 1,
    "1·3·5·9·11": 23, "1·3·5·7·11": 8, "1·3·5·7·9": 36
};

// All 6 notes of the 5)6 Hexany
const NOTES_5_6_ARRAYS: number[][] = [
    [3, 5, 7, 9, 11], [1, 5, 7, 9, 11], [1, 3, 7, 9, 11],
    [1, 3, 5, 9, 11], [1, 3, 5, 7, 11], [1, 3, 5, 7, 9]
];

function formatNotes16(combo: number[]) {
    return [...combo].sort((a, b) => a - b).join('·');
}

function formatNotes56(combo: number[]) {
    return [...combo].sort((a, b) => a - b).join('·');
}

function generate1_6_Hexany() {
    const pentanies: { group: string; name: string; degrees: number[] }[] = [];
    const tetranies: { group: string; name: string; degrees: number[] }[] = [];
    const trianies: { group: string; name: string; degrees: number[] }[] = [];
    const dyanies: { group: string; name: string; degrees: number[] }[] = [];
    const formatSubsetNotes16 = (combos: number[][]) => {
        return [...combos].sort((a, b) => real_degrees_1_6[formatNotes16(a)] - real_degrees_1_6[formatNotes16(b)])
            .map(formatNotes16).join(', ');
    };
    // 1)5 Pentanies
    let pCount = 1;
    FACTORS.forEach(commonFactor => {
        const remaining = FACTORS.filter(f => f !== commonFactor);
        const notes = remaining.map(r => [r]);
        const degrees = notes.map(c => real_degrees_1_6[formatNotes16(c)]).filter((d): d is number => d !== undefined);
        pentanies.push({
            group: "1)5 Pentanies",
            name: "Pentany " + (pCount++) + ": (" + formatSubsetNotes16(notes) + ")",
            degrees: degrees
        });
    });
    // 1)4 Tetranies
    let tCount = 1;
    const f2s = getCombinations(FACTORS, 2);
    f2s.forEach(f2 => {
        const remaining = FACTORS.filter(f => !f2.includes(f));
        const notes = remaining.map(r => [r]);
        const degrees = notes.map(c => real_degrees_1_6[formatNotes16(c)]).filter((d): d is number => d !== undefined);
        tetranies.push({
            group: "1)4 Tetranies",
            name: "Tetrany " + (tCount++) + ": (" + formatSubsetNotes16(notes) + ")",
            degrees: degrees
        });
    });
    // 1)3 Trianies
    let t3Count = 1;
    const f3s = getCombinations(FACTORS, 3);
    f3s.forEach(f3 => {
        const remaining = FACTORS.filter(f => !f3.includes(f));
        const notes = remaining.map(r => [r]);
        const degrees = notes.map(c => real_degrees_1_6[formatNotes16(c)]).filter((d): d is number => d !== undefined);
        trianies.push({
            group: "1)3 Trianies",
            name: "Triany " + (t3Count++) + ": (" + formatSubsetNotes16(notes) + ")",
            degrees: degrees
        });
    });
    // 1)2 Dyanies
    let dCount = 1;
    const f4s = getCombinations(FACTORS, 4);
    f4s.forEach(f4 => {
        const remaining = FACTORS.filter(f => !f4.includes(f));
        const notes = remaining.map(r => [r]);
        const degrees = notes.map(c => real_degrees_1_6[formatNotes16(c)]).filter((d): d is number => d !== undefined);
        dyanies.push({
            group: "1)2 Dyanies",
            name: "Dyany " + (dCount++) + ": (" + formatSubsetNotes16(notes) + ")",
            degrees: degrees
        });
    });
    return { "Pentanies": pentanies, "Tetranies": tetranies, "Trianies": trianies, "Dyanies": dyanies };
}

function generate5_6_Hexany() {
    const pentanies: { group: string; name: string; degrees: number[] }[] = [];
    const tetranies: { group: string; name: string; degrees: number[] }[] = [];
    const trianies: { group: string; name: string; degrees: number[] }[] = [];
    const dyanies: { group: string; name: string; degrees: number[] }[] = [];
    const formatSubsetNotes56 = (combos: number[][]) => {
        return [...combos].sort((a, b) => real_degrees_5_6[formatNotes56(a)] - real_degrees_5_6[formatNotes56(b)])
            .map(formatNotes56).join(', ');
    };
    // 5)6 Hexany nodes (all combinations of 5 factors from the 6 factors)
    // There are 6 such nodes, they correspond exactly to the indices 0..5
    const notes56 = NOTES_5_6_ARRAYS;
    // 1)5 Pentanies (6 items, each containing 5 notes)
    let pCount = 1;
    getCombinations([0, 1, 2, 3, 4, 5], 5).forEach(indices => {
        const notes = indices.map(i => notes56[i]);
        const degrees = notes.map(c => real_degrees_5_6[formatNotes56(c)]).filter((d): d is number => d !== undefined);
        pentanies.push({
            group: "1)5 Pentanies",
            name: "Pentany " + (pCount++) + ": (" + formatSubsetNotes56(notes) + ")",
            degrees: degrees
        });
    });
    // 1)4 Tetranies (15 items, each containing 4 notes)
    let tCount = 1;
    getCombinations([0, 1, 2, 3, 4, 5], 4).forEach(indices => {
        const notes = indices.map(i => notes56[i]);
        const degrees = notes.map(c => real_degrees_5_6[formatNotes56(c)]).filter((d): d is number => d !== undefined);
        tetranies.push({
            group: "1)4 Tetranies",
            name: "Tetrany " + (tCount++) + ": (" + formatSubsetNotes56(notes) + ")",
            degrees: degrees
        });
    });
    // 1)3 Trianies (20 items, each containing 3 notes)
    let t3Count = 1;
    getCombinations([0, 1, 2, 3, 4, 5], 3).forEach(indices => {
        const notes = indices.map(i => notes56[i]);
        const degrees = notes.map(c => real_degrees_5_6[formatNotes56(c)]).filter((d): d is number => d !== undefined);
        trianies.push({
            group: "1)3 Trianies",
            name: "Triany " + (t3Count++) + ": (" + formatSubsetNotes56(notes) + ")",
            degrees: degrees
        });
    });
    // 1)2 Dyanies (15 items, each containing 2 notes)
    let dCount = 1;
    getCombinations([0, 1, 2, 3, 4, 5], 2).forEach(indices => {
        const notes = indices.map(i => notes56[i]);
        const degrees = notes.map(c => real_degrees_5_6[formatNotes56(c)]).filter((d): d is number => d !== undefined);
        dyanies.push({
            group: "1)2 Dyanies",
            name: "Dyany " + (dCount++) + ": (" + formatSubsetNotes56(notes) + ")",
            degrees: degrees
        });
    });
    return { "Pentanies": pentanies, "Tetranies": tetranies, "Trianies": trianies, "Dyanies": dyanies };
}
export const HEXANY_1_6 = generate1_6_Hexany();
export const HEXANY_5_6 = generate5_6_Hexany();
