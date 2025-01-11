class UPIService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/upi';
    }

    getHeaders() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No auth token found');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/test`);
            return response.ok;
        } catch (error) {
            console.error('Server check failed:', error);
            return false;
        }
    }

    async makeRequest(endpoint, options = {}) {
        try {
            // Check if server is running
            const isServerRunning = await this.checkServerStatus();
            if (!isServerRunning) {
                throw new Error('Server is not running');
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache successful responses
            this.cacheResponse(endpoint, data);
            
            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            
            // Return cached data if available
            const cachedData = this.getCachedData(endpoint);
            if (cachedData) {
                console.log('Using cached data for:', endpoint);
                return cachedData;
            }
            
            throw error;
        }
    }

    cacheResponse(endpoint, data) {
        switch (endpoint) {
            case '/profile':
                localStorage.setItem('cachedProfile', JSON.stringify(data));
                break;
            case '/balance':
                localStorage.setItem('cachedBalance', JSON.stringify(data));
                break;
        }
    }

    getCachedData(endpoint) {
        switch (endpoint) {
            case '/profile':
                const profile = localStorage.getItem('cachedProfile');
                return profile ? JSON.parse(profile) : null;
            case '/balance':
                const balance = localStorage.getItem('cachedBalance');
                return balance ? JSON.parse(balance) : null;
            default:
                return null;
        }
    }

    async getUserProfile() {
        return this.makeRequest('/profile');
    }

    async getBalance() {
        return this.makeRequest('/balance');
    }
}

window.UPIService = UPIService; 