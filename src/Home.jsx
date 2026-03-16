import { useState } from "react";
import BottomNav from "./BottomNav";

const SHEET_STYLE = {
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 430,
  zIndex: 1001,
  background: "#000000",
  borderRadius: "20px 20px 0 0",
  border: "1px solid #1e1e1e",
  borderBottom: "none",
  padding: "20px 20px 36px",
  animation: "sheetUpFixed 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
};

const SHEET_HANDLE = {
  width: 36,
  height: 4,
  background: "#333",
  borderRadius: 2,
  margin: "0 auto 20px",
};

const BACKDROP_STYLE = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 1000,
};

const WeekAnchorsSheet = ({
  anchors,
  onAddWeeklyAnchor,
  onUpdateWeeklyAnchor,
  onRemoveWeeklyAnchor,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const MAX = 3;
  const atCap = anchors.length >= MAX;

 async function handleSubmit(e) {
  e.preventDefault();

  const clean = input.trim();
  if (!clean || isSaving) return;

  try {
    setIsSaving(true);

    if (editingId) {
      await onUpdateWeeklyAnchor(editingId, clean);
      setEditingId(null);
    } else {
      if (atCap) return;
      await onAddWeeklyAnchor(clean);
    }

    setInput("");
    onClose();
  } catch (error) {
    console.error("Weekly anchor submit failed:", error);
    alert(error.message || "Weekly anchor save failed.");
  } finally {
    setIsSaving(false);
  }
}

  function handleEdit(anchor) {
    if (isSaving) return;
    setInput(anchor.text);
    setEditingId(anchor.id);
  }

  async function handleRemove(id) {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (editingId === id) {
        setEditingId(null);
        setInput("");
      }

      await onRemoveWeeklyAnchor(id);
    } catch (error) {
      console.error("Weekly anchor remove failed:", error);
      alert(error.message || "Weekly anchor delete failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div onClick={isSaving ? undefined : onClose} style={BACKDROP_STYLE} />

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
                    cursor: isSaving ? "default" : "pointer",
                    lineHeight: 1.35,
                  }}
                >
                  {anchor.text}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(anchor.id)}
                  disabled={isSaving}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2e2e2e",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 16,
                    cursor: isSaving ? "default" : "pointer",
                    padding: "2px 4px",
                    flexShrink: 0,
                    lineHeight: 1,
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {(!atCap || editingId) && (
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What is this week anchored to?"
              disabled={isSaving}
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
                opacity: isSaving ? 0.7 : 1,
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isSaving}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                background: input.trim() && !isSaving ? "#4A9EFF" : "#161616",
                border: `1px solid ${input.trim() && !isSaving ? "transparent" : "#222"}`,
                color: input.trim() && !isSaving ? "white" : "#333",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: input.trim() && !isSaving ? "pointer" : "default",
              }}
            >
              {editingId ? "Update" : "Add"}
            </button>
          </form>
        )}

        {atCap && !editingId && (
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
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
              cursor: isSaving ? "default" : "pointer",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            Done
          </button>
        )}
      </div>
    </>
  );
};

export default function Home({
  onNavigate,
  sessionName,
  domains,
  priorities,
  weekAnchors,
  onAddWeeklyAnchor,
  onUpdateWeeklyAnchor,
  onRemoveWeeklyAnchor,
}) {
  const [weekOpen, setWeekOpen] = useState(false);
  const activeDomains = domains.filter((dom) => dom.status === "Active");
  const activePriorities = priorities.filter((p) => !p.deferred);
  const topPriorities = activePriorities.slice(0, 3);

  const sessionMeta = [
    activePriorities.length > 0
      ? `${activePriorities.length} ${activePriorities.length === 1 ? "priority" : "priorities"}`
      : null,
    activeDomains.length > 0 ? `${activeDomains.length} active` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const CARD = {
    padding: "16px 0",
    borderBottom: "1px solid #1a1a1a",
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
        <div style={{ height: 20, flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: "auto", paddingInline: 20 }}>
          <div onClick={() => onNavigate("active")} className="tappable" style={{ ...CARD, cursor: "pointer" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 6,
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
              <img src="/opp-icon.svg" style={{ width: 22, height: 22, opacity: 0.4, flexShrink: 0, marginTop: 3 }} />
              <span style={{ color: "#555", fontSize: 18, flexShrink: 0, paddingTop: 3 }}>›</span>
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
                  color: "#888",
                  letterSpacing: "0.01em",
                }}
              >
                {sessionMeta}
              </div>
            ) : null}
          </div>

          <div onClick={() => onNavigate("priorities")} className="tappable" style={{ ...CARD, cursor: "pointer" }}>
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
                  color: "#ffffff",
                  letterSpacing: "0.1em",
                }}
              >
                CURRENT FOCUS
              </span>
              <span style={{ color: "#444", fontSize: 18 }}>›</span>
            </div>

            {topPriorities.length === 0 ? (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#888",
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
                    color: "#555",
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
                        color: "#e0e0e0",
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

          <div onClick={() => setWeekOpen(true)} className="tappable" style={{ ...CARD, cursor: "pointer" }}>
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
                  color: "#ffffff",
                  letterSpacing: "0.1em",
                }}
              >
                THIS WEEK
              </span>
              <span style={{ color: "#444", fontSize: 18 }}>›</span>
            </div>

            {weekAnchors.length === 0 ? (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#888",
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
                    color: "#555",
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
                      color: "#e0e0e0",
                      lineHeight: 1.35,
                    }}
                  >
                    {anchor.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            onClick={() => onNavigate("domains")}
            className="tappable"
            style={{ ...CARD, cursor: "pointer", borderBottom: "none" }}
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
                  color: "#ffffff",
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
                    color: "#888",
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
                        color: "#ffffff",
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
                        color: dom.focus ? "#aaa" : "#888",
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
            onAddWeeklyAnchor={onAddWeeklyAnchor}
            onUpdateWeeklyAnchor={onUpdateWeeklyAnchor}
            onRemoveWeeklyAnchor={onRemoveWeeklyAnchor}
            onClose={() => setWeekOpen(false)}
          />
        )}
      </div>
    </div>
  );
}