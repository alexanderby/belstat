import { html } from 'malevic';
import Icon from './Icon';

interface MoneyIconProps {
    x: number;
    y: number;
    size: number;
    color: string;
}

const MONEY_ICON_PATH = [
    'M0.5,-0.3 h-1 v0.6 h1 Z',
    'M-0.4,-0.2 h0.8 v0.4 h-0.8 Z',
    'M-0.15,0 a0.15,0.2 0 1 0 0.3,0 a0.15,0.2 0 1 0 -0.3,0 Z',
].join(' ');
const MONEY_INNER_PATH = 'M-0.4,-0.2 h0.8 v0.4 h-0.8 Z';

export default function MoneyIcon(props: MoneyIconProps) {
    return (
        <Icon {...props}>
            <path fill={props.color} d={MONEY_INNER_PATH} opacity="0.5" />
            <path fill={props.color} d={MONEY_ICON_PATH} />
        </Icon>
    );
}
