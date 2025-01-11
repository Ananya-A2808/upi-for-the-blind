class ErrorBoundary {
    static init() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (window.voiceGuide) {
                window.voiceGuide.announceError('An unexpected error occurred');
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (window.voiceGuide) {
                window.voiceGuide.announceError('An unexpected error occurred');
            }
        });
    }
}

ErrorBoundary.init(); 