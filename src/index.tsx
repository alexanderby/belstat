import { html, render } from 'malevic';
import Body from './Body';
import data from './data/belstat';

function renderBody() {
    render(document.body, (
        <Body title="Hello, World!" data={data} />
    ));
}

function throttle(callback) {
    let frameId = null;
    let shouldCall = false;
    return function throttled() {
        if (frameId) {
            shouldCall = true;
            return;
        }
        shouldCall = false;
        callback();
        frameId = requestAnimationFrame(() => {
            frameId = null;
            if (shouldCall) {
                callback();
            }
        });
    };
}

window.onload = renderBody;
window.addEventListener('resize', throttle(renderBody));
