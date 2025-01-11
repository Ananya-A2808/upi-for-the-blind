class SendMoneyManager extends PageManager {
    constructor() {
        super('send money');
        this.setupForm();
    }

    setupForm() {
        const form = document.getElementById('sendMoneyForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Add specific hover guides for amount field
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('Enter amount to send');
            });
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.showLoading('Processing payment...');
        // ... rest of submit handling code ...
    }
} 