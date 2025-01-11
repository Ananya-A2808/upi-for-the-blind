if (!window.UPIService) {
    throw new Error('UPIService not loaded. Make sure to include upi.js before myaccount.js');
}

class MyAccountManager extends PageManager {
    constructor() {
        super('my account');
        this.init();
        this.setupSpecificGuides();
    }

    setupSpecificGuides() {
        // Add specific guides for balance
        const balanceElement = document.querySelector('.balance');
        if (balanceElement) {
            balanceElement.addEventListener('mouseenter', () => {
                const balance = document.getElementById('currentBalance').textContent;
                this.voiceGuide.speak(`Your current balance is ${balance}`);
            });
        }

        // Add specific guides for UPI ID
        const upiIdElement = document.querySelector('.upi-id');
        if (upiIdElement) {
            upiIdElement.addEventListener('mouseenter', () => {
                const upiId = document.getElementById('userUpiId').textContent;
                this.voiceGuide.speak(`Your UPI ID is ${upiId}`);
            });
        }

        // Add specific guides for quick actions
        const quickActions = document.querySelectorAll('.action-card');
        quickActions.forEach(action => {
            action.addEventListener('mouseenter', () => {
                const actionText = action.querySelector('span').textContent;
                this.voiceGuide.speak(`${actionText} button. Click to proceed.`);
            });
        });
    }

    async init() {
        try {
            if (!this.checkAuth()) {
                this.voiceGuide.speak("Please login to continue");
                window.location.href = './login.html';
                return;
            }

            this.upiService = new UPIService();
            await this.loadData();

        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return token && userId;
    }

    async loadData() {
        try {
            this.showLoading('Loading your account details');

            const [profile, balance] = await Promise.all([
                this.upiService.getUserProfile(),
                this.upiService.getBalance()
            ]);

            if (profile) {
                document.getElementById('userUpiId').textContent = profile.upiId || 'Not Available';
                this.voiceGuide.speak(`Welcome back ${profile.name}`);
            }

            if (balance) {
                const balanceText = `₹${balance.balance.toFixed(2)}`;
                document.getElementById('currentBalance').textContent = balanceText;
                this.voiceGuide.speak(`Your current balance is ${balanceText}`);
            }

        } catch (error) {
            console.error('Data loading error:', error);
            this.handleError(error);
        } finally {
            this.hideLoading();
        }
    }

    handleError(error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            this.voiceGuide.speak("Session expired. Please login again");
            window.location.href = './login.html';
            return;
        }

        // Show cached data
        const upiId = localStorage.getItem('upiId');
        const balance = localStorage.getItem('lastBalance');

        if (upiId) {
            document.getElementById('userUpiId').textContent = upiId;
        }
        if (balance) {
            const balanceText = `₹${parseFloat(balance).toFixed(2)}`;
            document.getElementById('currentBalance').textContent = balanceText;
            this.voiceGuide.speak(`Using cached data. Your last known balance was ${balanceText}`);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.myAccount = new MyAccountManager();
    } catch (error) {
        console.error('Failed to initialize MyAccountManager:', error);
    }
}); 