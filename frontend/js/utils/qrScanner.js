class AccessibleQRScanner {
    constructor() {
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.scanner = new ZXing.BrowserQRCodeReader();
        this.isScanning = false;
        this.voiceGuide = new VoiceGuide();
    }

    async startScanning() {
        try {
            this.isScanning = true;
            this.voiceGuide.speak("QR Scanner activated. Point your camera at the QR code.");
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            this.video.srcObject = stream;
            
            // Start continuous scanning
            this.scanLoop();
            
            // Start position guidance
            this.startPositionGuidance();
        } catch (error) {
            this.voiceGuide.speak("Camera access denied. Please enable camera permissions.");
            console.error('Camera error:', error);
        }
    }

    async scanLoop() {
        while (this.isScanning) {
            try {
                const result = await this.scanner.decodeOnce(this.video);
                await this.handleQRCode(result);
            } catch (error) {
                // Continue scanning
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    startPositionGuidance() {
        // Use ML Kit for object detection to guide user
        setInterval(() => {
            if (!this.isScanning) return;
            
            const position = this.analyzePosition();
            this.providePositionGuidance(position);
        }, 1000);
    }

    analyzePosition() {
        // Analyze video frame for QR code position
        const context = this.canvas.getContext('2d');
        context.drawImage(this.video, 0, 0);
        // Return position analysis
        return {
            isVisible: true/false,
            direction: 'left'/'right'/'up'/'down',
            distance: 'too far'/'too close'/'good'
        };
    }

    providePositionGuidance(position) {
        if (!position.isVisible) {
            this.voiceGuide.speak("No QR code detected. Slowly move your phone around.");
            return;
        }

        let guidance = [];
        if (position.direction) {
            guidance.push(`Move ${position.direction}`);
        }
        if (position.distance !== 'good') {
            guidance.push(`Move ${position.distance === 'too far' ? 'closer' : 'farther'}`);
        }

        if (guidance.length > 0) {
            this.voiceGuide.speak(guidance.join('. '));
        }
    }

    async handleQRCode(result) {
        try {
            // Parse QR data
            const qrData = JSON.parse(result.text);
            
            // Validate QR format
            if (!this.isValidUPIQR(qrData)) {
                this.voiceGuide.speak("Invalid UPI QR code. Please try a different one.");
                return;
            }

            // Stop scanning
            this.stopScanning();

            // Announce details
            this.voiceGuide.speak(`QR code detected. Merchant: ${qrData.name}. Amount: ${screenReader.formatCurrency(qrData.amount)}`);

            // Validate with backend
            const validation = await this.validateQRCode(qrData);
            if (validation.isValid) {
                await this.proceedToPayment(qrData);
            } else {
                this.voiceGuide.speak("Invalid merchant QR code. Please try again.");
            }
        } catch (error) {
            console.error('QR handling error:', error);
            this.voiceGuide.speak("Error processing QR code. Please try again.");
        }
    }

    stopScanning() {
        this.isScanning = false;
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    async validateQRCode(qrData) {
        const response = await fetch('/api/upi/validate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(qrData)
        });
        return await response.json();
    }

    async proceedToPayment(qrData) {
        // Show payment confirmation screen
        document.getElementById('paymentConfirmation').hidden = false;
        
        // Update payment details
        document.getElementById('merchantName').textContent = qrData.name;
        document.getElementById('paymentAmount').textContent = screenReader.formatCurrency(qrData.amount);
        
        // Focus on confirm button for accessibility
        document.getElementById('confirmPayment').focus();
    }
} 