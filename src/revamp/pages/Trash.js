import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LuTrash2, LuRotateCcw, LuMap, LuBookOpen, LuClipboardList, LuMessagesSquare, LuArchive } from "react-icons/lu";
import { api, keys, uidKey } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx } from "../lib/format";
import { Badge, Button, Card, Checkbox, ConfirmDialog, EmptyState, ErrorState, PageHeader, SearchField, SegmentTabs, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { deleteTextbook } from "../../utils/textbookServiceClient";

const TYPE = {
  project: { label: "Project Roadmap", tone: "blue", icon: LuMap, box: "bg-blue-50 text-blue-600", tab: "projects" },
  textbook: { label: "Textbook / Notes", tone: "purple", icon: LuBookOpen, box: "bg-purple-50 text-purple-600", tab: "books" },
  chat: { label: "Textbook / Notes", tone: "purple", icon: LuMessagesSquare, box: "bg-purple-50 text-purple-600", tab: "books" },
  result: { label: "Quiz Diagnostic", tone: "amber", icon: LuClipboardList, box: "bg-amber-50 text-amber-600", tab: "quizzes" },
};

const itemKey = (i) => `${i.type}:${i.id}`;

/** Delete textbooks from the textbook service (only the owner's token can). */
const purgeBooks = (bookIds) =>
  Promise.allSettled(bookIds.map((id) => deleteTextbook(id))).then((r) => r.filter((x) => x.status === "rejected").length);

export default function Trash() {
  const { data, error, isLoading, refetch } = useQuery(keys.trash(), api.trash, { staleMs: 15_000 });
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // { kind: 'delete'|'empty', items? }
  const [busy, setBusy] = useState(false);
  const expiredHandled = useRef(false);

  // Finish the 30-day purge for textbooks (the backend can't delete those itself).
  useEffect(() => {
    if (!data?.expiredTextbooks?.length || expiredHandled.current) return;
    expiredHandled.current = true;
    const ids = data.expiredTextbooks.map((b) => b.bookId);
    purgeBooks(ids).then(() => api.purge(ids.map((id) => ({ type: "textbook", id })))).catch(() => {});
  }, [data]);

  const items = useMemo(() => data?.items || [], [data]);
  const counts = useMemo(() => {
    const c = { all: items.length, projects: 0, books: 0, quizzes: 0 };
    items.forEach((i) => (c[TYPE[i.type].tab] += 1));
    return c;
  }, [items]);
  const list = useMemo(
    () => items.filter((i) => tab === "all" || TYPE[i.type].tab === tab).filter((i) => !q || `${i.title} ${i.domain || ""} ${i.meta || ""}`.toLowerCase().includes(q.toLowerCase())),
    [items, tab, q]
  );

  const drop = (removed) => {
    const gone = new Set(removed.map(itemKey));
    setQueryData(keys.trash(), (d) => d && { ...d, items: d.items.filter((i) => !gone.has(itemKey(i))) });
    setSelected((s) => new Set([...s].filter((k) => !gone.has(k))));
  };

  const restore = async (targets) => {
    setBusy(true);
    try {
      await api.restore(targets.map(({ type, id }) => ({ type, id })));
      drop(targets);
      invalidate(keys.projects(), keys.results(), keys.dashboard(), `${uidKey("chats:")}*`, uidKey("assistant:trashed-books"));
      toast.success(targets.length === 1 ? `Restored "${targets[0].title}".` : `Restored ${targets.length} items.`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const destroy = async (targets) => {
    setBusy(true);
    try {
      const res = await api.purge(targets.map(({ type, id }) => ({ type, id })));
      const failed = await purgeBooks(res.textbooksToDelete || []);
      drop(targets);
      toast.success(`Permanently deleted ${targets.length} item${targets.length > 1 ? "s" : ""}.${failed ? " Some textbooks couldn't be removed from the library - try again later." : ""}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const empty = async () => {
    setBusy(true);
    try {
      const res = await api.emptyTrash();
      await purgeBooks(res.textbooksToDelete || []);
      setQueryData(keys.trash(), (d) => d && { ...d, items: [] });
      setSelected(new Set());
      toast.success("Trash emptied.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const selectedItems = list.filter((i) => selected.has(itemKey(i)));
  const allSelected = list.length > 0 && selectedItems.length === list.length;

  return (
    <Page>
      <PageHeader
        tone="deep"
        title="Trash & Archived Items"
        description={`Items moved to trash will be permanently purged after ${data?.retentionDays || 30} days. You can restore them to your workspace anytime or empty the trash now.`}
        action={
          <button type="button" disabled={!items.length || busy} onClick={() => setConfirm({ kind: "empty" })} className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-300/40 bg-red-500/15 px-4 text-sm font-semibold text-red-100 hover:bg-red-500/25 disabled:opacity-40">
            <LuTrash2 aria-hidden /> Empty Trash
          </button>
        }
      />

      <Card className="mt-6 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SegmentTabs
          className="border-0 p-0 shadow-none"
          value={tab}
          onChange={(v) => { setTab(v); setSelected(new Set()); }}
          items={[
            { value: "all", label: "All items", count: counts.all },
            { value: "projects", label: "Projects", count: counts.projects },
            { value: "books", label: "Textbooks & notes", count: counts.books },
            { value: "quizzes", label: "Quizzes", count: counts.quizzes },
          ]}
        />
        <SearchField value={q} onChange={setQ} placeholder="Search trashed items by title, domain, or notes…" className="flex-1 lg:ml-auto lg:max-w-md" />
      </Card>

      {list.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 px-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-ts-muted">
            <Checkbox checked={allSelected} onChange={(on) => setSelected(on ? new Set(list.map(itemKey)) : new Set())} label="Select all" /> Select all
          </label>
          {selectedItems.length > 0 && (
            <>
              <span className="text-xs text-ts-muted">{selectedItems.length} selected</span>
              <Button variant="soft" size="xs" icon={LuRotateCcw} disabled={busy} onClick={() => restore(selectedItems)}>Restore</Button>
              <Button variant="danger" size="xs" icon={LuTrash2} disabled={busy} onClick={() => setConfirm({ kind: "delete", items: selectedItems })}>Delete forever</Button>
            </>
          )}
        </div>
      )}

      <div className="mt-3 space-y-3">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-[86px] rounded-xl" />)
        ) : !list.length ? (
          <EmptyState icon={LuArchive} title={items.length ? "Nothing matches" : "Trash is empty"} description={items.length ? "Try another tab or search." : "Deleted roadmaps, quiz results, conversations and textbooks land here for 30 days."} />
        ) : (
          list.map((i) => {
            const t = TYPE[i.type];
            const Icon = t.icon;
            const key = itemKey(i);
            return (
              <Card key={key} className={cx("flex items-center gap-4 px-4 py-3.5", selected.has(key) && "ring-1 ring-ts-blue/40")}>
                <Checkbox checked={selected.has(key)} onChange={(on) => setSelected((s) => { const n = new Set(s); on ? n.add(key) : n.delete(key); return n; })} label={`Select ${i.title}`} />
                <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", t.box)}><Icon aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <Badge tone={t.tone}>{t.label}</Badge>
                    {i.domain && <span className="text-[11px] text-ts-muted">{i.domain}</span>}
                  </p>
                  <p className="mt-0.5 truncate text-[14px] font-bold text-ts-ink" title={i.title}>{i.title}</p>
                  <p className="truncate text-[11.5px] text-ts-muted">From: {i.source}{i.meta ? `  •  ${i.meta}` : ""}</p>
                </div>
                <Badge tone={i.daysLeft <= 3 ? "red" : "neutral"} dot className="hidden sm:inline-flex">{i.daysLeft} day{i.daysLeft === 1 ? "" : "s"} left</Badge>
                <Button variant="soft" size="sm" icon={LuRotateCcw} disabled={busy} onClick={() => restore([i])}>Restore</Button>
                <button type="button" disabled={busy} onClick={() => setConfirm({ kind: "delete", items: [i] })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50" aria-label={`Delete ${i.title} forever`}>
                  <LuTrash2 aria-hidden />
                </button>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        loading={busy}
        onConfirm={() => (confirm.kind === "empty" ? empty() : destroy(confirm.items))}
        title={confirm?.kind === "empty" ? "Empty the trash?" : "Delete forever?"}
        description={
          confirm?.kind === "empty"
            ? `All ${items.length} items will be permanently deleted. This can't be undone.`
            : confirm?.items?.length === 1
              ? `"${confirm.items[0].title}" will be permanently deleted. This can't be undone.`
              : `${confirm?.items?.length} items will be permanently deleted. This can't be undone.`
        }
        confirmLabel={confirm?.kind === "empty" ? "Empty trash" : "Delete forever"}
      />
    </Page>
  );
}
