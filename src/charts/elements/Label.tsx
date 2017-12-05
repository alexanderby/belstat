import { html } from 'malevic';

interface LabelProps {
    x: number;
    y: number;
    size?: number;
    halign: 'left' | 'center' | 'right';
    valign: 'top' | 'center' | 'bottom';
    class?: string;
}

export default function Label({ x, y, size, halign, valign, class: cls }: LabelProps, text: string) {
    const anchor = {
        'left': 'end',
        'center': 'middle',
        'right': 'start'
    }[halign];
    const dy = {
        'top': null,
        'center': '0.32em',
        'bottom': '1em'
    }[valign];

    return (
        <text class={cls} x={x} y={y} text-anchor={anchor} dy={dy || ''} font-size={size}>
            {text}
        </text>
    );
}
