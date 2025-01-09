import { useCallback } from 'react';

export const useSpeechSynthesis = (onStart, onEnd) => {
  const synthesis = window.speechSynthesis;

  const speak = useCallback((text) => {
    if (synthesis.speaking) {
      synthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = onStart;
    utterance.onend = onEnd;
    synthesis.speak(utterance);
  }, [synthesis, onStart, onEnd]);

  const stop = useCallback(() => {
    if (synthesis.speaking) {
      synthesis.cancel();
    }
  }, [synthesis]);

  return { speak, stop };
};