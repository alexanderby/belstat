import { html, render } from 'malevic';
import ResourcesByPerson from './charts/ResourcesByPerson';
import { BelstatData } from './definitions';

interface BodyProps {
    title: string;
    data: BelstatData;
}

declare var module;
const isNodeJS = typeof module !== 'undefined' && module.exports;

export default function Body({ title, data }: BodyProps) {
    if (isNodeJS) {
        return (
            <main>
                <ResourcesByPerson width={1200} height={500} data={data} />
            </main>
        );
    }
    return (
        <main>
            {(domNode: HTMLElement) => {
                const rect = domNode.getBoundingClientRect();
                const width = rect.width;
                const height = width / 12 * 5;
                return <ResourcesByPerson width={width} height={height} data={data} />;
            }}
        </main>
    );
}
