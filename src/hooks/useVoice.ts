import { useState, useRef, useCallback, useEffect } from 'react';
import type { Language } from '../lib/i18n';

const LANG_MAP: Record<Language, string> = {
  en: 'en-US',
  rw: 'rw-RW', // browser falls back to en-US gracefully if unsupported
};

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useVoice(lang: Language, onFinalTranscript?: (text: string) => void): VoiceState {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SR = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;
  const isSupported = !!SR;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;
    setError(null);
    setInterimTranscript('');

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANG_MAP[lang];
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        onFinalTranscript?.(final);
      }
    };

    recognition.onerror = (e: any) => {
      const msg = e.error === 'not-allowed'
        ? 'Microphone access denied'
        : e.error === 'no-speech'
        ? 'No speech detected — try again'
        : e.error;
      setError(msg);
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, isListening, lang, onFinalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
}

// Text-to-speech helper
export function speak(text: string, lang: Language): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = LANG_MAP[lang];
  utt.rate = 0.92;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
