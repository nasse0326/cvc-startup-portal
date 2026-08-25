import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInputButton({ onTranscript, className = "", size = "sm" }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert("お使いのブラウザは音声入力（Web Speech API）に未対応です。ChromeやSafari等の最新ブラウザでお試しください。");
      return;
    }

    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  const iconSizes = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5"
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
        isListening
          ? 'bg-rose-500 text-white shadow-md animate-pulse ring-2 ring-rose-400/50'
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
      } ${className}`}
      title={isListening ? "音声入力を停止" : "音声入力を開始 (日本語対応)"}
    >
      {isListening ? (
        <>
          <MicOff className={iconSizes[size] || "h-4 w-4"} />
          <span>録音中...</span>
        </>
      ) : (
        <>
          <Mic className={iconSizes[size] || "h-4 w-4"} />
          <span>音声入力</span>
        </>
      )}
    </button>
  );
}
