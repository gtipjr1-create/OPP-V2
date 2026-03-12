import { useState, useRef } from "react";

const PRIORITY_WEIGHT = { HIGH: 3, NORMAL: 2, LOW: 1 };

const archivedData = [
  {
    id: 1,
    name: "Sunday / 3·8·26",
    date: "Mar 8, 2026",
    tasks: [
      { priority: "HIGH",   done: true  },
      { priority: "NORMAL", done: true  },
      { priority: "NORMAL", done: true  },
      { priority: "LOW",    done: false },
    ],
  },
  {
    id: 2,
    name: "Saturday / 3·7·26",
    date: "Mar 7, 2026",
    tasks: [
      { priority: "HIGH",   done: true  },
      { priority: "HIGH",   done: false },
      { priority: "NORMAL", done: true  },
    ],
  },
  {
    id: 3,
    name: "Friday / 3·6·26",
    date: "Mar 6, 2026",
    tasks: [
      { priority: "NORMAL", done: true },
      { priority: "NORMAL", done: true },
      { priority: "LOW",    done: true },
      { priority: "LOW",    done: true },
    ],
  },
  {
    id: 4,
    name: "Thursday / 3·5·26",
    date: "Mar 5, 2026",
    tasks: [
      { priority: "HIGH",   done: true  },
      { priority: "NORMAL", done: false },
      { priority: "LOW",    done: false },
    ],
  },
  {
    id: 5,
    name: "Wednesday / 3·4·26",
    date: "Mar 4, 2026",
    tasks: [
      { priority: "HIGH",   done: true },
      { priority: "HIGH",   done: true },
      { priority: "NORMAL", done: true },
      { priority: "NORMAL", done: true },
      { priority: "LOW",    done: true },
    ],
  },
];

function getMetrics(tasks) {
  const total        = tasks.length;
  const done         = tasks.filter(t => t.done).length;
  const totalPts     = tasks.reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] || 2), 0);
  const earnedPts    = tasks.filter(t => t.done).reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] || 2), 0);
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const weightedPct   = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0;
  return { completionPct, weightedPct, total, done };
}

function getPctColor(pct) {
  if (pct <= 50) {
    const t = pct / 50;
    return `rgb(255,${Math.round(69 + 111 * t)},${Math.round(58 - 58 * t)})`;
  }
  const t = (pct - 50) / 50;
  return `rgb(${Math.round(255 - 203 * t)},${Math.round(180 + 19 * t)},${Math.round(89 * t)})`;
}

// ── CONFIRM DELETE SHEET ──
const ConfirmDeleteSheet = ({ sessionName, onConfirm, onClose }) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
    <div style={{ position: "relative", background: "#0d0d0d", borderRadius: "20px 20px 0 0", border: "1px solid #1e1e1e", borderBottom: "none", padding: "20px 20px 36px", animation: "sheetUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#f0f0f0", marginBottom: 8 }}>Delete session?</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#555", marginBottom: 24 }}>
        "{sessionName}" will be permanently removed.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose}    style={{ flex: 1, padding: "13px", borderRadius: 12, background: "transparent", border: "1px solid #222222", color: "#666", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
        <button onClick={onConfirm}  style={{ flex: 1, padding: "13px", borderRadius: 12, background: "#FF453A", border: "none", color: "white", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Delete</button>
      </div>
    </div>
  </div>
);

// ── SESSION ROW ──
function SessionRow({ session, onDelete }) {
  const swipeX  = useRef(0);
  const startX  = useRef(0);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = -90;

  const { completionPct, weightedPct, total, done } = getMetrics(session.tasks);
  const completionColor = getPctColor(completionPct);
  const weightedColor   = getPctColor(weightedPct);

  const onTouchStart = e => { startX.current = e.touches[0].clientX; };
  const onTouchMove  = e => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) return;
    swipeX.current = Math.max(dx, -110);
    setOffset(swipeX.current);
  };
  const onTouchEnd = () => {
    if (swipeX.current < THRESHOLD) onDelete(session.id);
    setOffset(0);
    swipeX.current = 0;
  };

  const reveal = Math.min(Math.abs(offset), 110);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #222" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: reveal, background: "#FF453A", display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.1s ease" }}>
        {reveal > 20 && <span style={{ fontSize: 12, color: "white", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em" }}>DELETE</span>}
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", transform: `translateX(${offset}px)`, transition: offset !== 0 ? "none" : "transform 0.38s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Left: name + date + task count */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#d0d0d0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>
            {session.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#3a3a3a" }}>{session.date}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#333" }}>{done}/{total} tasks</span>
          </div>
        </div>

        {/* Right: completion pills */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {[{ label: "C", value: `${completionPct}%`, color: completionColor }, { label: "W", value: `${weightedPct}%`, color: weightedColor }].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 10px", borderRadius: 10, background: `${color}18`, border: `1.5px solid ${color}55` }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color, opacity: 0.5, letterSpacing: "0.08em", marginTop: 2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function ArchivedSessions({ onNavigate }) {
  const [sessions, setSessions] = useState(archivedData);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const confirmSession = sessions.find(s => s.id === confirmDeleteId);

  const confirmDelete = () => {
    setSessions(prev => prev.filter(s => s.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const totalSessions   = sessions.length;
  const avgCompletion   = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + getMetrics(s.tasks).completionPct, 0) / totalSessions)
    : 0;
  const avgColor = getPctColor(avgCompletion);

  return (
    <div style={{ height: "100vh", background: "#0d0d0d", display: "flex", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        *:not(input) { -webkit-user-select: none; user-select: none; }
        @keyframes sheetUp { from { transform: translateY(100%); opacity: 0.8; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", height: "100vh", position: "relative", overflow: "hidden" }}>

        {/* TOP NAV */}
        <div style={{ position: "relative", height: 36, flexShrink: 0 }} />

        {/* HERO */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10, flexShrink: 0 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, color: "#f0f0f0", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            Archive
          </h1>
        </div>

        {/* STATUS CHIPS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4, flexShrink: 0 }}>
          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4a4a", border: "1px solid #1e1e1e" }}>Past Sessions</span>
          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: "#555", border: "1px solid #1e1e1e" }}>{totalSessions} archived</span>
        </div>

        {/* META */}
        <div style={{ textAlign: "center", fontSize: 10, color: "#333", marginBottom: 10, flexShrink: 0, letterSpacing: "0.02em" }}>
          {totalSessions} sessions&nbsp;&nbsp;·&nbsp;&nbsp;avg completion tracked
        </div>

        {/* AVG PILL */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, flexShrink: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 20, background: `${avgColor}18`, border: `1.5px solid ${avgColor}55` }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 700, color: avgColor }}>{avgCompletion}%</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, color: avgColor, opacity: 0.6, letterSpacing: "0.08em" }}>AVG COMPLETION</span>
          </div>
        </div>

        {/* SESSION LIST CARD */}
        <div style={{ margin: "0 14px 0", background: "#111111", borderRadius: 16, padding: "14px 16px 16px", border: "1px solid #1a1a1a", flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, color: "#555", letterSpacing: "0.1em" }}>SESSION HISTORY</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {sessions.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#333", letterSpacing: "0.08em" }}>NO ARCHIVED SESSIONS</span>
              </div>
            ) : (
              sessions.map(session => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onDelete={id => setConfirmDeleteId(id)}
                />
              ))
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ margin: "0 14px 14px", borderTop: "1px solid #181818", paddingTop: 11, flexShrink: 0 }}>
          <button onClick={() => onNavigate?.("active")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "4px 2px" }}
            onMouseEnter={e => e.currentTarget.querySelector("span").style.color = "#4A9EFF"}
            onMouseLeave={e => e.currentTarget.querySelector("span").style.color = "#383838"}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: "#4a4a4a", letterSpacing: "0.08em", transition: "color 0.15s ease" }}>← Active Session</span>
          </button>
        </div>

        {/* CONFIRM DELETE */}
        {confirmDeleteId && confirmSession && (
          <ConfirmDeleteSheet
            sessionName={confirmSession.name}
            onConfirm={confirmDelete}
            onClose={() => setConfirmDeleteId(null)}
          />
        )}

      </div>
    </div>
  );
}
