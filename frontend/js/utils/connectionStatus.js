class ConnectionStatus {
    static init() {
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
            if (window.voiceGuide) {
                window.voiceGuide.announceSuccess('Connection restored');
            }
        });

        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
            if (window.voiceGuide) {
                window.voiceGuide.announceError('Connection lost. Using offline data.');
            }
        });
    }
}

ConnectionStatus.init(); 