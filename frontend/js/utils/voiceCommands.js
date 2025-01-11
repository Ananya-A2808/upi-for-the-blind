class VoiceCommandHandler {
    constructor() {
        this.commands = {};
        this.recognition = null;
        this.isListening = false;
        this.setupRecognition();
    }

    setupRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.handleCommand(command);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    startListening() {
        if (!this.recognition) return;
        this.isListening = true;
        this.recognition.start();
    }

    stopListening() {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
    }

    addCommands(commands) {
        this.commands = { ...this.commands, ...commands };
    }

    handleCommand(command) {
        console.log('Received command:', command);
        for (const [key, handler] of Object.entries(this.commands)) {
            if (command.includes(key)) {
                handler();
                break;
            }
        }
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

// Create global instance
window.voiceCommands = new VoiceCommandHandler(); 