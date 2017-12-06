import { html, NodeDeclaration } from 'malevic';
import Label from './Label';

interface PatternBarProps {
    x: number;
    y: number;
    thickness: number;
    direction: 'to-top' | 'to-bottom' | 'to-left' | 'to-right';
    count: number;
    rows: number;
    pattern: (x, y, size) => NodeDeclaration;
    label?: string;
    labelSize?: number;
}

const PADDING = 0.1;

export default function PatternBar(props: PatternBarProps) {
    const columns = [0];
    for (let i = 0; i < props.count; i++) {
        if (columns[columns.length - 1] === props.rows) {
            columns.push(0);
        }
        columns[columns.length - 1]++;
    }

    const cellSize = props.thickness / props.rows;
    const cellInnerSize = cellSize * (1 - PADDING * 2);

    const cells: NodeDeclaration[] = [];
    let x, y, x0, y0;
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns[i]; j++) {
            x0 = -props.thickness / 2 + cellSize / 2 + cellSize * j + (i === columns.length - 1 && columns[i] < props.rows ? (props.rows - columns[i]) * cellSize / 2 : 0);
            y0 = cellSize / 2 + cellSize * i;
            switch (props.direction) {
                case 'to-top':
                    x = x0;
                    y = -y0;
                    break;
                case 'to-bottom':
                    x = x0;
                    y = y0;
                    break;
                case 'to-left':
                    x = -y0;
                    y = x0;
                    break;
                case 'to-right':
                    x = y0;
                    y = x0;
                    break;
            }
            cells.push(props.pattern(x, y, cellInnerSize));
        }
    }

    let label: NodeDeclaration = null;
    if (props.label) {
        const halign = {
            'to-left': 'left',
            'to-right': 'right',
            'to-top': 'center',
            'to-bottom': 'center'
        }[props.direction] as 'left' | 'center' | 'right';
        const valign = {
            'to-left': 'center',
            'to-right': 'center',
            'to-top': 'top',
            'to-bottom': 'bottom'
        }[props.direction] as 'top' | 'center' | 'bottom';
        const move = cellSize * columns.length + cellSize * PADDING;
        const tx = {
            'to-left': -move,
            'to-right': move,
            'to-top': 0,
            'to-bottom': 0
        }[props.direction];
        const ty = {
            'to-left': 0,
            'to-right': 0,
            'to-top': -move,
            'to-bottom': move
        }[props.direction];
        label = (
            <Label x={tx} y={ty} halign={halign} valign={valign} size={props.labelSize}>
                {props.label}
            </Label>
        );
    }

    return (
        <g transform={`translate(${props.x}, ${props.y})`}>
            {cells}
            {label}
        </g>
    );
}
