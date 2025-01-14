const VoiceGuide = {
  speak: (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => console.log('Speech finished');
      utterance.onerror = (err) => console.error('Speech error:', err);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  },

  readElement: (element) => {
    try {
      if (!element) return;
      const text = element.hasAttribute('data-voice') 
        ? element.getAttribute('data-voice')
        : element.textContent;
      if (text) VoiceGuide.speak(text);
    } catch (error) {
      console.error('Error reading element:', error);
    }
  },

  initializePage: () => {
    try {
      // Check if speech synthesis is available
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        return;
      }

      document.querySelectorAll('button, input, a').forEach(element => {
        element.addEventListener('focus', () => VoiceGuide.readElement(element));
        element.addEventListener('mouseover', () => VoiceGuide.readElement(element));
      });

      const voiceBtn = document.createElement('button');
      voiceBtn.className = 'voice-btn';
      voiceBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      voiceBtn.onclick = () => {
        const content = document.body.textContent.trim();
        if (content) VoiceGuide.speak(content);
      };
      document.body.appendChild(voiceBtn);
    } catch (error) {
      console.error('Error initializing voice guidance:', error);
    }
  }
};

// Initialize voice guidance when page loads
document.addEventListener('DOMContentLoaded', VoiceGuide.initializePage); 