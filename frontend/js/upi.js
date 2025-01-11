class UPIService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/upi';
    }

    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async transfer(receiverUpi, amount, description) {
        try {
            console.log('Sending transfer request:', { receiverUpi, amount, description });
            const response = await fetch(`${this.baseUrl}/transfer`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    receiverUpiId: receiverUpi,
                    amount: parseFloat(amount),
                    description 
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Transfer failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Transfer error:', error);
            throw error;
        }
    }

    async getTransactions() {
        try {
            const response = await fetch(`${this.baseUrl}/transactions`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transactions');
            }

            return await response.json();
        } catch (error) {
            console.error('Get transactions error:', error);
            throw error;
        }
    }

    async getBalance() {
        try {
            const response = await fetch(`${this.baseUrl}/balance`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch balance');
            }

            return await response.json();
        } catch (error) {
            console.error('Get balance error:', error);
            throw error;
        }
    }
} 