class PageManager {
    constructor(pageName) {
        if (!window.voiceGuide) {
            throw new Error('VoiceGuide not loaded');
        }
        
        this.voiceGuide = window.voiceGuide;
        this.pageName = pageName;
        this.setupHoverGuides();
        this.setupTouchGuides();
        this.voiceGuide.announcePageLoad(pageName);
    }

    setupHoverGuides() {
        // Common elements across pages
        this.setupButtonGuides();
        this.setupInputGuides();
        this.setupNavigationGuides();
        this.setupCardGuides();
    }

    setupButtonGuides() {
        document.querySelectorAll('button, .btn, .action-card').forEach(button => {
            button.addEventListener('mouseenter', () => {
                const text = button.textContent.trim();
                this.voiceGuide.speak(`${text} button. Click to proceed.`);
            });
        });
    }

    setupInputGuides() {
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('focus', () => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const labelText = label ? label.textContent : input.placeholder;
                this.voiceGuide.speak(`${labelText} input field. Type to enter.`);
            });
        });
    }

    setupNavigationGuides() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const text = item.querySelector('span').textContent;
                this.voiceGuide.speak(`${text} navigation link`);
            });
        });
    }

    setupCardGuides() {
        document.querySelectorAll('.card, .profile-card, .transaction-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const title = card.querySelector('h2, h3, .title')?.textContent;
                if (title) {
                    this.voiceGuide.speak(`${title} section`);
                }
            });
        });
    }

    setupTouchGuides() {
        const touchStartTime = {};
        const TOUCH_DURATION = 500;

        document.querySelectorAll('button, .btn, .nav-item, input, .card').forEach(element => {
            element.addEventListener('touchstart', () => {
                touchStartTime[element] = Date.now();
            });

            element.addEventListener('touchend', () => {
                const duration = Date.now() - (touchStartTime[element] || 0);
                if (duration >= TOUCH_DURATION) {
                    this.handleLongTouch(element);
                }
            });
        });
    }

    handleLongTouch(element) {
        if (element.tagName === 'INPUT') {
            const label = document.querySelector(`label[for="${element.id}"]`);
            this.voiceGuide.speak(`${label?.textContent || element.placeholder} input field`);
        } else {
            const text = element.textContent.trim();
            this.voiceGuide.speak(`${text}. Double tap to activate.`);
        }
    }

    showLoading(message = 'Loading...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.hidden = false;
            this.voiceGuide.speak(message);
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.hidden = true;
        }
    }

    handleError(error) {
        console.error('Error:', error);
        this.voiceGuide.announceError(error.message || 'An error occurred');
    }
}

window.PageManager = PageManager; 