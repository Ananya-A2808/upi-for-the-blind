class SignupManager extends PageManager {
    constructor() {
        super('signup');
        this.setupSignupGuides();
    }

    setupSignupGuides() {
        // Guide for name input
        const nameInput = document.getElementById('signupName');
        if (nameInput) {
            nameInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Enter your full name');
            });
        }

        // Guide for email input
        const emailInput = document.getElementById('signupEmail');
        if (emailInput) {
            emailInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Enter your email address');
            });
        }

        // Guide for password input
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Create a strong password. Must be at least 6 characters');
            });
        }

        // Guide for signup button
        const signupButton = document.querySelector('button[type="submit"]');
        if (signupButton) {
            signupButton.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('Click to create your account');
            });
        }

        // Guide for login link
        const loginLink = document.querySelector('.form-footer a');
        if (loginLink) {
            loginLink.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('Already have an account? Click to login');
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new SignupManager();
}); 