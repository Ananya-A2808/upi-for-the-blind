class ScreenReaderHelper {
    constructor() {
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('role', 'status');
        this.announcer.classList.add('sr-only');
        document.body.appendChild(this.announcer);
    }

    announce(message, priority = 'polite') {
        this.announcer.setAttribute('aria-live', priority);
        // Clear previous message
        this.announcer.textContent = '';
        
        // Set new message after a brief delay
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 100);
    }

    // Announce currency amounts properly
    formatCurrency(amount) {
        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);
        
        let message = `${rupees} rupees`;
        if (paise > 0) {
            message += ` and ${paise} paise`;
        }
        return message;
    }

    // Announce transaction details clearly
    announceTransaction(transaction, isOutgoing) {
        const amount = this.formatCurrency(transaction.amount);
        const direction = isOutgoing ? 'sent to' : 'received from';
        const person = isOutgoing ? transaction.receiver.name : transaction.sender.name;
        const date = new Date(transaction.timestamp).toLocaleString();
        
        return `Transaction ${direction} ${person}: ${amount}. ${transaction.description}. On ${date}`;
    }
}

// Create global instance
window.screenReader = new ScreenReaderHelper(); 