class LoginManager extends PageManager {
    constructor() {
        super('login');
        this.authService = new AuthService();
        this.setupLoginGuides();
        this.setupFormHandlers();
    }

    setupLoginGuides() {
        // Guide for email input
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
            emailInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Enter your email address');
            });
        }

        // Guide for password input
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Enter your password');
            });
        }

        // Guide for OTP input
        const otpInput = document.getElementById('otpCode');
        if (otpInput) {
            otpInput.addEventListener('focus', () => {
                this.voiceGuide.speak('Enter the 6-digit OTP sent to your email');
            });
        }
    }

    setupFormHandlers() {
        const loginForm = document.getElementById('loginForm');
        const twoFactorForm = document.getElementById('twoFactorForm');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitButton = loginForm.querySelector('button[type="submit"]');
                
                try {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Logging in...';

                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    this.voiceGuide.speak('Verifying your credentials');
                    const response = await this.authService.login(email, password);
                    console.log('Login response:', response);

                    if (response.message === 'OTP sent to email') {
                        // Store email for OTP verification
                        document.getElementById('otpEmail').value = email;
                        
                        // Show OTP form and hide login form
                        loginForm.style.display = 'none';
                        twoFactorForm.style.display = 'block';
                        twoFactorForm.hidden = false;
                        
                        this.voiceGuide.speak('OTP has been sent to your email. Please enter the verification code');
                        document.getElementById('otpCode').focus();
                    }

                } catch (error) {
                    console.error('Login error:', error);
                    this.voiceGuide.speak(error.message || 'Login failed');
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                }
            });
        }

        if (twoFactorForm) {
            twoFactorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitButton = twoFactorForm.querySelector('button[type="submit"]');
                
                try {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Verifying...';

                    const email = document.getElementById('otpEmail').value;
                    const otp = document.getElementById('otpCode').value.trim();

                    if (!email || !otp) {
                        throw new Error('Email and OTP are required');
                    }

                    if (!/^\d{6}$/.test(otp)) {
                        throw new Error('OTP must be 6 digits');
                    }

                    this.voiceGuide.speak('Verifying OTP');
                    console.log('Verifying OTP for:', email, otp);

                    const response = await this.authService.verifyOTP(email, otp);
                    console.log('OTP verification response:', response);

                    if (response.token) {
                        this.voiceGuide.speak('Login successful! Redirecting to your account');
                        
                        // Short delay before redirect to allow voice guide to finish
                        setTimeout(() => {
                            window.location.href = './myaccount.html';
                        }, 1500);
                    } else {
                        throw new Error('Invalid response from server');
                    }

                } catch (error) {
                    console.error('OTP verification error:', error);
                    this.voiceGuide.speak(error.message || 'OTP verification failed');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Verify OTP';
                }
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.loginManager = new LoginManager();
        console.log('LoginManager initialized');
    } catch (error) {
        console.error('Failed to initialize LoginManager:', error);
    }
}); 