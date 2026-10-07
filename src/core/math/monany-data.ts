function generate0_6_Monany() {
    const monanies = [];
    // The 0)6 Monany contains a single empty set
    monanies.push({
        group: "0)6 Monany",
        name: "Monany 1: (∅)",
        degrees: [0] // Real degree 0 maps to ∅
    });
    return { "Monanies": monanies };
}
function generate6_6_Monany() {
    const monanies = [];
    // The 6)6 Monany contains a single set with all 6 factors
    monanies.push({
        group: "6)6 Monany",
        name: "Monany 1: (3·5·7·9·11)",
        degrees: [15] // Real degree 15 maps to the full set
    });
    return { "Monanies": monanies };
}
export const MONANY_0_6 = generate0_6_Monany();
export const MONANY_6_6 = generate6_6_Monany();
