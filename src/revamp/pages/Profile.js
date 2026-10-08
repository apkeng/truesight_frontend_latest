import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LuLock, LuShieldCheck, LuBadgeCheck, LuCopy, LuCheck, LuCamera, LuEye, LuEyeOff, LuCalendar } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { fileToAvatarDataUrl, formatDate, timeAgo } from "../lib/format";
import { Avatar, Badge, Button, Card, Dialog, ErrorState, Field, Input, Select, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";

const LEVELS = ["Primary School", "High School", "Undergraduate", "Postgraduate", "Undergraduate Student", "Post Graduate", "Teacher"];

export default function Profile() {
  const { data, error, isLoading, refetch } = useQuery(keys.me(), api.me, { staleMs: 120_000 });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (data) setForm({ name: data.name, phone: data.phone, instituteName: data.instituteName, educationLevel: data.educationLevel, studentId: data.studentId });
  }, [data]);

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
  if (isLoading || !form) return <Page><Skeleton className="h-44 rounded-xl" /><Skeleton className="mt-5 h-80 rounded-xl" /></Page>;

  const dirty = Object.keys(form).some((k) => (form[k] || "") !== (data[k] || ""));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profile = await api.updateMe(form);
      setQueryData(keys.me(), profile);
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, name: profile.name, instituteName: profile.instituteName, educationLevel: profile.educationLevel } });
      invalidate(keys.dashboard());
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <h1 className="text-[24px] font-extrabold tracking-tight text-ts-ink">Profile & account</h1>
      <p className="mt-1 text-sm text-ts-muted">Identity, academic details and account security.</p>

      <div className="mt-5 space-y-5">
        <Summary profile={data} />

        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-[15px] font-bold text-ts-ink">Identity & Contact Information</h2>
              <p className="text-xs text-ts-muted">Your personal credentials for official records and certificates.</p>
              <div className="mt-4 space-y-4 border-t border-ts-border pt-4">
                <Field label="Legal Full Name" required>
                  <Input value={form.name} onChange={set("name")} required maxLength={120} />
                </Field>
                <Field label="Electronic Email" required hint="Your sign-in email - contact support to change it.">
                  <Input value={data.email} disabled />
                </Field>
                <Field label="Contact Number">
                  <Input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="+91 98765 43210" maxLength={20} />
                </Field>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="text-[15px] font-bold text-ts-ink">Academic Affiliation</h2>
              <p className="text-xs text-ts-muted">Institutional standing and campus identifier.</p>
              <div className="mt-4 space-y-4 border-t border-ts-border pt-4">
                <Field label="Educational Institute Name" required>
                  <Input value={form.instituteName} onChange={set("instituteName")} maxLength={160} />
                </Field>
                <Field label="Academic Level" required>
                  <Select value={form.educationLevel} onChange={set("educationLevel")}>
                    {!LEVELS.includes(form.educationLevel) && <option value={form.educationLevel}>{form.educationLevel || "Select level"}</option>}
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Organization / Student ID" hint={data.instituteCode ? `Institute code: ${data.instituteCode}` : undefined}>
                  <Input value={form.studentId} onChange={set("studentId")} placeholder="e.g. TS-2026-IITM-8942" maxLength={60} />
                </Field>
              </div>
            </Card>
          </div>
          <div className="flex justify-end gap-2">
            {dirty && <Button variant="secondary" onClick={() => setForm({ name: data.name, phone: data.phone, instituteName: data.instituteName, educationLevel: data.educationLevel, studentId: data.studentId })}>Discard</Button>}
            <Button type="submit" variant="navy" icon={LuCheck} loading={saving} disabled={!dirty || !form.name.trim()}>Update Profile</Button>
          </div>
        </form>

        {/* Card / Password */}
        <Card className="flex flex-wrap items-center gap-4 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ts-wash text-ts-navy"><LuLock aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-ts-ink">Account Password</p>
            <p className="text-xs text-ts-muted">•••••••••••• · {data.passwordChangedAt ? `Last changed ${timeAgo(data.passwordChangedAt)}` : "Never changed here"}</p>
          </div>
          <Button variant="secondary" onClick={() => setPwOpen(true)}>Change Password</Button>
        </Card>
      </div>

      <PasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} onChanged={() => setQueryData(keys.me(), (d) => d && { ...d, passwordChangedAt: new Date().toISOString() })} />
    </Page>
  );
}

function Summary({ profile }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const setPhoto = async (photo) => {
    setBusy(true);
    try {
      await api.setPhoto(photo);
      setQueryData(keys.me(), (d) => d && { ...d, photoURL: photo });
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, photoURL: photo } });
      toast.success(photo ? "Photo updated." : "Photo removed.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file) => {
    if (!file) return;
    try {
      setPhoto(await fileToAvatarDataUrl(file));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(profile.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy - select the ID manually.");
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()} className="group relative rounded-full ring-2 ring-ts-border ring-offset-2" aria-label="Change photo" disabled={busy}>
          <Avatar name={profile.name} src={profile.photoURL} size={68} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"><LuCamera aria-hidden /></span>
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-ts-deep" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[19px] font-bold text-ts-ink">
            {profile.name} {profile.verified && <Badge tone="blue" icon={LuBadgeCheck}>Verified {profile.role === "Level-1" ? "Educator" : "Student"}</Badge>}
          </p>
          <p className="truncate text-[13px] text-ts-muted">{[profile.email, profile.instituteName].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" loading={busy} onClick={() => fileRef.current?.click()}>Upload Photo</Button>
          {profile.photoURL && <Button variant="ghost" size="sm" disabled={busy} onClick={() => setPhoto(null)}>Reset</Button>}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ts-border pt-4">
        <Badge tone="green" icon={LuShieldCheck}>Privacy Secured</Badge>
        {profile.createdAt && <Badge tone="blue" icon={LuCalendar}>Member since {formatDate(profile.createdAt, { month: "short", year: "numeric" })}</Badge>}
        <div className="ml-auto flex min-w-0 items-center gap-2 rounded-lg border border-ts-border px-2 py-1 text-[11px]">
          <span className="text-ts-muted">Truesight ID:</span>
          <span className="truncate font-mono font-semibold text-ts-ink">{profile.uid}</span>
          <button type="button" onClick={copyId} className="rounded border border-ts-border px-1.5 py-0.5 font-semibold text-ts-ink hover:bg-ts-subtle">{copied ? "Copied" : <><LuCopy aria-hidden className="mr-0.5 inline" />Copy</>}</button>
        </div>
      </div>
    </Card>
  );
}

function PasswordDialog({ open, onClose, onChanged }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setShow(false);
    }
  }, [open]);
  const mismatch = confirm && next !== confirm;
  const weak = next && next.length < 8;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.changePassword(current, next);
      toast.success("Password changed.");
      onChanged();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} title="Change password" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password" required>
          <Input type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </Field>
        <Field label="New password" required error={weak ? "Use at least 8 characters." : null}>
          <Input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
        </Field>
        <Field label="Confirm new password" required error={mismatch ? "Passwords don't match." : null}>
          <Input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </Field>
        <button type="button" onClick={() => setShow(!show)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ts-muted hover:text-ts-ink">
          {show ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />} {show ? "Hide" : "Show"} passwords
        </button>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="navy" size="sm" loading={busy} disabled={!current || !next || weak || mismatch || next !== confirm}>Update password</Button>
        </div>
      </form>
    </Dialog>
  );
}
