import React, { useEffect, useRef, useState } from "react";

// The animated product mock-ups. Each keeps its own timers/state so a tick
// re-renders only that widget, not the whole landing page.

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** setInterval that only runs while `active` and motion is allowed. */
function useTicker(ms, active = true) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms, active]);
  return tick;
}

/** True while the element is (roughly) on screen. */
function useOnScreen(ref, rootMargin = "0px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { rootMargin, threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}

export const Wave = ({ on }) => (
  <span className={`wave${on ? " is-on" : ""}`} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
    <span />
  </span>
);

export const Highlight = ({ children }) => (
  <span className="hl" data-hl="1">
    {children}
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M258 16 C196 1 76 3 30 24 C-6 41 4 78 62 90 C138 104 258 97 288 66 C309 44 282 18 206 10" pathLength="1" />
    </svg>
  </span>
);

const TOPICS = [
  ["Fluid properties & statics", "Module 1 · 6 topics"],
  ["Fluid kinematics", "Module 2 · 5 topics"],
  ["Bernoulli & energy equation", "Module 3 · 7 topics"],
  ["Navier–Stokes derivation", "Module 4 · 8 topics"],
  ["Boundary layer theory", "Module 5 · 5 topics"],
];

/** Hero roadmap card: topics tick through Up next → In progress → Done. */
export function HeroRoadmap() {
  const tick = useTicker(1600);
  const motion = !prefersReducedMotion();
  const active = motion ? tick % 6 : 3;
  const pct = Math.round((active / 5) * 100) + "%";
  return (
    <div className="hero-stack">
      <div className="rm">
        <div className="rm-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Project Roadmap</span>
              <span className="pill pill-y" style={{ fontSize: 10, padding: "3px 7px" }}>
                ME 204
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#B8C1DE" }}>Fluid Mechanics · exam in 18 days</span>
          </div>
          <div className="rm-pts mono">{(1180 + active * 20).toLocaleString("en-US")} PTS</div>
        </div>
        <div style={{ padding: "16px 20px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            <span>Progress</span>
            <span className="mono" style={{ color: "var(--ink)" }}>
              {pct}
            </span>
          </div>
          <div className="bar">
            <div style={{ width: pct }} />
          </div>
        </div>
        <div style={{ padding: "10px 12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          {TOPICS.map(([name, sub], i) => {
            const done = i < active;
            const cur = i === active;
            return (
              <div key={name} className={`rm-row${done ? " done" : ""}${cur ? " cur" : ""}`}>
                <div className="rm-dot">{done ? "✓" : i + 1}</div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</span>
                </div>
                <span className="rm-tag">{done ? "Done" : cur ? "In progress" : "Up next"}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="float f1" style={{ left: -44, top: -28, transform: "translateZ(90px)", whiteSpace: "nowrap" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Verified source</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          Ch 9 · p. 318
        </span>
      </div>
      <div style={{ position: "absolute", right: -22, top: -20, transform: "translateZ(120px)" }}>
        {motion && active > 0 && (
          <div key={tick} className="pts-pop mono">
            +20 PTS
          </div>
        )}
      </div>
      <div className="float hide-sm" style={{ left: -52, bottom: 54, transform: "translateZ(70px)", maxWidth: 250, padding: "12px 14px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#3A2716", color: "#FFB066", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, flex: "none" }}>
          !
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Quiz diagnostic · 7/10</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Gap found: boundary layer separation</span>
        </div>
      </div>
      <div
        className="float f4"
        style={{ right: -26, bottom: -24, transform: "translateZ(110px)", background: "var(--yellow)", color: "var(--on-yellow)", borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", border: 0 }}
      >
        <Wave on={motion} />
        <span>Reading aloud</span>
      </div>
    </div>
  );
}

const TICKER_A = ["MOSFET Circuits", "Navier–Stokes Derivation", "Rankine Cycle", "Mechatronics Sensor Fusion", "Kerala Building Rules 2025", "Digital Signal Processing"];
const TICKER_B = ["Strength of Materials", "Power Electronics", "Thermodynamics", "Control Systems", "Fluid Mechanics", "Engineering Mathematics"];

export const Ticker = () => (
  <div className="ticker" aria-hidden="true">
    {[TICKER_A, TICKER_B].map((items, r) => (
      <div key={r} className={`ticker-row${r ? " rev" : ""}`}>
        {items.concat(items).map((s, i) => (
          <span key={i}>
            {s}
            <i />
          </span>
        ))}
      </div>
    ))}
  </div>
);

const STEPS = [
  ["Plan", "Upload your syllabus. Get a mind map.", "Drop in your syllabus PDF. AI pulls out every topic and subtopic into a visual mind map, then paces them across the weeks before your exam.", ["Syllabus mind map", "Paced to your exam"]],
  ["Learn", "Learn at your level, then climb.", "Generate a project on any topic at four levels, from school basics to postgraduate depth. Start where you’re comfortable; support fades as you get stronger.", ["4 difficulty levels", "Verified sources", "Read aloud"]],
  ["Diagnose", "Quiz yourself instead of re-reading.", "Every topic becomes a quiz calibrated to your level. Recall builds memory far better than review, and your gaps show up by name.", ["Calibrated quizzes", "Gaps by topic"]],
  ["Earn", "Turn recall into a game.", "1v1 quiz duels and leaderboards keep you practising. Points from modules, streaks and wins convert to real rewards.", ["1v1 duels", "Leaderboards", "Real rewards"]],
];

const paneClass = (i, step) => `pane${i === step ? " on" : i < step ? " before" : ""}`;

/** "How it works": scroll-driven steps on the left, a sticky preview panel on the right. */
export function HowItWorks() {
  const [step, setStep] = useState(0);
  const stepsRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const els = stepsRef.current ? stepsRef.current.querySelectorAll("[data-step]") : [];
        const mid = window.innerHeight * 0.5;
        let a = 0;
        els.forEach((el, i) => {
          if (el.getBoundingClientRect().top < mid) a = i;
        });
        setStep(a);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goStep = (i) => {
    const el = stepsRef.current && stepsRef.current.querySelectorAll("[data-step]")[i];
    if (!el) return;
    const b = el.getBoundingClientRect();
    window.scrollBy({ top: b.top + b.height / 2 - window.innerHeight * 0.45, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className="how-grid">
      <div className="steps" ref={stepsRef}>
        <div className="rail" />
        <div className="rail-fill" style={{ height: `calc((100% - 56vh) * ${(step / 3).toFixed(3)})` }} />
        {STEPS.map(([kicker, title, body, chips], i) => (
          <div key={kicker} data-step={i} className={`step${i === step ? " on" : ""}${i < step ? " past" : ""}`}>
            <div className="step-n mono">0{i + 1}</div>
            <div className="step-card">
              <span className="k">{kicker}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <div className="chips">
                {chips.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" aria-hidden="true">
        <div className="panel-bg grid-bg">
          <div className="panel-circle" style={{ transform: `translate(${-step * 46}px, ${-step * 34}px)` }} />
          <div key={step} className="big-num">
            0{step + 1}
          </div>
        </div>
        <div className="tabs">
          {STEPS.map(([k], i) => (
            <button key={k} type="button" tabIndex={-1} className={i === step ? "on" : ""} onClick={() => goStep(i)}>
              {k}
            </button>
          ))}
        </div>

        <div className={paneClass(0, step)}>
          <div className="pane-card">
            <div style={{ border: "1.5px dashed var(--line-2)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, background: "var(--deep)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="doc-ico" style={{ background: "#3A1A22", color: "#FF8A8A" }}>
                  PDF
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ME204_Fluid_Mechanics_Syllabus.pdf</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Parsed · 5 modules · 31 topics</span>
                </div>
                <span className="pill pill-green">Done</span>
              </div>
              <div className="bar" style={{ height: 4 }}>
                <div className="grow" />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Your roadmap</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                4 weeks to exam
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Fluid properties & statics", "Fluid kinematics", "Bernoulli & energy", "Navier–Stokes"].map((m, i) => (
                <div key={m} className="row-box" data-i={i + 1}>
                  <span className="mono y" style={{ fontSize: 12 }}>
                    M{i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{m}</span>
                  <span className="pill pill-blue">Week {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={paneClass(1, step)}>
          <div className="pane-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                CONCEPT · STEP 2 OF 5
              </span>
              <span className="pill pill-green">Verified source</span>
            </div>
            <div className="seg">
              <span>Primary</span>
              <span>High school</span>
              <span className="on">Undergrad</span>
              <span>Postgrad</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>The continuity equation</span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
              Mass entering a control volume equals mass leaving it, plus whatever accumulates inside. For incompressible flow, density drops out.
            </p>
            <div className="formula mono" data-i="1">
              ∂u/∂x + ∂v/∂y + ∂w/∂z = 0
            </div>
            <div className="chips" data-i="2">
              <span className="chip" style={{ color: "var(--ink)" }}>
                ▸ Read aloud
              </span>
              <span className="chip" style={{ color: "var(--ink)" }}>
                Textbook · Ch 4, p. 112
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="bar" style={{ flex: 1, height: 5, background: "var(--line)" }}>
                  {i < 2 && <div className="grow" style={{ background: "var(--blue)", transitionDelay: `${0.3 + i * 0.5}s` }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={paneClass(2, step)}>
          <div className="pane-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                QUIZ DIAGNOSTIC · MODULE 4
              </span>
              <span style={{ fontSize: 26, fontWeight: 800 }}>
                7<span style={{ color: "var(--dim)", fontSize: 16 }}>/10</span>
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["GAP", "#FF8A8A", "#3A1A22", "Boundary layer separation"],
                ["WEAK", "#FFB066", "#3A2716", "Reynolds number regimes"],
                ["STRONG", "#5FD39E", "#12352A", "Bernoulli’s equation"],
                ["STRONG", "#5FD39E", "#12352A", "Continuity equation"],
              ].map(([tag, fg, bg, label], i) => (
                <div key={label} className="diag" data-i={i + 1} style={{ background: bg }}>
                  <b style={{ color: fg }}>{tag}</b>
                  {label}
                </div>
              ))}
            </div>
            <div className="btn btn-y" style={{ padding: 13 }}>
              Revise 2 gaps →
            </div>
          </div>
        </div>

        <div className={paneClass(3, step)}>
          <div className="pane-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                  YOUR BALANCE
                </span>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1 }}>
                  1,240 <span style={{ fontSize: 16, color: "var(--muted)", letterSpacing: 0 }}>pts</span>
                </span>
              </div>
              <span className="pill pill-green" style={{ fontSize: 12 }}>
                +120 this week
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                ["Module 3 completed", "+60"],
                ["Quiz streak · 5 days", "+40"],
                ["Won peer challenge", "+20"],
              ].map(([l, p], i) => (
                <div key={l} data-i={i + 1} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "12px 0", borderBottom: "1px solid var(--track)" }}>
                  <span>{l}</span>
                  <span className="mono" style={{ color: "var(--green)" }}>
                    {p}
                  </span>
                </div>
              ))}
            </div>
            <div className="btn btn-y" style={{ padding: 13 }}>
              Redeem rewards →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ASK = [
  {
    q: "Why does the boundary layer separate on the rear of a cylinder?",
    a: "Past the widest point, pressure rises in the direction of flow: an adverse pressure gradient. Fluid near the wall is already slowed by friction, so it runs out of momentum and reverses. Separation begins where the wall shear stress drops to zero.",
    f: "(∂u/∂y)|wall = 0  →  separation point",
    cites: [
      { src: 0, label: "Textbook · Sec 9.4, p. 318" },
      { src: 2, label: "Slides · Week 5, slide 22" },
    ],
  },
  {
    q: "My class notes write this as τw = 0. Is that the same condition?",
    a: "Yes. Your notes use wall shear stress, τw = μ(∂u/∂y) at the wall. Viscosity μ is never zero, so τw = 0 means the velocity gradient at the wall is zero, which is exactly how the textbook states it.",
    f: "τw = μ (∂u/∂y)|wall = 0",
    cites: [
      { src: 1, label: "Class notes · Lecture 9, p. 4" },
      { src: 0, label: "Textbook · Eq. 9.12, p. 318" },
    ],
  },
];
const SOURCES = [
  ["PDF", "#3A1A22", "#FF8A8A", "Fluid Mechanics", "Reference textbook · 742 pages"],
  ["IMG", "#3A3212", "#F6D23C", "Lecture 9 · Boundary layers", "Class notes · handwritten · 6 pages"],
  ["PPT", "#3A2716", "#FFB066", "ME204 slides · Week 5", "Lecture slides · 38 slides"],
];

/** Ask a Textbook demo: question → search → typed answer with citations, looping while on screen. */
export function AskDemo({ onAddSource }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const motion = !prefersReducedMotion();
  const [ask, setAsk] = useState(motion ? { q: 0, stage: 0, chars: 0 } : { q: 0, stage: 4, chars: 999 });
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (!onScreen || !motion) return undefined;
    const { q, stage, chars } = ask;
    const d = ASK[q];
    const next =
      stage === 0 ? [500, { stage: 1 }]
      : stage === 1 ? [800, { stage: 2 }]
      : stage === 2 ? [1400, { stage: 3, chars: 0 }]
      : stage === 3 ? [24, chars + 3 >= d.a.length ? { stage: 4, chars: d.a.length } : { chars: chars + 3 }]
      : stage === 4 ? [5200, { stage: 5 }]
      : [500, { q: (q + 1) % ASK.length, stage: 0, chars: 0 }];
    const t = setTimeout(() => setAsk((s) => ({ ...s, ...next[1] })), next[0]);
    return () => clearTimeout(t);
  }, [ask, onScreen, motion]);

  const d = ASK[ask.q];
  const st = ask.stage;
  const cited = st === 4 ? d.cites.map((c) => c.src) : [];
  const dot = ["#FF8A8A", "#F6D23C", "#FFB066"];
  const status = st === 2 ? "Searching 3 sources…" : st === 3 ? "Writing answer…" : st === 4 ? `${d.cites.length} sources cited` : "Ready";

  return (
    <div className="ask" ref={ref}>
      <div className="ask-lib">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>Your library</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            3 sources
          </span>
        </div>
        {SOURCES.map(([type, bg, fg, title, sub], i) => {
          const c = cited.includes(i);
          return (
            <div key={title} className={`src${c ? " cited" : ""}${st === 4 && !c ? " dim" : ""}`}>
              {st === 2 && motion && <div className="src-scan" style={{ animationDelay: `${i * 0.18}s` }} />}
              <div className="doc-ico" style={{ background: bg, color: fg }}>
                {type}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</span>
              </div>
              <span className="pill pill-y">Cited</span>
            </div>
          );
        })}
        <button
          type="button"
          onClick={onAddSource}
          className="btn"
          style={{ marginTop: "auto", padding: 14, borderRadius: 14, border: "1.5px dashed var(--line-2)", background: "transparent", color: "var(--soft)", fontSize: 13, fontWeight: 700 }}
        >
          + Add textbook or notes
        </button>
      </div>

      <div className="ask-chat" aria-live="off">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>TrueSight AI</span>
          <span className="pill pill-green">Verified sources</span>
          <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
            {status}
          </span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className={`bubble-q fade${st >= 1 && st < 5 ? "" : " off"}`}>{d.q}</div>
          {st === 2 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--muted)" }}>
              <span className="dots">
                <span />
                <span />
                <span />
              </span>
              <span>Searching your textbook, notes and slides…</span>
            </div>
          )}
          <div
            className={`fade${st >= 3 && st < 5 ? "" : " off"}`}
            style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 14, background: "var(--card)" }}
          >
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#DDE2F0", minHeight: "4.9em" }}>
              {st >= 3 ? d.a.slice(0, st === 3 ? ask.chars : d.a.length) : ""}
              {st === 3 && <span className="caret" />}
            </p>
            <div className={`formula mono fade${st === 4 ? "" : " off"}`} style={{ fontSize: 14, padding: "11px 14px", borderRadius: 10 }}>
              {d.f}
            </div>
            <div className={`fade${st === 4 ? "" : " off"}`} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {d.cites.map((c) => (
                <span key={c.label} className="pill pill-blue" style={{ fontSize: 12, fontWeight: 600, padding: "6px 10px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot[c.src] }} />
                  {c.label}
                </span>
              ))}
              <button type="button" className="btn btn-y" style={{ marginLeft: "auto", fontSize: 12, padding: "8px 13px" }} onClick={() => setReading((r) => !r)}>
                <Wave on={reading} />
                <span>{reading ? "Reading…" : "Read aloud"}</span>
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 8px 8px 18px", background: "var(--deeper)" }}>
          <span style={{ flex: 1, fontSize: 14, color: "var(--dim)" }}>Ask about your textbook or notes…</span>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", display: "grid", placeItems: "center", flex: "none" }}>
            <div style={{ width: 8, height: 14, borderRadius: 5, border: "2px solid #fff" }} />
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--yellow)", color: "var(--on-yellow)", display: "grid", placeItems: "center", fontWeight: 800, flex: "none" }}>↑</div>
        </div>
      </div>
    </div>
  );
}

/** Live peer-challenge card: countdown + two score bars racing to 10. */
export function ChallengeCard({ onChallenge, onBrowse }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const [s, setS] = useState({ secs: 272, you: 6, them: 5 });
  useEffect(() => {
    if (!onScreen || prefersReducedMotion()) return undefined;
    const id = setInterval(
      () =>
        setS(({ secs, you, them }) => {
          const n = secs > 0 ? secs - 1 : 299;
          if (you >= 10 || them >= 10) return n % 5 === 0 ? { secs: n, you: 3, them: 2 } : { secs: n, you, them };
          if (n % 3 === 0) return n % 9 === 0 ? { secs: n, you, them: them + 1 } : { secs: n, you: you + 1, them };
          return { secs: n, you, them };
        }),
      1000
    );
    return () => clearInterval(id);
  }, [onScreen]);
  const timer = `${String(Math.floor(s.secs / 60)).padStart(2, "0")}:${String(s.secs % 60).padStart(2, "0")}`;

  return (
    <div className="card" data-reveal="1" ref={ref}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="card-label">Peer challenges</span>
        <span className="pill pill-green" style={{ fontSize: 12, padding: "6px 11px", gap: 8 }}>
          <span className="live-dot" />
          <span>Live · ends in</span>
          <span className="mono" style={{ fontWeight: 500 }}>
            {timer}
          </span>
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 26, lineHeight: 1.25, fontWeight: 800, letterSpacing: "-.025em" }}>Challenge a classmate on any topic and put points on the line.</p>
      <div style={{ marginTop: "auto", border: "1px solid var(--line)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "var(--deep)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Thermal &amp; Energy · 10 questions</span>
          <span className="mono y" style={{ fontSize: 13 }}>
            50 pts on the line
          </span>
        </div>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.01em" }}>Rankine Cycle Efficiency Sprint</span>
        {[
          ["You", "You", s.you, "var(--yellow)", { background: "var(--yellow)", color: "var(--on-yellow)" }],
          ["AK", "Arjun K.", s.them, "var(--blue)", { background: "var(--navy)", color: "#fff", border: "1px solid var(--line-2)" }],
        ].map(([ini, name, score, color, av]) => (
          <div key={name} className="vs">
            <div className="avatar" style={av}>
              {ini}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{name}</span>
              <div className="bar">
                <div style={{ width: `${score * 10}%`, background: color }} />
              </div>
            </div>
            <span className="mono" style={{ fontSize: 13, textAlign: "right" }}>
              {score}/10
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-y" style={{ flex: 1, padding: 13 }} onClick={onChallenge}>
            Challenge a classmate
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBrowse}>
            Browse topics
          </button>
        </div>
      </div>
    </div>
  );
}

/** Counts up to `to` the first time it scrolls into view. */
export function CountUp({ to }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const [n, setN] = useState(prefersReducedMotion() ? to : 0);
  const raf = useRef(null);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    // Runs once; scrolling away mid-count must not cancel it.
    if (!onScreen || raf.current !== null || prefersReducedMotion()) return;
    const t0 = performance.now();
    const f = (now) => {
      const p = Math.min(1, (now - t0) / 1700);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
  }, [onScreen, to]);
  return <span ref={ref}>{n.toLocaleString("en-US")}</span>;
}
