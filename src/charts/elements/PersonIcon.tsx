import { html } from 'malevic';
import Icon from './Icon';

interface PersonIconProps {
    x: number;
    y: number;
    size: number;
    color: string;
}

const PERSON_BODY_PATH = 'M0,0 q0.4,0 0.4,0.4 v0.1 h-0.8 v-0.1 q0,-0.4 0.4,-0.4 Z';
const PERSON_HEAD_PATH = 'M-0.2,-0.3 a0.2,0.2 0 1 1 0.4,0 a0.2,0.2 0 1 1 -0.4,0 Z';

export default function PersonIcon(props: PersonIconProps) {
    return (
        <Icon {...props}>
            <path fill={props.color} d={PERSON_BODY_PATH} />
            <path fill={props.color} d={PERSON_HEAD_PATH} opacity="0.55" />
        </Icon>
    );
}
