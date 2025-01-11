class ErrorHandler {
    static handleApiError(error, fallbackMessage = 'An error occurred') {
        if (!navigator.onLine) {
            return 'No internet connection. Please check your connection and try again.';
        }

        if (error.message === 'Failed to fetch') {
            return 'Unable to connect to server. Please try again later.';
        }

        return error.message || fallbackMessage;
    }
}

window.ErrorHandler = ErrorHandler; 