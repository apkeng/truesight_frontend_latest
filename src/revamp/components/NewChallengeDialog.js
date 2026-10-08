import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { LuChevronRight, LuInfo, LuBadgeCheck, LuSearch, LuAtom } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, useQuery } from "../lib/query";
import { cx } from "../lib/format";
import { Avatar, Button, Dialog, Field, Select, Spinner } from "../ui";

/**
 * Dialog / New Challenge (Figma 12). Domain = one of the student's roadmaps,
 * topic = one of its subtopics, peer = a verified Level-1/Level-2 user.
 * `preset` ({ topic, domain, peer }) pre-fills it (roadmap "challenge" button,
 * "Re-challenge" on an expired card).
 */
export function NewChallengeDialog({ open, onClose, preset, onCreated }) {
  const topicsQuery = useQuery(open ? keys.challengeTopics() : null, api.challengeTopics, { staleMs: 120_000 });
  const domains = useMemo(() => topicsQuery.data || [], [topicsQuery.data]);
  const [domainId, setDomainId] = useState("");
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const [peers, setPeers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [peer, setPeer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Apply the preset (or defaults) whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setPeer(preset?.peer || null);
    setTopic(preset?.topic || "");
    setDomainId("");
  }, [open, preset]);

  useEffect(() => {
    if (!open || !domains.length) return;
    if (preset?.topic) {
      const match = domains.find((d) => d.title === preset.domain && d.topics.includes(preset.topic)) || domains.find((d) => d.topics.includes(preset.topic));
      setDomainId(match ? match.id : "__custom");
    } else if (!domainId) {
      setDomainId(domains[0].id);
      setTopic(domains[0].topics[0] || "");
    }
    // domainId intentionally omitted: only seed once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, domains, preset]);

  // Debounced peer search.
  useEffect(() => {
    if (!open) return undefined;
    setSearching(true);
    const t = setTimeout(() => {
      api.peers(search.trim())
        .then(setPeers)
        .catch(() => setPeers([]))
        .finally(() => setSearching(false));
    }, search ? 220 : 0);
    return () => clearTimeout(t);
  }, [search, open]);

  const domain = domains.find((d) => d.id === domainId);
  const topicOptions = domain ? domain.topics : preset?.topic ? [preset.topic] : [];

  const submit = async () => {
    setSubmitting(true);
    try {
      const challenge = await api.createChallenge({ topic, domain: domain?.title || preset?.domain || null, opponentId: peer.uid });
      invalidate(keys.challenges(), keys.dashboard());
      toast.success(`Challenge sent to ${peer.name}. They have 24 hours to play.`);
      onCreated?.(challenge);
      onClose();
    } catch (e) {
      toast.error(e.message || "Couldn't create the challenge.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? () => {} : onClose}
      tone="navy"
      eyebrow="Direct peer engagement"
      title="Authorize a Peer Challenge"
      description="Select an academic domain and authorize an engagement with verified peers."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button size="sm" iconRight={LuChevronRight} disabled={!topic || !peer} loading={submitting} onClick={submit}>
            {submitting ? "Generating questions…" : "Authorize Challenge"}
          </Button>
        </>
      }
    >
      {submitting ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ts-wash text-2xl text-ts-navy"><LuAtom aria-hidden className="animate-spin [animation-duration:2.5s]" /></span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ts-blue">Initiate peer challenge</p>
          <p className="mt-1 text-lg font-bold text-ts-ink">Launching Live Challenge</p>
          <p className="mt-1 text-xs text-ts-muted">Generating 5 questions on “{topic}” for you and {peer?.name}…</p>
          <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-1/2 animate-[ts-shimmer_1.2s_linear_infinite] rounded-full bg-ts-navy" /></div>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="1. Academic Domain:">
            <Select
              value={domainId}
              onChange={(e) => {
                setDomainId(e.target.value);
                const d = domains.find((x) => x.id === e.target.value);
                setTopic(d?.topics[0] || "");
              }}
              disabled={topicsQuery.isLoading}
            >
              {topicsQuery.isLoading && <option>Loading your roadmaps…</option>}
              {domainId === "__custom" && <option value="__custom">{preset?.domain || "Selected topic"}</option>}
              {domains.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
          </Field>
          <Field label="2. Challenge Quiz Topic:">
            <Select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!topicOptions.length}>
              {!topicOptions.length && <option value="">Create a roadmap first to pick topics</option>}
              {topicOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ts-ink">3. Search Verified Peer:</p>
            {peer ? (
              <div className="flex items-center gap-3 rounded-lg border border-ts-blue/40 bg-ts-wash/60 p-2.5">
                <Avatar name={peer.name} src={peer.photoURL} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-bold text-ts-ink">{peer.name} <LuBadgeCheck aria-hidden className="text-ts-blue" /></p>
                  <p className="truncate text-[11px] text-ts-muted">{peer.educationLevel || peer.role}{peer.instituteName ? ` · ${peer.instituteName}` : ""}</p>
                </div>
                <button type="button" onClick={() => setPeer(null)} className="text-xs font-semibold text-ts-blue hover:underline">Change</button>
              </div>
            ) : (
              <>
                <label className="relative flex items-center">
                  <LuSearch aria-hidden className="pointer-events-none absolute left-3 text-ts-faint" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Drop friend name or campus email (e.g. sandeep.c@campus.edu)…"
                    className="h-10 w-full rounded-lg border border-ts-field/80 bg-white pl-9 pr-3 text-sm outline-none focus:border-ts-blue/60 focus:ring-2 focus:ring-ts-blue/15"
                  />
                </label>
                <ul className="ts-scroll mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {searching && !peers.length && <li className="flex justify-center py-3"><Spinner /></li>}
                  {peers.map((p) => (
                    <li key={p.uid}>
                      <button type="button" onClick={() => setPeer(p)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-ts-subtle">
                        <Avatar name={p.name} src={p.photoURL} size={28} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ts-ink">{p.name}</span>
                          <span className="block truncate text-[11px] text-ts-muted">{p.emailHint}{p.instituteName ? ` · ${p.instituteName}` : ""}</span>
                        </span>
                        {p.sameInstitute && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Your campus</span>}
                      </button>
                    </li>
                  ))}
                  {!searching && !peers.length && <li className="py-3 text-center text-xs text-ts-muted">No verified peers match “{search}”.</li>}
                </ul>
              </>
            )}
          </div>
          <p className={cx("flex gap-2 rounded-lg border border-ts-border bg-ts-subtle p-3 text-[11.5px] leading-relaxed text-ts-muted")}>
            <LuInfo aria-hidden className="mt-0.5 shrink-0 text-ts-blue" />
            <span><span className="font-semibold text-ts-ink">Asynchronous Engagement:</span> No scheduled live session required. Your friend can take the challenge at any time within 24 hours.</span>
          </p>
        </div>
      )}
    </Dialog>
  );
}
