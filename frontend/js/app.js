// Initialize only AuthService for login/signup pages
const authService = new AuthService();

// Notification function
function showNotification(message, type = 'error') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('loginEmail');
                const password = document.getElementById('loginPassword');

                // Basic validation
                if (!email.value) {
                    email.classList.add('input-error');
                    showNotification('Email is required');
                    return;
                }
                if (!password.value) {
                    password.classList.add('input-error');
                    showNotification('Password is required');
                    return;
                }

                // Show loading state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';

                const response = await authService.login(email.value, password.value);
                console.log('Login response:', response);

                if (response.message === 'OTP sent to email') {
                    // Store email for OTP verification
                    document.getElementById('otpEmail').value = email.value;
                    
                    // Show OTP form
                    showNotification('OTP sent to your email', 'success');
                    const twoFactorSection = document.getElementById('twoFactorForm');
                    twoFactorSection.hidden = false;
                    document.getElementById('otpCode').focus();
                    
                    // Hide login form
                    loginForm.hidden = true;
                } else {
                    showNotification(response.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification(error.message || 'Login failed');
            } finally {
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        });

        // Add input event listeners to remove error state
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
            });
        });
    }

    // Handle OTP Form
    const twoFactorForm = document.getElementById('twoFactorForm');
    if (twoFactorForm) {
        twoFactorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('otpEmail').value;
                const otp = document.getElementById('otpCode').value;

                if (!email || !otp) {
                    showNotification('Both email and OTP are required');
                    return;
                }

                // Show loading state
                const submitButton = twoFactorForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Verifying...';

                const response = await authService.verifyOTP(email, otp);
                
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect after successful verification
                setTimeout(() => {
                    window.location.href = './myaccount.html';
                }, 1000);
                
            } catch (error) {
                console.error('OTP verification error:', error);
                showNotification(error.message || 'OTP verification failed');
            } finally {
                const submitButton = twoFactorForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Verify OTP';
            }
        });
    }

    // Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const name = document.getElementById('signupName');
                const email = document.getElementById('signupEmail');
                const password = document.getElementById('signupPassword');

                // Basic validation
                if (!name.value) {
                    name.classList.add('input-error');
                    showNotification('Name is required');
                    return;
                }
                if (!email.value) {
                    email.classList.add('input-error');
                    showNotification('Email is required');
                    return;
                }
                if (!password.value) {
                    password.classList.add('input-error');
                    showNotification('Password is required');
                    return;
                }
                if (password.value.length < 6) {
                    password.classList.add('input-error');
                    showNotification('Password must be at least 6 characters');
                    return;
                }

                const submitButton = signupForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Creating Account...';

                const response = await authService.register(name.value, email.value, password.value);
                console.log('Registration response:', response);

                if (response.message === 'Registration successful') {
                    showNotification('Account created successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 2000);
                } else {
                    showNotification(response.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification(error.message || 'Registration failed');
            } finally {
                const submitButton = signupForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }
        });
    }
});

// Helper function for screen reader announcements
function announceMessage(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('role', 'status');
    announcer.classList.add('sr-only');
    document.body.appendChild(announcer);
    
    setTimeout(() => {
        announcer.textContent = message;
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }, 100);
}

// Add global error handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('An unexpected error occurred. Please try again.');
});

// Add network status monitoring
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', function() {
    showNotification('No internet connection', 'error');
}); 