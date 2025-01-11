class HomeManager extends PageManager {
    constructor() {
        super('home');
        this.setupHomeGuides();
    }

    setupHomeGuides() {
        // Guide for welcome section
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('Welcome to UPI App. A secure way to manage your payments');
            });
        }

        // Guide for login button
        const loginButton = document.querySelector('.primary-btn');
        if (loginButton) {
            loginButton.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('Click to login to your account');
            });
        }

        // Guide for signup button
        const signupButton = document.querySelector('.secondary-btn');
        if (signupButton) {
            signupButton.addEventListener('mouseenter', () => {
                this.voiceGuide.speak('New user? Click to create an account');
            });
        }

        // Guide for features list
        const features = document.querySelectorAll('.features-list li');
        features.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                this.voiceGuide.speak(feature.textContent);
            });
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new HomeManager();
}); 