import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../../contexts/AuthContext";
import { getCurrentDailyQuestion, getEvents, getRewards, getUser } from "../../utils/apiServices";
import { toEventView } from "../../truesights/eventView";
import mark from "../../assets/landing/truesight-mark.png";
import { AskDemo, ChallengeCard, CountUp, Highlight, HeroRoadmap, HowItWorks, Ticker, prefersReducedMotion } from "./Animated";
import { DailyQuestionModal, RegisterModal, WordQuestModal } from "./LandingModals";
import "./landing.css";

const BACKEND = (process.env.REACT_APP_BACKEND_URL || "http://localhost:5001").replace(/\/$/, "");
const assetUrl = (url) => (!url ? null : /^(https?:|data:)/.test(url) ? url : `${BACKEND}${url.startsWith("/") ? "" : "/"}${url}`);

const DASHBOARDS = {
  "Institute Admin": "/institutedashboard/institute-details",
  "Level-1": "/l1dashboard/dashboard",
  "Level-2": "/l2dashboard/dashboard",
};

/** The next three upcoming events, soonest first. */
const upcomingEvents = (events) => {
  const now = Date.now();
  return events
    .filter((e) => !e.dateTimeStart || new Date(e.dateTimeEnd || e.dateTimeStart).getTime() >= now)
    .sort((a, b) => new Date(a.dateTimeStart || 0) - new Date(b.dateTimeStart || 0))
    .slice(0, 3)
    .map((e) => ({ ...toEventView(e), image: e.imageUrl || e.bannerUrl || toEventView(e).image }));
};

/** Rewards flagged for the landing page, else one per category; at most three. */
const landingRewards = (rewards) => {
  let picked = rewards.filter((r) => r.landingPage === true);
  if (!picked.length) {
    const seen = new Set();
    picked = rewards.filter((r) => !seen.has(r.category) && seen.add(r.category));
  }
  return picked.slice(0, 3);
};

/**
 * Scroll reveals, highlight circles and chart growth: elements carrying
 * data-reveal / data-hl / data-grow get .is-in the first time they're on
 * screen. Re-scans when `rescanKey` changes (async content arrived).
 */
function useReveal(rootRef, rescanKey) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return undefined;
    root.classList.add("is-motion");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }),
      { threshold: 0.18 }
    );
    root.querySelectorAll("[data-reveal]:not(.is-in),[data-hl]:not(.is-in),[data-grow]:not(.is-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, rescanKey]);
}

/** Scroll progress (--sp), hero parallax (--hp), CTA ring scale (--cp), hero lens + tilt. */
function useScrollEffects(rootRef, heroRef, ctaRef) {
  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const motion = !prefersReducedMotion();
    let sraf = null;
    let heroVisible = true;
    const onScroll = () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = null;
        const vh = window.innerHeight || 800;
        const doc = document.documentElement;
        root.style.setProperty("--sp", Math.min(1, Math.max(0, window.scrollY / Math.max(1, doc.scrollHeight - vh))).toFixed(4));
        if (hero) {
          const hr = hero.getBoundingClientRect();
          heroVisible = hr.bottom > 0 && hr.top < vh;
          if (motion) hero.style.setProperty("--hp", Math.min(1, Math.max(0, -hr.top / Math.max(1, hr.height))).toFixed(4));
        }
        const cta = ctaRef.current;
        if (cta && motion) {
          const cr = cta.getBoundingClientRect();
          cta.style.setProperty("--cp", Math.min(1, Math.max(0, (vh - cr.top) / (vh + cr.height))).toFixed(4));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // Lens: drifts on its own, follows the pointer for a while after it moves.
    const m = { x: 0, y: 0, tx: 0, ty: 0, lx: null, ly: null, tlx: 0, tly: 0, last: -1e9 };
    let lraf = null;
    const loop = (t) => {
      if (hero && heroVisible) {
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;
        if (performance.now() - m.last > 2600) {
          const s = t / 1000;
          m.tlx = w * (0.7 + 0.15 * Math.cos(s * 0.31));
          m.tly = h * (0.48 + 0.2 * Math.sin(s * 0.43));
          m.tx = 0.45 * Math.cos(s * 0.31);
          m.ty = 0.45 * Math.sin(s * 0.43);
        }
        if (m.lx == null) {
          m.lx = m.tlx;
          m.ly = m.tly;
        }
        m.lx += (m.tlx - m.lx) * 0.075;
        m.ly += (m.tly - m.ly) * 0.075;
        m.x += (m.tx - m.x) * 0.06;
        m.y += (m.ty - m.y) * 0.06;
        hero.style.setProperty("--lx", m.lx.toFixed(1) + "px");
        hero.style.setProperty("--ly", m.ly.toFixed(1) + "px");
        hero.style.setProperty("--mx", m.x.toFixed(4));
        hero.style.setProperty("--my", m.y.toFixed(4));
      }
      lraf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      m.tlx = x;
      m.tly = y;
      m.tx = Math.max(-1, Math.min(1, (x / r.width) * 2 - 1));
      m.ty = Math.max(-1, Math.min(1, (y / r.height) * 2 - 1));
      m.last = performance.now();
    };
    const onLeave = () => {
      m.last = performance.now() - 1800;
    };
    if (motion && hero) {
      lraf = requestAnimationFrame(loop);
      hero.addEventListener("mousemove", onMove);
      hero.addEventListener("mouseleave", onLeave);
    } else if (hero) {
      hero.style.setProperty("--lx", hero.offsetWidth * 0.72 + "px");
      hero.style.setProperty("--ly", hero.offsetHeight * 0.42 + "px");
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (sraf) cancelAnimationFrame(sraf);
      if (lraf) cancelAnimationFrame(lraf);
      if (hero) {
        hero.removeEventListener("mousemove", onMove);
        hero.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [rootRef, heroRef, ctaRef]);
}

const SectionHead = ({ n, label, title, lede }) => (
  <div className="sec-head">
    <div data-reveal="1">
      <div className="eyebrow serif">
        <b>{n}</b>
        <s />
        <span>{label}</span>
      </div>
      <h2 className="h2">{title}</h2>
    </div>
    {lede && (
      <p className="lede" data-reveal="2">
        {lede}
      </p>
    )}
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const ctaBtnRef = useRef(null);

  const [modal, setModal] = useState(null); // "register" | "daily" | "quest" | null
  const [role, setRole] = useState(null);
  const [events, setEvents] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [daily, setDaily] = useState(undefined); // undefined = loading, null = unavailable
  const [heroOn, setHeroOn] = useState(false);

  useEffect(() => {
    let alive = true;
    getEvents()
      .then((list) => alive && setEvents(upcomingEvents(list)))
      .catch(() => alive && setEvents([]));
    getRewards()
      .then((list) => alive && setRewards(landingRewards(list)))
      .catch(() => alive && setRewards([]));
    getCurrentDailyQuestion()
      .then((q) => alive && setDaily(q || null))
      .catch(() => alive && setDaily(null));
    const uid = Cookies.get("uid");
    if (isAuthenticated && uid) {
      getUser(uid)
        .then((u) => alive && setRole(u?.role || null))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  // Dark page: match the canvas behind it so overscroll doesn't flash white.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#0A0F1F";
    const t = requestAnimationFrame(() => setHeroOn(true));
    return () => {
      document.body.style.background = prev;
      cancelAnimationFrame(t);
    };
  }, []);

  useReveal(rootRef, `${events?.length}-${rewards?.length}`);
  useScrollEffects(rootRef, heroRef, ctaRef);

  const dashboard = DASHBOARDS[role] || "/l2dashboard/dashboard";
  const studentPath = (sub) => (role === "Level-1" ? "/l1dashboard/dashboard" : `/l2dashboard/${sub}`);
  const openRegister = useCallback(() => setModal("register"), []);
  const close = useCallback(() => setModal(null), []);
  const goLogin = useCallback(() => navigate("/login"), [navigate]);
  // Primary call to action: new visitors register, signed-in users go to their app.
  const start = (sub = "dashboard") => (isAuthenticated ? navigate(sub === "dashboard" ? dashboard : studentPath(sub)) : openRegister());

  const ctaMove = (e) => {
    const b = ctaBtnRef.current;
    if (!b || !b.parentElement || prefersReducedMotion()) return;
    const r = b.parentElement.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const k = Math.max(0, 1 - Math.hypot(dx, dy) / 260);
    b.style.transform = `translate(${(dx * 0.3 * k).toFixed(1)}px, ${(dy * 0.3 * k).toFixed(1)}px)`;
  };
  const ctaLeave = () => {
    if (ctaBtnRef.current) ctaBtnRef.current.style.transform = "";
  };

  return (
    <div className="tsl" ref={rootRef}>
      {/* ---------- header ---------- */}
      <div className="tsl-nav-wrap">
        <header className="tsl-nav">
          <a href="#top" className="brand">
            <img src={mark} alt="" />
            <span>TrueSight</span>
          </a>
          <nav aria-label="Sections">
            <a href="#play">Daily play</a>
            <a href="#how">How it works</a>
            <a href="#ask">Ask a Textbook</a>
            <a href="#rewards">Challenges &amp; Rewards</a>
            <a href="#events">Events</a>
          </nav>
          <div className="nav-actions">
            {isAuthenticated ? (
              <button type="button" className="btn btn-y" onClick={() => navigate(dashboard)}>
                Go to dashboard →
              </button>
            ) : (
              <>
                <button type="button" className="nav-login" onClick={goLogin}>
                  Log in
                </button>
                <button type="button" className="btn btn-y" style={{ padding: "11px 20px" }} onClick={openRegister}>
                  Register
                </button>
              </>
            )}
          </div>
          <div className="nav-progress" />
        </header>
      </div>

      {/* ---------- hero ---------- */}
      <section id="top" className="hero-outer">
        <div ref={heroRef} className={`hero${heroOn ? " is-on" : ""}`}>
          <div className="hero-grid" />
          <div className="hero-line h" style={{ top: "30%", transformOrigin: "left" }} />
          <div className="hero-line h" style={{ top: "84%", transformOrigin: "right", transitionDelay: ".15s" }} />
          <div className="hero-line v" style={{ left: "10%", transformOrigin: "top", transitionDelay: ".1s" }} />
          <div className="hero-line v" style={{ left: "56%", transformOrigin: "bottom", transitionDelay: ".25s" }} />
          <div className="lens-grid" />
          <div className="lens" style={{ opacity: heroOn ? 1 : 0, transition: "opacity 1.2s" }}>
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-kicker" data-reveal="1">
                For engineering students who study on their own
              </span>
              <h1 data-reveal="2">
                <Highlight>Self-study</Highlight> from your own syllabus and reference PDFs.
              </h1>
              <p className="hero-sub" data-reveal="3">
                Upload a syllabus, get a paced roadmap, learn at your level, quiz your recall, and earn points you can spend on
                real rewards.
              </p>
              <div className="hero-ctas" data-reveal="4">
                <button type="button" className="btn btn-y" onClick={() => start()}>
                  {isAuthenticated ? "Open my roadmap" : "Build my roadmap"} <span>→</span>
                </button>
                <a href="#how" className="btn-outline-w">
                  See how it works
                </a>
              </div>
            </div>
            <div className="hero-visual" data-reveal="3">
              <HeroRoadmap />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- daily play widgets ---------- */}
      <section id="play" className="play" aria-label="Daily play">
        <button type="button" className="play-card grid-bg" data-reveal="1" onClick={() => setModal("daily")}>
          <div className="play-icon">?</div>
          <div className="play-meta">
            <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="t">Daily question</span>
              <span className="pill pill-green">
                <span className="live-dot" /> Today
              </span>
              <span className="mono y" style={{ fontSize: 12 }}>
                +5 pts
              </span>
            </span>
            {daily === undefined ? (
              <span className="skeleton" style={{ height: 18, width: "80%" }} />
            ) : (
              <span className="q" style={{ color: "#D5DBEE" }}>
                {daily ? daily.question : "A new question every day. Answer it in one try."}
              </span>
            )}
          </div>
          <span className="play-go" aria-hidden="true">
            →
          </span>
        </button>
        <button type="button" className="play-card" data-reveal="2" onClick={() => setModal("quest")}>
          <div className="play-icon alt serif" style={{ fontSize: 28 }}>
            W
          </div>
          <div className="play-meta">
            <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="t">Word Quest</span>
              <span className="pill pill-blue">60-second riddle</span>
              <span className="mono y" style={{ fontSize: 12 }}>
                +10 pts
              </span>
            </span>
            <span className="q">Crack a timed riddle. Every first solve adds points to your rewards balance.</span>
          </div>
          <span className="play-go" aria-hidden="true">
            →
          </span>
        </button>
      </section>

      <Ticker />

      {/* ---------- why ---------- */}
      <section id="why" className="sec" style={{ paddingTop: 120, paddingBottom: 20 }}>
        <div data-reveal="1" style={{ maxWidth: 900, marginBottom: 48 }}>
          <h2 className="h2">There’s no shortage of content. There’s a shortage of ways to learn from it.</h2>
        </div>
        <div className="cols" style={{ marginBottom: 56 }}>
          {[
            ["i.", "Content is everywhere", "Syllabi, PDFs, textbooks, notes, recorded lectures. What matters is whether it’s credible and covers your syllabus."],
            ["ii.", "Re-reading is passive", "Read, re-read, highlight. It feels productive, but it doesn’t build long-term recall. And distractions are one tab away."],
            ["iii.", "Exams reward recall", "Semester finals or GATE, what counts is recalling the right idea at the right time."],
          ].map(([n, t, b], i) => (
            <div key={n} className="col" data-reveal={i + 1}>
              <span className="serif y" style={{ fontSize: 22 }}>
                {n}
              </span>
              <span className="col-t" style={{ fontSize: 20 }}>
                {t}
              </span>
              <span className="col-b">{b}</span>
            </div>
          ))}
        </div>
        <div className="why-box" data-reveal="1">
          <p>
            TrueSight doesn’t sell you more content. It makes the content you <span className="y">already have</span> learnable.
          </p>
          <div style={{ overflowX: "auto" }}>
            <div className="flowmap">
              <div className="flowmap-col">
                <span className="serif">What you already have</span>
                {[
                  ["PDF", "#FF8A8A", "Syllabus"],
                  ["PDF", "#FF8A8A", "Reference textbooks"],
                  ["IMG", "#F6D23C", "Class notes"],
                  ["PPT", "#FFB066", "Lecture slides"],
                ].map(([t, c, l]) => (
                  <div key={l} className="flowmap-row">
                    <span className="fm-item">
                      <span className="fm-type mono" style={{ color: c }}>
                        {t}
                      </span>
                      {l}
                    </span>
                    <div className="flow" />
                  </div>
                ))}
              </div>
              <div className="hub">
                <div className="hub-ring" />
                <img src={mark} alt="TrueSight" />
              </div>
              <div className="flowmap-col">
                <span className="serif" style={{ textAlign: "right" }}>
                  What you get
                </span>
                {["A mind map of every topic", "Answers from your own pages", "Quizzes at your level", "Points & real rewards"].map((l) => (
                  <div key={l} className="flowmap-row">
                    <div className="flow" />
                    <span className="fm-item out">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="sec" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <SectionHead
          n="01"
          label="How it works"
          title={
            <>
              From a PDF syllabus to exam-ready, in <Highlight>four moves</Highlight>.
            </>
          }
          lede="One loop, repeated for every module: plan it, learn it, test it, get rewarded for it."
        />
        <HowItWorks />
      </section>

      {/* ---------- ask a textbook ---------- */}
      <section id="ask" className="sec">
        <SectionHead
          n="02"
          label="Ask a Textbook"
          title={
            <>
              Learn from the books and notes <Highlight>your course</Highlight> actually uses.
            </>
          }
          lede="Upload your own textbooks, notes and slides. TrueSight indexes them into thousands of searchable passages, so answers are grounded in your material, not a generic web reply, and point to the exact page they came from."
        />
        <div data-reveal="1">
          <AskDemo onAddSource={() => start("ask-a-textbook")} />
        </div>
        <div className="cols" style={{ marginTop: 32 }}>
          {[
            ["Reference textbooks", "Add the books on your reading list. Every answer cites chapter, section and page."],
            ["Class notes & slides", "Upload lecture slides, handwritten notes or photos of the board, and ask what any page means."],
            ["Turn answers into practice", "Generate practice questions from any chapter or lecture, with worked solutions that cite the same pages."],
          ].map(([t, b], i) => (
            <div key={t} className="col" data-reveal={i + 1}>
              <span className="col-n mono">0{i + 1}</span>
              <span className="col-t">{t}</span>
              <span className="col-b">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- science ---------- */}
      <section id="science" className="sec">
        <SectionHead
          n="03"
          label="Why it works"
          title="Built on how memory actually works."
          lede="Every feature maps to a well-studied learning technique. Two of the biggest findings shaped the product."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 20, marginBottom: 56 }}>
          <div className="card" data-reveal="1" data-grow="1">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
              <span className="card-label">Retrieval practice</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
                Roediger &amp; Karpicke, 2006
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2 }}>What students remembered a week later</span>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Same passage, three ways of studying it</span>
            </div>
            <div className="bars">
              {[
                ["Re-read 4 times", 40, "var(--blue)", 0.1],
                ["Read 3×, quiz once", 56, "var(--blue)", 0.25],
                ["Read once, quiz 3×", 61, "var(--yellow)", 0.4],
              ].map(([l, v, c, d], i) => (
                <div key={l}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: i === 2 ? "var(--ink)" : "var(--muted)" }}>{l}</span>
                  <div className="track">
                    <div style={{ width: `${v}%`, background: c, transitionDelay: `${d}s` }} />
                  </div>
                  <span className="mono" style={{ fontSize: 16, textAlign: "right", color: i === 2 ? "var(--yellow)" : "var(--ink)" }}>
                    {v}%
                  </span>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, marginTop: "auto", paddingTop: 18, borderTop: "1px solid var(--line)", fontSize: 15, lineHeight: 1.55, color: "#DDE2F0" }}>
              Quizzing beats re-reading. That’s why every topic in TrueSight ends in a quiz.
            </p>
          </div>
          <div className="card grid-bg" data-reveal="2" data-grow="1" style={{ border: 0, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
              <span className="card-label">Mastery learning</span>
              <span className="mono" style={{ fontSize: 11, color: "#C9D1EA" }}>
                Bloom, 1984
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2 }}>The 2-sigma effect</span>
              <span style={{ fontSize: 14, color: "#C9D1EA" }}>One-to-one mastery tutoring vs. a regular classroom</span>
            </div>
            <SigmaChart />
            <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.18)", marginTop: "auto" }}>
              <span className="y" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, flex: "none" }}>
                98<span style={{ fontSize: 20 }}>th</span>
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: "#DDE2F0" }}>
                percentile, where the average tutored student landed. Level-based practice brings that kind of personal support to self-study.
              </span>
            </div>
          </div>
        </div>
        <div className="cols" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "32px 28px" }}>
          {[
            ["Scaffolding & ZPD", "Start at a level you can handle, with support that fades as you get stronger.", "Four-level topic projects", "Wood, Bruner & Ross, 1976 · Vygotsky"],
            ["Mind maps & schema", "Seeing how topics connect builds mental structure and lightens the load.", "Syllabus mind map", "Novak · Sweller"],
            ["Retrieval practice", "Recalling an answer strengthens memory far more than reviewing it.", "Topic quizzes & 1v1 duels", "Roediger & Karpicke, 2006"],
            ["Spaced practice", "Spreading practice over weeks fights forgetting.", "Roadmap paced to your exam", "Cepeda et al., 2006"],
            ["Active processing", "Asking questions and explaining ideas makes them stick.", "Ask a Textbook", "Chi · Bjork"],
            ["Mastery learning", "Move up a level once you’ve mastered it, not when the calendar says.", "Level-based progression", "Bloom, 1984"],
          ].map(([t, b, f, c], i) => (
            <div key={t} className="col" data-reveal={(i % 3) + 1}>
              <span className="col-t">{t}</span>
              <span className="col-b">{b}</span>
              <span className="y" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700 }}>
                <span>→</span>
                {f}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
                {c}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- exams ---------- */}
      <section id="exams" className="sec">
        <SectionHead
          n="04"
          label="Exam prep"
          title="Practice built around the exam you’re attempting."
          lede="MCQ and practice sets follow your exam’s pattern, difficulty and syllabus. Each exam family gets its own space and community."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 20 }}>
          <div className="card grid-bg" data-reveal="1" style={{ position: "relative", overflow: "hidden", color: "#fff", borderRadius: 24, gap: 18, borderColor: "rgba(246,210,60,.45)" }}>
            <div className="ring-deco" style={{ right: -60, top: -60, width: 180, height: 180 }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Science &amp; Engineering</span>
              <span className="pill pill-green" style={{ fontSize: 12, padding: "5px 10px" }}>
                <span className="live-dot" />
                Live
              </span>
            </div>
            <div className="chips" style={{ position: "relative" }}>
              {["GATE", "JAM", "ESE"].map((t) => (
                <span key={t} className="tag-box mono">
                  {t}
                </span>
              ))}
            </div>
            <p style={{ position: "relative", margin: 0, fontSize: 15, lineHeight: 1.6, color: "#DDE2F0" }}>
              MCQ and numerical practice tuned to science and engineering exam patterns, from concept checks to full-difficulty problems.
            </p>
            <button type="button" className="btn btn-y" style={{ position: "relative", marginTop: "auto", alignSelf: "flex-start" }} onClick={() => start("projects")}>
              Start practising →
            </button>
          </div>
          {[
            ["Medical", ["NEET-UG", "NEET-PG", "INI-CET"], "Question banks calibrated to medical-entrance depth, volume and negative marking."],
            ["Public sector", ["UPSC", "SSC CGL", "Banking", "State PSCs"], "Recruitment-style practice built for breadth and speed, with a focus on previous years’ questions."],
          ].map(([t, tags, b], i) => (
            <div key={t} className="card" data-reveal={i + 2} style={{ borderRadius: 24, gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{t}</span>
                <span className="pill pill-blue" style={{ fontSize: 12, padding: "5px 10px" }}>
                  Coming soon
                </span>
              </div>
              <div className="chips" style={{ color: "var(--soft)" }}>
                {tags.map((x) => (
                  <span key={x} className="tag-box mono">
                    {x}
                  </span>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>{b}</p>
              <button type="button" className="btn btn-ghost" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={openRegister}>
                Notify me
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- challenges & rewards ---------- */}
      <section id="rewards" className="sec">
        <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 780, marginBottom: 40 }}>
          <div className="eyebrow serif">
            <b>05</b>
            <s />
            <span>Challenges &amp; Rewards</span>
          </div>
          <h2 className="h2">
            Show what you know. Get <Highlight>something</Highlight> for it.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 20 }}>
          <ChallengeCard onChallenge={() => start("challenges")} onBrowse={() => start("projects")} />
          <div className="card grid-bg" data-reveal="2" style={{ position: "relative", overflow: "hidden", color: "#fff", border: 0 }}>
            <div className="ring-deco" style={{ right: -80, top: -80, width: 260, height: 260 }} />
            <span className="card-label" style={{ position: "relative" }}>
              Rewards catalog
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(64px,7vw,96px)", fontWeight: 800, letterSpacing: "-.05em", lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
                <CountUp to={1240} />
              </span>
              <span style={{ fontSize: 16, color: "#C9D1EA" }}>pts to spend</span>
            </div>
            <div className="rewards-row">
              {rewards === null
                ? [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 210, borderRadius: 16 }} />)
                : rewards.map((r) => {
                    const img = assetUrl(r.image || r.imageUrl);
                    return (
                      <div key={r.id || r.name} className="reward">
                        <div className="reward-img">{img ? <img src={img} alt="" loading="lazy" /> : <img src={mark} alt="" className="ph" />}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 4px", minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || r.title}</span>
                          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                            {(r.pointsRequired || r.points || 0).toLocaleString("en-US")} pts
                          </span>
                        </div>
                        <button type="button" className="btn btn-y" onClick={() => start("rewards")}>
                          Redeem
                        </button>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- events ---------- */}
      <section id="events" className="sec">
        <div className="ev-banner grid-bg" data-reveal="1">
          <div style={{ position: "absolute", left: 0, right: 0, top: "58%", height: 1, background: "rgba(255,255,255,.18)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "44%", width: 1, background: "rgba(255,255,255,.18)" }} />
          <div className="ring-deco" style={{ right: 80, top: "50%", width: 220, height: 220, marginTop: -110, borderColor: "rgba(255,255,255,.32)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <div className="eyebrow serif" style={{ color: "#C9D1EA" }}>
              <b>06</b>
              <s style={{ background: "rgba(255,255,255,.35)" }} />
              <span>Beyond the syllabus</span>
            </div>
            <h2 className="h2" style={{ fontSize: "clamp(34px,4.4vw,56px)" }}>
              Campus &amp; Technical Events
            </h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "#D5DBEE" }}>Workshops, hackathons, expos and talks worth your time.</p>
          </div>
          <button
            type="button"
            className="btn"
            style={{ position: "relative", color: "#fff", fontWeight: 700, padding: "12px 20px", border: "1px solid rgba(255,255,255,.35)", background: "rgba(10,15,31,.25)" }}
            onClick={() => (isAuthenticated ? navigate(role === "Level-1" ? "/l1dashboard/events" : "/l2dashboard/events") : navigate("/events"))}
          >
            View all events →
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {events === null ? (
            [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 110, margin: "10px 0", borderRadius: 18 }} />)
          ) : events.length === 0 ? (
            <div className="ev-empty">No upcoming events right now. Check back soon.</div>
          ) : (
            events.map((ev) => {
              const d = ev.start ? new Date(ev.start) : null;
              return (
                <div key={ev.id} className="ev-row" data-reveal="1">
                  <div className="ev-date">
                    <b>{d ? String(d.getDate()).padStart(2, "0") : "--"}</b>
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      {d ? `${d.toLocaleDateString("en-US", { month: "short" })} · ${d.toLocaleDateString("en-US", { weekday: "short" })}`.toUpperCase() : "TBA"}
                    </span>
                  </div>
                  <div className="ev-img">
                    <img src={ev.image} alt="" loading="lazy" />
                  </div>
                  <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="pill pill-blue" style={{ color: "var(--blue)" }}>
                        {ev.category}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>
                        {ev.location} · {ev.venue}
                      </span>
                    </div>
                    <span className="ev-title">{ev.title}</span>
                  </div>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 18 }}>
                    {ev.registerUrl ? (
                      <a className="btn btn-y" href={ev.registerUrl} target="_blank" rel="noopener noreferrer">
                        Register →
                      </a>
                    ) : (
                      <button type="button" className="btn btn-ghost" onClick={() => navigate("/events")}>
                        Details →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section id="start" className="cta-outer">
        <div className="cta" data-reveal="1" ref={ctaRef} onMouseMove={ctaMove} onMouseLeave={ctaLeave}>
          <div className="cta-ring" style={{ width: 960, height: 960, margin: "-480px 0 0 -480px", border: "1px solid rgba(255,255,255,.14)", transform: "scale(calc(.5 + var(--cp,.6) * .8))" }} />
          <div className="cta-ring" style={{ width: 640, height: 640, margin: "-320px 0 0 -320px", border: "1px solid rgba(255,255,255,.24)", transform: "scale(calc(.6 + var(--cp,.6) * .6))" }} />
          <div className="cta-ring" style={{ width: 380, height: 380, margin: "-190px 0 0 -190px", border: "1px solid rgba(246,210,60,.6)", transform: "scale(calc(.7 + var(--cp,.6) * .5))" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
            <img
              src={mark}
              alt="TrueSight"
              style={{ width: 104, height: 104, display: "block", filter: "drop-shadow(0 12px 30px rgba(4,8,24,.45))", transform: "rotate(calc((var(--cp,.5) - .5) * 135deg))" }}
            />
            <h2 className="h2" style={{ fontSize: "clamp(42px,6.2vw,88px)", lineHeight: 0.98, letterSpacing: "-.045em", maxWidth: 980 }}>
              Your syllabus is already <Highlight>a plan</Highlight>. Start following it.
            </h2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: "#D5DBEE", maxWidth: 520 }}>Upload a syllabus and get a roadmap in under a minute.</p>
            <span style={{ display: "inline-flex", padding: 24 }}>
              <button ref={ctaBtnRef} type="button" className="cta-btn" onClick={() => start()}>
                {isAuthenticated ? "Go to dashboard" : "Register"}
                <span>→</span>
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="foot">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={mark} alt="" style={{ width: 28, height: 28, display: "block" }} />
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>TrueSight Community</span>
          </div>
          <span style={{ lineHeight: 1.6 }}>R519, Purva Park, Jeevanahalli Main Road, Fraser Town, Bangalore North, Karnataka 560005</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ color: "var(--ink)", fontWeight: 700 }}>Support</span>
          <a href="tel:+919746398389">+91 97463 98389</a>
          <button type="button" onClick={() => navigate("/contact")} style={{ textAlign: "left" }}>
            Contact
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ color: "var(--ink)", fontWeight: 700 }}>Company</span>
          <a href="https://www.linkedin.com/in/yadu-aravind-a493375a/" target="_blank" rel="noopener noreferrer">
            Founder · Yadu Aravind
          </a>
          <button type="button" onClick={() => navigate("/privacy-policy")} style={{ textAlign: "left" }}>
            Privacy policy
          </button>
        </div>
        <span style={{ alignSelf: "flex-end" }}>© {new Date().getFullYear()} TrueSight Community</span>
      </footer>

      {modal === "register" && <RegisterModal onClose={close} onLogin={goLogin} />}
      {modal === "daily" && (
        <DailyQuestionModal onClose={close} isAuthenticated={isAuthenticated} initialQuestion={daily || null} onRegister={openRegister} />
      )}
      {modal === "quest" && <WordQuestModal onClose={close} isAuthenticated={isAuthenticated} onRegister={openRegister} onLogin={goLogin} />}
    </div>
  );
}

// Bloom's two distributions, pre-computed in the design hand-off (normal curves, 2σ apart).
const curve = (mu) =>
  Array.from({ length: 91 }, (_, i) => {
    const x = (i * 400) / 90;
    const y = 168 - 138 * Math.exp(-((x - mu) ** 2) / (2 * 44.4 ** 2));
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

const SigmaChart = () => (
  <svg viewBox="0 0 400 190" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} aria-label="Two bell curves: the tutored average sits two standard deviations above the classroom average">
    <line x1="0" y1="168" x2="400" y2="168" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
    <path className="curve" d={`${curve(155.6)} Z`} fill="rgba(143,166,255,.16)" stroke="#8FA6FF" strokeWidth="2" pathLength="1" style={{ transitionDelay: ".1s" }} />
    <path className="curve" d={curve(244.4)} fill="none" stroke="#F6D23C" strokeWidth="2.5" pathLength="1" style={{ transitionDelay: ".6s" }} />
    <line x1="155.6" y1="30" x2="155.6" y2="168" stroke="#8FA6FF" strokeDasharray="3 4" strokeWidth="1" />
    <line x1="244.4" y1="30" x2="244.4" y2="168" stroke="#F6D23C" strokeDasharray="3 4" strokeWidth="1" />
    <g className="sigma">
      <line x1="161.6" y1="18" x2="237.4" y2="18" stroke="#fff" strokeWidth="1.5" />
      <path d="M230.4 13 L238.4 18 L230.4 23" fill="none" stroke="#fff" strokeWidth="1.5" />
      <text x="200" y="10" fill="#fff" fontSize="13" fontWeight="800" textAnchor="middle">
        +2σ
      </text>
    </g>
    <text x="155.6" y="186" fill="#C9D1EA" fontSize="11" textAnchor="middle">
      Classroom average
    </text>
    <text x="244.4" y="186" fill="#F6D23C" fontSize="11" textAnchor="middle">
      Tutored average
    </text>
  </svg>
);
