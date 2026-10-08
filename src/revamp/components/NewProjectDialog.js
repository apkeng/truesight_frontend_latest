import React, { useEffect, useState } from "react";
import { cx } from "../lib/format";
import { Button, Dialog, Field, Input } from "../ui";
import { useNotifications } from "./Notifications";

export const LEVELS = ["Primary School", "High School", "Undergraduate", "Postgraduate"];

/**
 * Create-a-roadmap dialog, used by the Projects page and the dashboard's
 * syllabus mind map. Submitting closes it immediately: generation runs in
 * the background and ends with an in-app notification linking to the new
 * project (see NotificationProvider.startRoadmap).
 */
export function NewProjectDialog({ open, onClose, initialTopic = "", initialLevel = "", source = "projects" }) {
  const { startRoadmap } = useNotifications();
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState(initialLevel);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTopic(initialTopic);
      setLevel(LEVELS.includes(initialLevel) ? initialLevel : "");
    }
  }, [open, initialTopic, initialLevel]);

  const valid = topic.trim().length >= 3 && level;
  const create = async () => {
    setSending(true);
    try {
      await startRoadmap({ topic: topic.trim(), levelOfLearning: level, source });
      onClose();
    } catch {
      // startRoadmap already showed the reason; keep the dialog open to fix it
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      tone="navy"
      eyebrow={source === "syllabus" ? "From your syllabus" : "Self-directed research"}
      title="Create a new roadmap"
      description="AI researches your topic, drafts the modules, then reviews and fact-checks every one. It takes a few minutes - we'll notify you when it's ready."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!valid} loading={sending} onClick={create}>Create project</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="1. Research topic" required hint="Be specific, e.g. “Kerala Building Rules 2025 amendment” or “MOSFET circuits”.">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to master?" autoFocus onKeyDown={(e) => e.key === "Enter" && valid && create()} />
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ts-ink">2. Level of learning *</p>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => setLevel(l)} className={cx("rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors", level === l ? "border-ts-deep bg-ts-deep text-white" : "border-ts-border text-ts-ink hover:border-ts-field")}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
