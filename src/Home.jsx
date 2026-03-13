import { useState } from "react";
import BottomNav from "./BottomNav";

const SHEET_STYLE = {
  position: "relative",
  background: "#000000",
  borderRadius: "20px 20px 0 0",
  border: "1px solid #1e1e1e",
  borderBottom: "none",
  padding: "20px 20px 36px",
  animation: "sheetUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
};

const SHEET_HANDLE = {
  width: 36,
  height: 4,
  background: "#333",
  borderRadius: 2,
  margin: "0 auto 20px",
};

const WeekAnchorsSheet = ({ anchors, setAnchors, onClose }) => {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const MAX = 3;
  const atCap = anchors.length >= MAX;

  const handleAdd = () => {
    if (!input.trim()) return;
    if (editingId) {
      setAnchors((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, text: input.trim() } : a))
      );
      setEditingId(null);
    } else {
      if (atCap) return;
      setAnchors((prev) => [...prev, { id: Date.now(), text: input.trim() }]);
    }
    setInput("");
  };

  const handleEdit = (anchor) => {
    setInput(anchor.text);
    setEditingId(anchor.id);
  };

  const handleRemove = (id) => {
    if (editingId === id) {
      setEditingId(null);
      setInput("");
    }
    setAnchors((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
      />
      <div style={SHEET_STYLE}>
        <div style={SHEET_HANDLE} />
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#555",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          THIS WEEK
        </div>

        {anchors.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            {anchors.map((anchor) => (
              <div
                key={anchor.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <span
                  onClick={() => handleEdit(anchor)}
                  style={{
                    flex: 1,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: editingId === anchor.id ? "#4A9EFF" : "#c0c0c0",
                    cursor: "pointer",
                    lineHeight: 1.35,
                  }}
                >
                  {anchor.text}
                </span>
                <button
                  onClick={() => handleRemove(anchor.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2e2e2e",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 16,
                    cursor: "pointer",
                    padding: "2px 4px",
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FF453A")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2e2e2e")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {(!atCap || editingId) && (
          <>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="What is this week anchored to?"
              style={{
                width: "100%",
                background: "#161616",
                border: `1.5px solid ${editingId ? "rgba(74,158,255,0.4)" : "#222222"}`,
                borderRadius: 9,
                color: "#ccc",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                padding: "10px 12px",
                outline: "none",
                marginBottom: 14,
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                background: input.trim() ? "#4A9EFF" : "#161616",
                border: `1px solid ${input.trim() ? "transparent" : "#222"}`,
                color: input.trim() ? "white" : "#333",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            >
              {editingId ? "Update" : "Add"}
            </button>
          </>
        )}

        {atCap && !editingId && (
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              background: "#4A9EFF",
              border: "none",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default function Home({ onNavigate, sessionName, domains, priorities, weekAnchors, setWeekAnchors }) {
  const [weekOpen, setWeekOpen] = useState(false);
  const activeDomains = domains.filter((dom) => dom.status === "Active");
  const activePriorities = priorities.filter((p) => !p.deferred);
  const topPriorities = activePriorities.slice(0, 3);

  const sessionMeta = [
    activePriorities.length > 0 ? `${activePriorities.length} ${activePriorities.length === 1 ? "priority" : "priorities"}` : null,
    activeDomains.length > 0 ? `${activeDomains.length} active` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const CARD = {
    background: "#111111",
    border: "1px solid #1e1e1e",
    borderRadius: 16,
    padding: "16px 18px",
    marginBottom: 10,
  };

  return (
    <div
      style={{
        height: "100dvh",
        background: "#000000",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        *:not(input) { -webkit-user-select: none; user-select: none; }
        @keyframes sheetUp { from { transform: translateY(100%); opacity: 0.8; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          paddingTop: "max(10px, env(safe-area-inset-top))",
        }}
      >
        {/* Top spacer */}
        <div style={{ height: 20, flexShrink: 0 }} />

        {/* Scrollable cards */}
        <div style={{ flex: 1, overflowY: "auto", paddingInline: 20 }}>

          {/* ── 1. DAY / STATE ── */}
          <div
            onClick={() => onNavigate("active")}
            style={{ ...CARD, cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#f0f0f0",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                {sessionName}
              </div>
              <span style={{ color: "#2a2a2a", fontSize: 18, flexShrink: 0, paddingTop: 3 }}>›</span>
            </div>

            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "#4A9EFF",
                letterSpacing: "0.1em",
                marginBottom: sessionMeta ? 6 : 0,
              }}
            >
              ACTIVE SESSION
            </div>

            {sessionMeta ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: "#3a3a3a",
                  letterSpacing: "0.01em",
                }}
              >
                {sessionMeta}
              </div>
            ) : null}
          </div>

          {/* ── 2. CURRENT FOCUS ── */}
          <div
            onClick={() => onNavigate("priorities")}
            style={{ ...CARD, cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: topPriorities.length > 0 ? 14 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                CURRENT FOCUS
              </span>
              <span style={{ color: "#333", fontSize: 18 }}>›</span>
            </div>

            {topPriorities.length === 0 ? (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#333",
                    fontStyle: "italic",
                    marginBottom: 6,
                  }}
                >
                  No focus locked
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#2a2a2a",
                    letterSpacing: "0.06em",
                  }}
                >
                  Set 1–3 priorities →
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topPriorities.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        color: "#c0c0c0",
                        lineHeight: 1.35,
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9,
                        color: "#444",
                        border: "1px solid #2a2a2a",
                        borderRadius: 4,
                        padding: "2px 6px",
                        letterSpacing: "0.06em",
                        flexShrink: 0,
                      }}
                    >
                      {p.domain.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. THIS WEEK ── */}
          <div
            onClick={() => setWeekOpen(true)}
            style={{ ...CARD, cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: weekAnchors.length > 0 ? 12 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                THIS WEEK
              </span>
              <span style={{ color: "#333", fontSize: 18 }}>›</span>
            </div>

            {weekAnchors.length === 0 ? (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#333",
                    fontStyle: "italic",
                    marginBottom: 6,
                  }}
                >
                  Week not anchored yet
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#2a2a2a",
                    letterSpacing: "0.06em",
                  }}
                >
                  Tap to set 1–3 weekly anchors
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {weekAnchors.map((anchor) => (
                  <div
                    key={anchor.id}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: "#c0c0c0",
                      lineHeight: 1.35,
                    }}
                  >
                    {anchor.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 4. ACTIVE DOMAINS ── */}
          <div
            onClick={() => onNavigate("domains")}
            style={{ ...CARD, cursor: "pointer", marginBottom: 20 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: activeDomains.length > 0 ? 14 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                DOMAINS
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  color: activeDomains.length > 0 ? "#4A9EFF" : "#333",
                  letterSpacing: "0.06em",
                }}
              >
                {activeDomains.length > 0 ? `${activeDomains.length} active` : "none active"}
              </span>
            </div>

            {activeDomains.length === 0 ? (
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#2e2e2e",
                    fontStyle: "italic",
                  }}
                >
                  No active domains set
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeDomains.slice(0, 3).map((dom) => (
                  <div key={dom.id} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#4a4a4a",
                        letterSpacing: "0.08em",
                        flexShrink: 0,
                        minWidth: 50,
                      }}
                    >
                      {dom.name.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: dom.focus ? "#555" : "#2e2e2e",
                        fontStyle: dom.focus ? "normal" : "italic",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dom.focus || "No focus set"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <BottomNav current="home" onNavigate={onNavigate} />

        {weekOpen && (
          <WeekAnchorsSheet
            anchors={weekAnchors}
            setAnchors={setWeekAnchors}
            onClose={() => setWeekOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
