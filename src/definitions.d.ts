export interface BelstatData {
    usdToByn: number;
    avgSalaryByn: number;
    avgPensionByn: number;
    taxPercent: number;
    socialTaxPercent: number;
    people: number;
    workingPeople: number;
    retiredPeople: number;
    perPersonResourcesByn: {
        from: number;
        to: number;
        percent: number;
    }[];
}
