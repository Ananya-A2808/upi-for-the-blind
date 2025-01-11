class VoiceAuthenticator {
    constructor() {
        this.audioContext = new AudioContext();
        this.recorder = null;
        this.voiceGuide = new VoiceGuide();
    }

    async startAuthentication() {
        try {
            this.voiceGuide.speak("Please speak your authentication phrase when ready.");
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            
            let audioChunks = [];
            this.recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            this.recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks);
                await this.verifyVoice(audioBlob);
            };

            // Record for 3 seconds
            this.recorder.start();
            setTimeout(() => this.recorder.stop(), 3000);
        } catch (error) {
            console.error('Voice auth error:', error);
            this.voiceGuide.speak("Error accessing microphone. Please try again.");
        }
    }

    async verifyVoice(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const response = await fetch('/api/auth/verify-voice', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.verified) {
                this.voiceGuide.speak("Voice verified. Processing payment.");
                return true;
            } else {
                this.voiceGuide.speak("Voice not recognized. Please try again.");
                return false;
            }
        } catch (error) {
            console.error('Voice verification error:', error);
            this.voiceGuide.speak("Error verifying voice. Please try again.");
            return false;
        }
    }
} 