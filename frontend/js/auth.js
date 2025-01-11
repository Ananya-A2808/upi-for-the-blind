class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/auth';
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            if (!navigator.onLine) {
                throw new Error('No internet connection');
            }
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw new Error(error.message || 'Registration failed');
        }
    }

    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${this.baseUrl}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, otp })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }
            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw new Error(error.message || 'OTP verification failed');
        }
    }
} 