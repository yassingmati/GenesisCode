
// Suppress benign ResizeObserver errors directly at the top of the bundle
const RO_ERRORS = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded',
    'Script error.'
];

// Suppress console.error
const originalError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && RO_ERRORS.some(msg => args[0].includes(msg))) {
        return;
    }
    originalError.call(console, ...args);
};

// Suppress window errors (including the overlay)
window.addEventListener('error', (e) => {
    if (RO_ERRORS.some(msg => e.message && typeof e.message === 'string' && (e.message.includes(msg) || e.message === 'Script error.'))) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
}, true); // Use capture to catch it before React overlay

// Suppress window errors via global handler (nuclear option)
const originalOnError = window.onerror;
window.onerror = function (msg, url, line, col, error) {
    if (RO_ERRORS.some(m => typeof msg === 'string' && msg.includes(m))) {
        return true; // Return true to suppress the error
    }
    if (originalOnError) {
        return originalOnError(msg, url, line, col, error);
    }
    return false;
};
