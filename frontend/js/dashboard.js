// Add initialization for UPI service
const upiService = new UPIService();

// Add announceMessage function
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

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = './login.html';
        return;
    }

    try {
        await loadInitialData();
        setupEventListeners();
        startAutoRefresh();
    } catch (error) {
        handleError(error);
    }
});

// Add setupEventListeners function
function setupEventListeners() {
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const receiverUpi = document.getElementById('receiverUpi').value;
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;

            try {
                const response = await upiService.transfer(receiverUpi, amount, description);
                if (response.message === 'Transfer successful') {
                    announceMessage('Money sent successfully');
                    await loadBalance();
                    await loadTransactions();
                    transferForm.reset();
                }
            } catch (error) {
                announceMessage('Transfer failed: ' + error.message);
            }
        });
    }

    // Add refresh button listener
    const refreshButton = document.querySelector('.refresh-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
            try {
                await loadBalance();
                await loadTransactions();
                announceMessage('Data refreshed successfully');
            } catch (error) {
                handleError(error);
            }
        });
    }

    // Add logout button listener
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}

// Add startAutoRefresh function
function startAutoRefresh() {
    setInterval(async () => {
        try {
            await loadBalance();
            await loadTransactions();
        } catch (error) {
            console.error('Auto refresh error:', error);
        }
    }, 30000); // Refresh every 30 seconds
}

async function loadInitialData() {
    try {
        await Promise.all([
            loadBalance(),
            loadTransactions()
        ]);
    } catch (error) {
        throw new Error('Failed to load initial data: ' + error.message);
    }
}

function handleError(error) {
    console.error('Dashboard error:', error);
    if (error.message.includes('unauthorized')) {
        localStorage.clear();
        window.location.href = './login.html';
        return;
    }
    announceMessage(error.message);
}

async function loadBalance() {
    try {
        const balanceResponse = await upiService.getBalance();
        const balanceAmount = document.getElementById('balanceAmount');
        balanceAmount.textContent = `₹${balanceResponse.balance.toFixed(2)}`;
    } catch (error) {
        console.error('Failed to load balance:', error);
        throw error;
    }
}

async function loadTransactions() {
    try {
        const transactions = await upiService.getTransactions();
        displayTransactions(transactions);
    } catch (error) {
        console.error('Failed to load transactions:', error);
        throw error;
    }
}

function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactions.length) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        return;
    }

    const transactionsHtml = transactions.map(transaction => `
        <div class="transaction ${transaction.sender === localStorage.getItem('userId') ? 'sent' : 'received'}">
            <p class="transaction-type">
                ${transaction.sender === localStorage.getItem('userId') ? 'Sent to' : 'Received from'}
                <strong>${transaction.sender === localStorage.getItem('userId') ? transaction.receiver.name : transaction.sender.name}</strong>
            </p>
            <p class="amount">₹${transaction.amount.toFixed(2)}</p>
            <p class="description">${transaction.description || 'No description'}</p>
            <p class="date">${new Date(transaction.timestamp).toLocaleString()}</p>
        </div>
    `).join('');

    transactionsList.innerHTML = transactionsHtml;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = './index.html';
    announceMessage('Logged out successfully');
} 