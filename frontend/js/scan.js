class ScanManager extends PageManager {
    constructor() {
        super('QR scanner');
        this.setupScanner();
    }

    setupScanner() {
        this.voiceGuide.speak('Point your camera at a QR code to scan');
        // ... scanner setup code ...
    }

    handleScan(result) {
        this.voiceGuide.speak('QR code detected');
        // ... scan handling code ...
    }
} 