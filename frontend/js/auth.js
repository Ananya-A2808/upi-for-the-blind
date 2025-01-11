class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/auth';
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store email for OTP verification
            localStorage.setItem('tempEmail', email);
            return data;

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async verifyOTP(email, otp) {
        try {
            console.log('Sending OTP verification:', { email, otp });
            
            const response = await fetch(`${this.baseUrl}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    otp: otp.toString() // Ensure OTP is sent as string
                })
            });

            const data = await response.json();
            console.log('OTP verification response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            // Clear any old data
            localStorage.clear();

            // Store new auth data
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.name);
                localStorage.setItem('upiId', data.upiId);
                localStorage.setItem('email', email);
            } else {
                throw new Error('No token received');
            }

            return data;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}

// Create global instance
window.authService = new AuthService(); 