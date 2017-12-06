import { BelstatData } from '../definitions';

function merge(...rows) {
    return rows.slice(1).reduce((total, row) => ({
        from: Math.min(total.from, row.from),
        to: Math.max(total.to, row.to),
        percent: total.percent + row.percent
    }), rows[0]);
}

export default <BelstatData>{
    usdToByn: 2.02,
    avgSalaryByn: 841,
    avgPensionByn: 297,
    taxPercent: 13,
    socialTaxPercent: 35,
    people: 9507000,
    workingPeople: 4496000,
    retiredPeople: 2619300,
    perPersonResourcesByn: [
        merge(
            { from: 0, to: 150, percent: 1.5 },
            { from: 150, to: 200, percent: 5.4 },
        ),
        merge(
            { from: 200, to: 250, percent: 8.8 },
            { from: 250, to: 300, percent: 12.1 },
        ),
        merge(
            { from: 300, to: 350, percent: 14 },
            { from: 350, to: 400, percent: 11.7 },
        ),
        { from: 400, to: 500, percent: 18.7 },
        { from: 500, to: 600, percent: 10.9 },
        { from: 600, to: Infinity, percent: 16.9 },
    ]
};
