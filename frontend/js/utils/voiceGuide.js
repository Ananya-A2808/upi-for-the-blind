class VoiceGuide {
    constructor() {
        this.synth = window.speechSynthesis;
        this.speaking = false;
        this.queue = [];
        
        // Test the voice guide
        console.log('VoiceGuide initialized');
        this.speak('Voice guide ready');
    }

    speak(text, priority = false) {
        console.log('Speaking:', text); // Debug log

        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        if (this.speaking && !priority) {
            this.queue.push(text);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            console.log('Started speaking:', text);
            this.speaking = true;
        };

        utterance.onend = () => {
            console.log('Finished speaking:', text);
            this.speaking = false;
            if (this.queue.length > 0) {
                const nextText = this.queue.shift();
                this.speak(nextText);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
        };

        this.synth.speak(utterance);
    }

    announcePageLoad(pageName) {
        this.speak(`Welcome to ${pageName} page`);
    }

    announceError(error) {
        this.speak(error, true);
    }

    announceSuccess(message) {
        this.speak(message, true);
    }
}

// Create global instance
window.voiceGuide = new VoiceGuide(); 