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

const MAX_WIDTH = 1200;
const MIN_WIDTH = 800;
const ICON_SIZE = 16;
const PADDING = 20;
const BAR_LABEL_SIZE = 10;
const MONEY_HISTOGRAM_HEIGHT_RATIO = 0.7;
const PEOPLE_HISTOGRAM_HEIGHT_RATIO = 0.3;
const GRID_FILL_COLOR = 'rgba(64, 128, 172, 0.05)';
const BAR_PADDING = 2;
const BASE_OFFSET = 5;
const MONEY_COLOR = 'green';
const TAXES_COLOR = 'rgb(200, 48, 24)';
const PEOPLE_COLOR_HSL_0 = [280, 90, 20];
const PEOPLE_COLOR_HSL_1 = [20, 70, 50];

function formatShort(x: number) {
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
}

function formatLong(x: number) {
    const s = Math.round(x).toString(10);
    let r = '';
    for (let i = 0; i < s.length; i++) {
        r += i >= 3 ? '0' : s.charAt(i);
        if ((s.length - i - 1) % 3 === 0 && i < s.length - 1) {
            r += ' ';
        }
    }
    return r;
}

export default function Chart({ width: srcWidth, height: srcHeight, data }: ChartProps) {

    const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, srcWidth));
    const height = srcHeight / srcWidth * width;

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
    const lastBand = bands[bands.length - 1];
    lastBand.totalUsd = allUsd - bands.slice(0, bands.length - 1).reduce((sum, d) => sum + d.totalUsd, 0);
    lastBand.toUsd = lastBand.fromUsd + 2 * (lastBand.totalUsd / lastBand.people - lastBand.fromUsd);

    function scaleX(d: number) {
        const x0 = PADDING;
        const x1 = width - PADDING;
        const pTicks = [0];
        bands.forEach((b) => {
            pTicks.push(pTicks[pTicks.length - 1] + b.people);
        });
        const xTicks = pTicks.map((p) => {
            const tp = (p - pTicks[0]) / (pTicks[pTicks.length - 1] - pTicks[0]);
            return x0 * (1 - tp) + x1 * tp;
        });
        const bandIndex = bands.findIndex((b) => d >= b.fromUsd && d <= b.toUsd);
        const band = bands[bandIndex];
        const t = (d - band.fromUsd) / (band.toUsd - band.fromUsd);
        return xTicks[bandIndex] * (1 - t) + xTicks[bandIndex + 1] * t;
    }

    const maxMoneyPerPeopleBand = bands.slice().sort((a, b) => b.totalUsd / b.people - a.totalUsd / a.people)[0];
    const maxMoneyPerPeopleWidth = scaleX(maxMoneyPerPeopleBand.toUsd) - scaleX(maxMoneyPerPeopleBand.fromUsd) - BAR_PADDING * 2;
    const maxMoneyPerPeopleHeight = MONEY_HISTOGRAM_HEIGHT_RATIO * (height / 2 - PADDING);
    const MONEY_PER_ICON = maxMoneyPerPeopleBand.totalUsd / (
        maxMoneyPerPeopleWidth * maxMoneyPerPeopleHeight / (ICON_SIZE ** 2)
    );
    const peopleWidth = scaleX(lastBand.toUsd) - scaleX(bands[0].fromUsd) - BAR_PADDING * 2;
    const peopleHeight = PEOPLE_HISTOGRAM_HEIGHT_RATIO * (height / 2 - PADDING);
    const PEOPLE_PER_ICON = data.people / (
        peopleWidth * peopleHeight / (ICON_SIZE ** 2)
    );

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
        const barWidth = scaleX(d.toUsd) - scaleX(d.fromUsd) - 2 * BAR_PADDING;
        const rows = Math.floor(barWidth / ICON_SIZE);
        const thickness = rows * ICON_SIZE;
        return (
            <PatternBar
                x={scaleX((d.fromUsd + d.toUsd) / 2)}
                y={baseY - BAR_PADDING - BAR_LABEL_SIZE / 2}
                direction="to-top"
                rows={rows}
                count={Math.round(d.totalUsd / MONEY_PER_ICON)}
                thickness={thickness}
                pattern={(x, y, size) => <MoneyIcon x={x} y={y} size={size} color={MONEY_COLOR} />}
                label={`$${thickness > 80 ? formatLong(d.totalUsd) : formatShort(d.totalUsd)}`}
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
        const barWidth = scaleX(d.toUsd) - scaleX(d.fromUsd) - 2 * BAR_PADDING;
        const rows = Math.floor(barWidth / ICON_SIZE);
        const thickness = rows * ICON_SIZE;
        return (
            <PatternBar
                x={scaleX((d.fromUsd + d.toUsd) / 2)}
                y={baseY + BAR_PADDING + BAR_LABEL_SIZE / 2}
                direction="to-bottom"
                rows={rows}
                count={Math.round(d.people / PEOPLE_PER_ICON)}
                thickness={thickness}
                pattern={(x, y, size) => <PersonIcon x={x} y={y} size={size} color={getPeopleColor(d)} />}
                label={`${thickness > 80 ? formatLong(d.people) : formatShort(d.people)}`}
                labelSize={BAR_LABEL_SIZE}
            />
        );
    });

    const taxesUsd = avgSalaryUsd * data.workingPeople * (data.taxPercent + data.socialTaxPercent) / 100;
    const incomeLabel = `$${formatShort(avgSalaryUsd)} × ${formatShort(data.workingPeople)} × (1 − ${data.taxPercent}%) + $${formatShort(avgPensionUsd)} × ${formatShort(data.retiredPeople)} = $${formatLong(allUsd)} (ЗП и пенсии)`;
    const taxesLabel = `(налог и ФСЗН) $${formatShort(avgSalaryUsd)} × ${formatShort(data.workingPeople)} × (${data.taxPercent}% + ${data.socialTaxPercent}%) = $${formatLong(taxesUsd)}`;

    const TOTALS_HEIGHT = height / 7;
    const TOTALS_ROWS = Math.floor(TOTALS_HEIGHT / ICON_SIZE);
    const TOTALS_PER_ICON = Math.max(allUsd, taxesUsd) / (TOTALS_ROWS ** 2);
    const incomeBar = <PatternBar
        x={width / 2}
        y={height - PADDING - TOTALS_HEIGHT / 2}
        direction="to-left"
        rows={TOTALS_ROWS}
        count={Math.round(allUsd / TOTALS_PER_ICON)}
        thickness={TOTALS_ROWS * ICON_SIZE}
        pattern={(x, y, size) => <MoneyIcon x={x} y={y} size={size} color={MONEY_COLOR} />}
        label={incomeLabel}
        labelSize={BAR_LABEL_SIZE}
    />;
    const taxesBar = <PatternBar
        x={width / 2}
        y={height - PADDING - TOTALS_HEIGHT / 2}
        direction="to-right"
        rows={TOTALS_ROWS}
        count={Math.round(taxesUsd / TOTALS_PER_ICON)}
        thickness={TOTALS_ROWS * ICON_SIZE}
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
