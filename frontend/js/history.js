// For transaction history
class HistoryManager extends PageManager {
    constructor() {
        super('transaction history');
        this.loadTransactions();
    }

    setupTransactionGuides() {
        document.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const amount = item.querySelector('.amount').textContent;
                const type = item.querySelector('.type').textContent;
                this.voiceGuide.speak(`${type} transaction of ${amount}`);
            });
        });
    }

    async loadTransactions() {
        this.showLoading('Loading your transactions...');
        // ... transaction loading code ...
    }
} 