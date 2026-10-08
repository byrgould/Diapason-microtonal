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

function formatNote(combo: number[]) {
    return [...combo].sort((a, b) => a - b).join('·');
}

const ratio_to_real_2_6: Record<string, number> = {
    "1·3": 25, "1·5": 14, "1·7": 34, "1·9": 7, "1·11": 21,
    "3·5": 37, "3·7": 17, "3·9": 31, "3·11": 2,
    "5·7": 6, "5·9": 22, "5·11": 33,
    "7·9": 41, "7·11": 12, "9·11": 27
};

const ratio_to_real_4_6: Record<string, number> = {
    "1·3·5·7": 30, "1·3·5·9": 3, "1·3·5·11": 16,
    "1·3·7·9": 24, "1·3·7·11": 35, "1·3·9·11": 9,
    "1·5·7·9": 13, "1·5·7·11": 26, "1·5·9·11": 40, "1·7·9·11": 20,
    "3·5·7·9": 36, "3·5·7·11": 8, "3·5·9·11": 23, "3·7·9·11": 1, "5·7·9·11": 32
};

function generate2_6_Pentadekany() {
    const pentanies: { group: string; name: string; degrees: number[] }[] = [];
    const hexanies: { group: string; name: string; degrees: number[] }[] = [];
    const dekanies: { group: string; name: string; degrees: number[] }[] = [];
    const trianies: { group: string; name: string; degrees: number[] }[] = [];
    const dyanies: { group: string; name: string; degrees: number[] }[] = [];
    const formatSubsetNotes26 = (combos: number[][]) => {
        return [...combos].sort((a, b) => ratio_to_real_2_6[formatNote(a)] - ratio_to_real_2_6[formatNote(b)])
            .map(formatNote).join(', ');
    };
    let pCount = 1;
    FACTORS.forEach(commonFactor => {
        const remaining = FACTORS.filter(f => f !== commonFactor);
        const notes = remaining.map(r => [commonFactor, r]);
        const degrees = notes.map(c => ratio_to_real_2_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        pentanies.push({ group: "1)5 Pentanies", name: "Pentany " + (pCount++) + ": (" + formatSubsetNotes26(notes) + ")", degrees });
    });
    let hCount = 1;
    getCombinations(FACTORS, 4).forEach(f4 => {
        const combos = getCombinations(f4, 2);
        const degrees = combos.map(c => ratio_to_real_2_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        hexanies.push({ group: "2)4 Hexanies", name: "Hexany " + (hCount++) + ": (" + formatSubsetNotes26(combos) + ")", degrees });
    });
    let dekCount = 1;
    FACTORS.forEach(omitted => {
        const kept = FACTORS.filter(f => f !== omitted);
        const combos = getCombinations(kept, 2);
        const degrees = combos.map(c => ratio_to_real_2_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        dekanies.push({ group: "2)5 Dekanies", name: "Dekany " + (dekCount++) + ": (" + formatSubsetNotes26(combos) + ")", degrees });
    });
    let tCount = 1;
    getCombinations(FACTORS, 3).forEach(f3 => {
        const combos = getCombinations(f3, 2);
        const degrees = combos.map(c => ratio_to_real_2_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        trianies.push({ group: "1)3 Trianies", name: "Triany " + (tCount++) + ": (" + formatSubsetNotes26(combos) + ")", degrees });
    });
    let dyadCount = 1;
    FACTORS.forEach(sharedFactor => {
        const remaining = FACTORS.filter(f => f !== sharedFactor);
        getCombinations(remaining, 2).forEach(pair => {
            const n1 = [sharedFactor, pair[0]];
            const n2 = [sharedFactor, pair[1]];
            dyanies.push({
                group: "1)2 Dyanies { " + sharedFactor + " }",
                name: "Dyany " + (dyadCount++) + ": (" + formatSubsetNotes26([n1, n2]) + ")",
                degrees: [ratio_to_real_2_6[formatNote(n1)], ratio_to_real_2_6[formatNote(n2)]]
            });
        });
    });
    return { "Dyanies": dyanies, "Trianies": trianies, "Pentanies": pentanies, "Hexanies": hexanies, "Dekanies": dekanies };
}

function generate4_6_Pentadekany() {
    const pentanies: { group: string; name: string; degrees: number[] }[] = [];
    const hexanies: { group: string; name: string; degrees: number[] }[] = [];
    const dekanies: { group: string; name: string; degrees: number[] }[] = [];
    const trianies: { group: string; name: string; degrees: number[] }[] = [];
    const dyanies: { group: string; name: string; degrees: number[] }[] = [];
    const formatSubsetNotes46 = (combos: number[][]) => {
        return [...combos].sort((a, b) => ratio_to_real_4_6[formatNote(a)] - ratio_to_real_4_6[formatNote(b)])
            .map(formatNote).join(', ');
    };
    let hCount = 1;
    getCombinations(FACTORS, 2).forEach(f2 => {
        const remaining = FACTORS.filter(f => !f2.includes(f));
        const combos = getCombinations(remaining, 2);
        const notes = combos.map(c => [...f2, ...c]);
        const degrees = notes.map(c => ratio_to_real_4_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        hexanies.push({ group: "2)4 Hexanies", name: "Hexany " + (hCount++) + ": (" + formatSubsetNotes46(notes) + ")", degrees });
    });
    let dekCount = 1;
    FACTORS.forEach(fixed => {
        const remaining = FACTORS.filter(f => f !== fixed);
        const combos = getCombinations(remaining, 3);
        const notes = combos.map(c => [fixed, ...c]);
        const degrees = notes.map(c => ratio_to_real_4_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        dekanies.push({ group: "3)5 Dekanies", name: "Dekany " + (dekCount++) + ": (" + formatSubsetNotes46(notes) + ")", degrees });
    });
    let pCount = 1;
    FACTORS.forEach(omitted => {
        const kept = FACTORS.filter(f => f !== omitted);
        const combos = getCombinations(kept, 4);
        const degrees = combos.map(c => ratio_to_real_4_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        pentanies.push({ group: "4)5 Pentanies", name: "Pentany " + (pCount++) + ": (" + formatSubsetNotes46(combos) + ")", degrees });
    });
    let t3Count = 1;
    getCombinations(FACTORS, 3).forEach(common3 => {
        const remaining = FACTORS.filter(f => !common3.includes(f));
        const notes = remaining.map(r => [...common3, r]);
        const degrees = notes.map(c => ratio_to_real_4_6[formatNote(c)]).filter((d): d is number => d !== undefined);
        trianies.push({ group: "3)4 Trianies", name: "Triany " + (t3Count++) + ": (" + formatSubsetNotes46(notes) + ")", degrees });
    });
    let dyadCount = 1;
    getCombinations(FACTORS, 3).forEach(shared3 => {
        const remaining = FACTORS.filter(f => !shared3.includes(f));
        getCombinations(remaining, 2).forEach(pair => {
            const n1 = [...shared3, pair[0]];
            const n2 = [...shared3, pair[1]];
            dyanies.push({
                group: "1)2 Dyanies { " + shared3.join('·') + " }",
                name: "Dyany " + (dyadCount++) + ": (" + formatSubsetNotes46([n1, n2]) + ")",
                degrees: [ratio_to_real_4_6[formatNote(n1)], ratio_to_real_4_6[formatNote(n2)]]
            });
        });
    });
    return { "Dyanies": dyanies, "Trianies": trianies, "Pentanies": pentanies, "Hexanies": hexanies, "Dekanies": dekanies };
}
export const PENTADEKANY_2_6 = generate2_6_Pentadekany();
export const PENTADEKANY_4_6 = generate4_6_Pentadekany();
