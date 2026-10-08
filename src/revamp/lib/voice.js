import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice prompt + read-aloud, built on the browser's Web Speech API.
 *
 * Why this and not a hosted speech service: it is free, needs no API key,
 * adds no backend hop, and streams interim transcripts while the student is
 * still speaking - so the prompt box fills in as they talk. Read-aloud uses
 * on-device voices, so playback starts instantly.
 *
 * Support: speech recognition works in Chrome, Edge and Safari (Chrome sends
 * audio to Google's free recogniser); Firefox has synthesis only. Callers
 * get `supported` flags and hide the mic button when it isn't available.
 */

const Recognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const DEFAULT_LANG = "en-IN";

const RECOGNITION_ERRORS = {
  "not-allowed": "Microphone access was blocked. Allow it in the browser's site settings to use voice prompts.",
  "service-not-allowed": "Microphone access was blocked. Allow it in the browser's site settings to use voice prompts.",
  "no-speech": "Didn't catch that - try speaking again.",
  "audio-capture": "No microphone was found.",
  network: "Voice recognition needs an internet connection.",
};

export function useSpeechToText({ lang = DEFAULT_LANG, onFinal } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const finalRef = useRef("");
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Recognition) return;
    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      finalRef.current = finalText.trim();
      setTranscript(finalRef.current);
      setInterim(interimText.trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") setError(RECOGNITION_ERRORS[event.error] || "Voice input stopped unexpectedly.");
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
      if (finalRef.current && onFinalRef.current) onFinalRef.current(finalRef.current);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch (e) {
      setError("Couldn't start the microphone.");
    }
  }, [lang]);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported: Boolean(Recognition), listening, transcript, interim, error, start, stop, reset };
}

// ------------------------------------------------------------- read aloud

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

/** Markdown/LaTeX -> something that sounds natural when spoken. */
export const toSpeakable = (markdown = "") =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$([\s\S]*?)\$\$/g, " $1 ")
    .replace(/\$([^$]+)\$/g, " $1 ")
    .replace(/\\(frac)\{([^}]*)\}\{([^}]*)\}/g, " $2 over $3 ")
    .replace(/\\(cdot|times)/g, " times ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}^_]/g, " ")
    .replace(/\[(\d+)\]/g, "")
    .replace(/[*#>|`~]/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

// Chrome stops long utterances after ~15s, so speak sentence-sized chunks.
const chunk = (text) => {
  const sentences = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [text];
  const out = [];
  let current = "";
  sentences.forEach((s) => {
    if ((current + s).length > 220 && current) {
      out.push(current);
      current = s;
    } else current += s;
  });
  if (current.trim()) out.push(current);
  return out.map((c) => c.trim()).filter(Boolean);
};

const pickVoice = (lang) => {
  if (!synth) return null;
  const voices = synth.getVoices();
  return (
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang?.startsWith("en-") && /natural|google|online/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    null
  );
};

export function useTextToSpeech({ lang = DEFAULT_LANG, rate = 1 } = {}) {
  const [speakingId, setSpeakingId] = useState(null);
  const runRef = useRef(0);

  // Voices load asynchronously in Chrome; touching getVoices() early primes them.
  useEffect(() => {
    synth?.getVoices();
    return () => synth?.cancel();
  }, []);

  const stop = useCallback(() => {
    runRef.current += 1;
    synth?.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id, markdown) => {
      if (!synth) return;
      const run = runRef.current + 1;
      runRef.current = run;
      synth.cancel();
      const parts = chunk(toSpeakable(markdown));
      if (!parts.length) return;
      const voice = pickVoice(lang);
      setSpeakingId(id);
      parts.forEach((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = voice?.lang || lang;
        if (voice) utterance.voice = voice;
        utterance.rate = rate;
        if (index === parts.length - 1) {
          utterance.onend = () => runRef.current === run && setSpeakingId(null);
        }
        utterance.onerror = () => runRef.current === run && setSpeakingId(null);
        synth.speak(utterance);
      });
    },
    [lang, rate]
  );

  const toggle = useCallback(
    (id, markdown) => (speakingId === id ? stop() : speak(id, markdown)),
    [speakingId, speak, stop]
  );

  return { supported: Boolean(synth), speakingId, speak, stop, toggle };
}
