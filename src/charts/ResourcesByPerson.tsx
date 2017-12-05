import { html } from 'malevic';
import MoneyIcon from './elements/MoneyIcon';
import PersonIcon from './elements/PersonIcon';
import PatternBar from './elements/PatternBar';
import Label from './elements/Label';
import { BelstatData } from '../definitions';

interface ChartProps {
    width: number;
    height: number;
    data: BelstatData;
}

const PADDING = 20;
const BAR_LABEL_SIZE = 10;
const GRID_FILL_COLOR = 'rgba(64, 128, 172, 0.05)';
const BAR_PADDING = 4;
const BASE_OFFSET = -10;
const MONEY_COLOR = 'green';
const TAXES_COLOR = 'rgb(200, 48, 24)';
const PEOPLE_COLOR_HSL_0 = [280, 90, 20];
const PEOPLE_COLOR_HSL_1 = [20, 70, 50];

function format(x: number) {
    let n = x;
    let p = '';
    if (x >= 1000000) {
        n = x / 1000000;
        p = 'M';
    } else if (x >= 1000) {
        n = x / 1000;
        p = 'K';
    }
    const s = n > 1000 ? 0.1 : n > 100 ? 1 : 100;
    return `${Math.round(n * s) / s}${p}`;
};

export default function Chart({ width: srcWidth, height: srcHeight, data }: ChartProps) {

    const MAX_WIDTH = 1200;
    const MIN_WIDTH = 800;
    const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, srcWidth));
    const height = srcHeight / srcWidth * width;

    const ROWS_PER_BAR = width < 900 ? 2 : width < 1000 ? 3 : 4;
    const MONEY_PER_ICON = 5000000 * 25 / ROWS_PER_BAR / ROWS_PER_BAR;
    const PEOPLE_PER_ICON = 30000 * 25 / ROWS_PER_BAR / ROWS_PER_BAR;

    const avgSalaryUsd = data.avgSalaryByn / data.usdToByn;
    const avgPensionUsd = data.avgPensionByn / data.usdToByn;
    const allUsd = data.workingPeople * avgSalaryUsd * (1 - data.taxPercent / 100) + data.retiredPeople * avgPensionUsd;
    const bands = data.perPersonResourcesByn.map((d, i) => {
        const people = data.people * d.percent / 100;
        const fromUsd = d.from / data.usdToByn;
        const toUsd = d.to === Infinity
            ? d.from / data.usdToByn + (data.perPersonResourcesByn[i - 1].to - data.perPersonResourcesByn[i - 1].from) / data.usdToByn * 2
            : d.to / data.usdToByn;
        const totalUsd = d.to === Infinity
            ? 0
            : people * (fromUsd + toUsd) / 2;
        return { fromUsd, toUsd, people, totalUsd };
    });
    bands[0].fromUsd = 50; // For smaller band width
    const lastBand = bands[bands.length - 1];
    lastBand.totalUsd = allUsd - bands.slice(0, bands.length - 1).reduce((sum, d) => sum + d.totalUsd, 0);
    lastBand.toUsd = lastBand.fromUsd + 2 * (lastBand.totalUsd / lastBand.people - lastBand.fromUsd);

    const min = Math.min(...bands.map((d) => d.fromUsd));
    const max = Math.max(...bands.map((d) => d.toUsd));

    function scaleX(d: number) {
        return PADDING + (width - 2 * PADDING) * (d - min) / (max - min);
    }

    const minDiff = Math.min(...bands.map((d) => d.toUsd - d.fromUsd));
    const minStep = (scaleX(max) - scaleX(min)) / (max - min) * minDiff;

    const baseY = height / 2 + BASE_OFFSET;

    const gridBars = bands.filter((d, i) => i % 2 === 1).map((d) => {
        const left = scaleX(d.fromUsd);
        const right = scaleX(d.toUsd);
        const top = PADDING;
        const bottom = height - PADDING;
        return (
            <rect
                x={left}
                y={top}
                width={right - left}
                height={bottom - top}
                fill={GRID_FILL_COLOR}
            />
        );
    });

    const ticks = bands.slice(1).map((d) => {
        return (
            <Label
                class="tick-label"
                x={scaleX(d.fromUsd)}
                y={baseY}
                size={BAR_LABEL_SIZE}
                halign="center"
                valign="center"
            >{`до $${Math.round(d.fromUsd / 5) * 5}`}</Label>
        );
    });

    const moneyBars = bands.map((d) => {
        const includesSteps = Math.round((d.toUsd - d.fromUsd) / minDiff);
        return (
            <PatternBar
                x={scaleX((d.fromUsd + d.toUsd) / 2)}
                y={baseY - BAR_PADDING}
                direction="to-top"
                rows={Math.round(ROWS_PER_BAR * includesSteps)}
                count={Math.round(d.totalUsd / MONEY_PER_ICON)}
                thickness={minStep * includesSteps - BAR_PADDING * 2 * includesSteps}
                pattern={(x, y, size) => <MoneyIcon x={x} y={y} size={size} color={MONEY_COLOR} />}
                label={`$${format(d.totalUsd)}`}
                labelSize={BAR_LABEL_SIZE}
            />
        );
    });

    function getPeopleColor(d) {
        const index = bands.indexOf(d);
        const t = index / (bands.length - 1);
        const c = [];
        for (let i = 0; i < 3; i++) {
            c.push(Math.round(PEOPLE_COLOR_HSL_0[i] * (1 - t) + PEOPLE_COLOR_HSL_1[i] * t));
        }
        return `hsl(${c[0]}, ${c[1]}%, ${c[2]}%)`;
    }

    const peopleBars = bands.map((d) => {
        const includesSteps = Math.round((d.toUsd - d.fromUsd) / minDiff);
        return (
            <PatternBar
                x={scaleX((d.fromUsd + d.toUsd) / 2)}
                y={baseY + BAR_PADDING}
                direction="to-bottom"
                rows={ROWS_PER_BAR * includesSteps}
                count={Math.round(d.people / PEOPLE_PER_ICON)}
                thickness={minStep * includesSteps - BAR_PADDING * 2 * includesSteps}
                pattern={(x, y, size) => <PersonIcon x={x} y={y} size={size} color={getPeopleColor(d)} />}
                label={`${format(d.people)}`}
                labelSize={BAR_LABEL_SIZE}
            />
        );
    });

    const taxesUsd = avgSalaryUsd * data.workingPeople * (data.taxPercent + data.socialTaxPercent) / 100;
    const incomeLabel = `$${format(avgSalaryUsd)} × ${format(data.workingPeople)} × (1 − ${data.taxPercent}%) + $${format(avgPensionUsd)} × ${format(data.retiredPeople)} = $${format(allUsd)} (ЗП и пенсии)`;
    const taxesLabel = `(налог и ФСЗН) $${format(avgSalaryUsd)} × ${format(data.workingPeople)} × (${data.taxPercent}% + ${data.socialTaxPercent}%) = $${format(taxesUsd)}`;

    const TOTALS_PER_ICON = 50000000 * 25 / ROWS_PER_BAR / ROWS_PER_BAR;
    const incomeBar = <PatternBar
        x={width / 2}
        y={height - PADDING - minStep / 2}
        direction="to-left"
        rows={ROWS_PER_BAR}
        count={Math.round(allUsd / TOTALS_PER_ICON)}
        thickness={minStep}
        pattern={(x, y, size) => <MoneyIcon x={x} y={y} size={size} color={MONEY_COLOR} />}
        label={incomeLabel}
        labelSize={BAR_LABEL_SIZE}
    />;
    const taxesBar = <PatternBar
        x={width / 2}
        y={height - PADDING - minStep / 2}
        direction="to-right"
        rows={ROWS_PER_BAR}
        count={Math.round(taxesUsd / TOTALS_PER_ICON)}
        thickness={minStep}
        pattern={(x, y, size) => <MoneyIcon x={x} y={y} size={size} color={TAXES_COLOR} />}
        label={taxesLabel}
        labelSize={BAR_LABEL_SIZE}
    />;

    return (
        <svg width={srcWidth} height={srcHeight} viewBox={`0 0 ${width} ${height}`}>
            {gridBars}
            {ticks}
            {moneyBars}
            {peopleBars}
            <Label class="chart-title" x={width / 2} y={PADDING} halign="center" valign="bottom" size={24}>
                Среднедушевые доходы (по данным Белстат)
            </Label>
            <Label class="axis-label" x={width - PADDING} y={baseY} halign="left" valign="center" size={BAR_LABEL_SIZE}>
                доходы на человека в месяц
            </Label>
            <g class="totals">
                {incomeBar}
                {taxesBar}
            </g>
        </svg>
    );
}
