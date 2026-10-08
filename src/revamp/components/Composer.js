import React, { useEffect, useRef, useState } from "react";
import { LuPlus, LuMic, LuSendHorizontal, LuSquare, LuAudioLines } from "react-icons/lu";
import { cx } from "../lib/format";
import { useSpeechToText } from "../lib/voice";
import { Button, Dialog } from "../ui";

/**
 * AI / Composer (Figma 15): rounded prompt field with an optional "+"
 * (upload), a mic (inline dictation - text streams in while you speak) and
 * a send button. Enter sends, Shift+Enter adds a newline.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  onAttach,
  placeholder = "Ask anything…",
  disabled,
  busy,
  hint,
  voice = true,
  onVoiceDialog,
  autoFocus,
  className,
  size = "md",
}) {
  const textRef = useRef(null);
  const baseRef = useRef("");
  const stt = useSpeechToText({
    onFinal: (text) => {
      const next = [baseRef.current, text].filter(Boolean).join(" ");
      onChange(next);
    },
  });

  // Mirror the live transcript into the field while dictating.
  useEffect(() => {
    if (stt.listening) {
      const live = [baseRef.current, stt.transcript, stt.interim].filter(Boolean).join(" ");
      onChange(live);
    }
    // onChange identity is the parent's concern; only react to speech.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stt.transcript, stt.interim, stt.listening]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [value]);

  const toggleMic = () => {
    if (onVoiceDialog) return onVoiceDialog();
    if (stt.listening) return stt.stop();
    baseRef.current = value.trim();
    stt.start();
  };

  const submit = () => {
    if (stt.listening) stt.stop();
    if (value.trim() && !disabled && !busy) onSubmit(value.trim());
  };

  return (
    <div className={className}>
      <div
        className={cx(
          "flex items-end gap-2 rounded-full border bg-white pl-2 pr-1.5 shadow-card transition-colors focus-within:border-ts-blue/50 focus-within:ring-2 focus-within:ring-ts-blue/10",
          stt.listening ? "border-red-300" : "border-ts-border",
          size === "lg" ? "min-h-[52px] py-1.5" : "min-h-[44px] py-1"
        )}
      >
        {onAttach && (
          <button type="button" onClick={onAttach} className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ts-border text-ts-muted hover:text-ts-ink" aria-label="Upload a PDF">
            <LuPlus aria-hidden />
          </button>
        )}
        <textarea
          ref={textRef}
          rows={1}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={stt.listening ? "Listening…" : placeholder}
          className={cx("ts-scroll min-w-0 flex-1 resize-none bg-transparent px-2 text-sm leading-6 text-ts-ink outline-none placeholder:text-ts-faint", size === "lg" ? "py-2" : "py-1.5", !onAttach && "pl-3")}
        />
        {voice && (stt.supported || onVoiceDialog) && (
          <button
            type="button"
            onClick={toggleMic}
            className={cx(
              "mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
              stt.listening ? "bg-red-50 text-red-500" : "text-ts-muted hover:bg-slate-100 hover:text-ts-ink"
            )}
            aria-label={stt.listening ? "Stop dictation" : "Speak your question"}
            title={stt.listening ? "Stop dictation" : "Speak your question"}
          >
            {stt.listening ? <LuAudioLines aria-hidden className="animate-pulse" /> : <LuMic aria-hidden />}
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || disabled || busy}
          className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ts-navy text-white transition-opacity hover:bg-ts-navy-hover disabled:bg-slate-200 disabled:text-ts-faint"
          aria-label={busy ? "Waiting for answer" : "Send"}
        >
          {busy ? <LuSquare aria-hidden className="text-[11px]" /> : <LuSendHorizontal aria-hidden />}
        </button>
      </div>
      {(stt.error || hint) && <p className={cx("mt-1.5 text-center text-[11px]", stt.error ? "text-red-600" : "text-ts-faint")}>{stt.error || hint}</p>}
    </div>
  );
}

/**
 * Dialog / Voice Prompt (Figma 15): big mic, live transcript, tap-to-speak
 * suggestions, "Ask AI With Voice" sends the transcript.
 */
export function VoicePromptDialog({ open, onClose, onAsk, suggestions = [], contextLabel = "your textbook" }) {
  const [text, setText] = useState("");
  const stt = useSpeechToText({ onFinal: (t) => setText(t) });
  const { start, reset, stop } = stt;

  useEffect(() => {
    if (open) {
      setText("");
      reset();
      if (stt.supported) start();
    } else stop();
    // start/stop/reset are stable; run only when the dialog opens/closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const live = stt.listening ? [stt.transcript, stt.interim].filter(Boolean).join(" ") : text;

  const ask = (prompt) => {
    stop();
    const q = (prompt || live).trim();
    if (q) {
      onAsk(q, { voice: true });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="navy" size="sm" iconRight={LuSendHorizontal} disabled={!live.trim()} onClick={() => ask()}>
            Ask AI With Voice
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center pt-2 text-center">
        <button
          type="button"
          onClick={() => (stt.listening ? stop() : start())}
          disabled={!stt.supported}
          className={cx(
            "relative flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lift transition-colors",
            stt.listening ? "bg-ts-navy" : "bg-ts-deep hover:bg-ts-night"
          )}
          aria-label={stt.listening ? "Stop listening" : "Start listening"}
        >
          {stt.listening && <span className="absolute inset-0 animate-ping rounded-full bg-ts-navy/30" aria-hidden />}
          <LuMic aria-hidden />
        </button>
        <h3 className="mt-4 text-lg font-bold text-ts-ink">Voice Prompt</h3>
        <p className="text-xs font-medium text-ts-blue">
          {!stt.supported ? "Voice input isn't supported in this browser - try Chrome or Edge." : stt.listening ? `Listening to your question from ${contextLabel}…` : "Tap the mic to speak again"}
        </p>
        <div className="mt-3 flex h-8 items-end gap-[3px]" aria-hidden>
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className={cx("w-[3px] rounded-full bg-ts-navy", stt.listening ? "animate-ts-wave" : "opacity-30")}
              style={{ height: `${[40, 70, 100, 60, 85, 100, 75, 55, 90, 65, 45][i]}%`, animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
        <div className="mt-4 w-full rounded-lg border border-ts-border bg-ts-subtle px-3 py-2.5 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ts-faint">Live spoken transcript</p>
          <p className="mt-1 min-h-[20px] text-sm text-ts-ink">{live || <span className="text-ts-faint">…</span>}</p>
        </div>
        {stt.error && <p className="mt-2 text-xs text-red-600">{stt.error}</p>}
        {suggestions.length > 0 && (
          <div className="mt-4 w-full text-left">
            <p className="mb-1.5 text-[11px] text-ts-muted">Tap to speak suggested question:</p>
            <div className="space-y-1.5">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="block w-full rounded-lg border border-ts-border bg-white px-3 py-2 text-left text-xs text-ts-body hover:border-ts-blue/40 hover:bg-ts-wash">
                  “{s}”
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
