/* eslint-disable no-restricted-globals */
self.onmessage = function (e) {
    const { code, input } = e.data;

    const logs = [];
    const customConsole = {
        log: (...args) => {
            logs.push({ type: 'log', content: args.join(' ') });
        },
        error: (...args) => {
            logs.push({ type: 'error', content: args.join(' ') });
        },
        warn: (...args) => {
            logs.push({ type: 'warn', content: args.join(' ') });
        }
    };

    try {
        // Basic infinite loop protection could be added here by transpiling, 
        // but for now we rely on the main thread terminating this worker if it times out.

        // Create a safe-ish environment
        // We mock window/document to avoid immediate crashes if code assumes them, 
        // but they are obviously limited in a worker.
        const mockWindow = {
            alert: customConsole.log,
            prompt: () => '',
            confirm: () => true,
            console: customConsole
        };

        // Wrap code
        // We use 'self' to access worker scope, but we shadow it for the user code if possible
        // or just let them run.
        const run = new Function('console', 'window', 'alert', code);

        run(customConsole, mockWindow, mockWindow.alert);

        self.postMessage({ success: true, logs });
    } catch (err) {
        self.postMessage({
            success: false,
            logs: [...logs, { type: 'error', content: err.toString() }]
        });
    }
};
