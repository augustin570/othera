export async function fetchJson ( url, options = {} ) {
    return fetch( url, options )
    .then( ( response ) => response.json() )
    .then( ( data ) => { return data } );
};

export function getParent($element, classSelector) {
    while ($element !== null && (! $element.classList.contains(classSelector))) {
        $element = $element.parentNode;
        if ($element.tagName.toLowerCase() === 'html') return null;
    }
    return $element;
};

export function throttle(func, timeFrame) {
    let lastTime = 0;
    return function (...args) {
        const now = new Date();
        if (now - lastTime >= timeFrame) {
            func(...args);
            lastTime = now;
        }
    };
};

export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};