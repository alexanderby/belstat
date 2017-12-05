import { html } from 'malevic';

interface IconProps {
    x: number;
    y: number;
    size: number;
}

export default function Icon({ x, y, size }: IconProps, ...children) {
    return (
        <g transform={`translate(${x}, ${y}) scale(${size})`}>
            {children}
        </g>
    );
}
