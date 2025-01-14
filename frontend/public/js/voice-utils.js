// Text-to-speech utility
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};

// Enhanced voice recognition with more commands
const startVoiceRecognition = (callback) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';

  recognition.start();
  speak('Listening...');

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    callback(command);
  };

  recognition.onend = () => {
    recognition.stop();
  };

  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
    speak('Sorry, I did not understand that. Please try again.');
  };

  return recognition;
};

// Voice commands dictionary
const VOICE_COMMANDS = {
  NAVIGATION: {
    'go to dashboard': '/dashboard.html',
    'go to home': '/index.html',
    'go back': 'history.back()',
    'send money': '/send-money.html',
    'request money': '/request-money.html',
    'show transactions': '/dashboard.html#transactions',
    'logout': 'logout'
  },
  ACTIONS: {
    'check balance': 'checkBalance',
    'confirm payment': 'confirmPayment',
    'cancel transaction': 'cancelTransaction',
    'verify otp': 'verifyOTP'
  }
}; 