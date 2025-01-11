class PaymentHandler {
    constructor() {
        this.qrScanner = new AccessibleQRScanner();
        this.voiceAuth = new VoiceAuthenticator();
        this.voiceGuide = new VoiceGuide();
    }

    async startPayment() {
        try {
            // 1. Scan QR Code
            await this.qrScanner.startScanning();

            // 2. Confirm Details
            const confirmed = await this.confirmPaymentDetails();
            if (!confirmed) {
                this.voiceGuide.speak("Payment cancelled.");
                return;
            }

            // 3. Voice Authentication
            const authenticated = await this.voiceAuth.startAuthentication();
            if (!authenticated) {
                return;
            }

            // 4. Process Payment
            await this.processPayment();

        } catch (error) {
            console.error('Payment error:', error);
            this.voiceGuide.speak("Payment failed. Please try again.");
        }
    }

    async confirmPaymentDetails() {
        return new Promise(resolve => {
            this.voiceGuide.speak("Do you want to proceed with the payment? Say yes or no.");
            
            const recognition = new webkitSpeechRecognition();
            recognition.onresult = (event) => {
                const response = event.results[0][0].transcript.toLowerCase();
                resolve(response.includes('yes'));
            };
            recognition.start();
        });
    }

    async processPayment() {
        try {
            const response = await fetch('/api/upi/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    merchantId: this.currentMerchant.id,
                    amount: this.currentAmount
                })
            });

            const result = await response.json();
            if (result.success) {
                this.voiceGuide.speak("Payment successful. Thank you for using our service.");
            } else {
                this.voiceGuide.speak("Payment failed. Please try again.");
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.voiceGuide.speak("Error processing payment. Please try again.");
        }
    }
} 