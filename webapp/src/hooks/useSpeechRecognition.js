import { useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (onTranscript) => {
  const recognition = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
    }
  }, [onTranscript]);

  const start = useCallback(() => {
    if (recognition.current) {
      try {
        recognition.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, []);

  return {
    start,
    stop
  };
};