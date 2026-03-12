import { useState, useRef, useCallback } from "react";

const DOMAINS = ["Health", "Work", "Build", "Mind", "Write", "Life"];
const MAX = 5;

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

const SHEET_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  color: "#555",
  letterSpacing: "0.1em",
  marginBottom: 16,
};

const AddSheet = ({ onAdd, onClose }) => {
  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState("Build");

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({ label: label.trim(), domain });
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
        <div style={SHEET_LABEL}>ADD PRIORITY</div>

        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What are you pushing toward?"
          style={{
            width: "100%",
            background: "#161616",
            border: "1.5px solid #222222",
            borderRadius: 9,
            color: "#ccc",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            padding: "10px 12px",
            outline: "none",
            marginBottom: 18,
          }}
        />

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          DOMAIN
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {DOMAINS.map((d) => {
            const active = domain === d;
            return (
              <button
                key={d}
                onClick={() => setDomain(d)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 20,
                  border: `1px solid ${active ? "#4A9EFF" : "#222"}`,
                  background: active ? "rgba(74,158,255,0.07)" : "transparent",
                  color: active ? "#4A9EFF" : "#444",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {d.toUpperCase()}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            background: label.trim() ? "#4A9EFF" : "#161616",
            border: `1px solid ${label.trim() ? "transparent" : "#222"}`,
            color: label.trim() ? "white" : "#333",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: label.trim() ? "pointer" : "default",
            transition: "all 0.2s ease",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

function PriorityRow({ priority, onDelete, isDragging, isOver }) {
  const swipeX = useRef(0);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = -90;

  const onTouchStart = (e) => {
    if (!isDragging) startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) return;
    swipeX.current = Math.max(dx, -110);
    setOffset(swipeX.current);
  };

  const onTouchEnd = () => {
    if (swipeX.current < THRESHOLD) onDelete(priority.id);
    setOffset(0);
    swipeX.current = 0;
  };

  const reveal = Math.min(Math.abs(offset), 110);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #2a2a2a" }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: reveal,
          background: "#FF453A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.1s ease",
        }}
      >
        {reveal > 20 && (
          <span
            style={{
              fontSize: 12,
              color: "white",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.06em",
            }}
          >
            REMOVE
          </span>
        )}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: isDragging ? "11px 10px" : "11px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          opacity: isOver ? 0.25 : 1,
          transform: isDragging ? "scale(1.03)" : `translateX(${offset}px)`,
          background: isDragging ? "#222222" : "#111111",
          borderRadius: isDragging ? 12 : 0,
          boxShadow: isDragging ? "0 16px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)" : "none",
          zIndex: isDragging ? 100 : 1,
          position: "relative",
          transition: isDragging
            ? "transform 0.01s, box-shadow 0.2s ease"
            : offset !== 0
            ? "none"
            : "transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexShrink: 0,
            opacity: 0.25,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 14, height: 1.5, background: "#555", borderRadius: 1 }}
            />
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "#d0d0d0",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 4,
              lineHeight: 1.35,
            }}
          >
            {priority.label}
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: "#444",
              border: "1px solid #2a2a2a",
              borderRadius: 4,
              padding: "2px 6px",
              letterSpacing: "0.06em",
            }}
          >
            {priority.domain.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Priorities({ onNavigate, priorities, setPriorities }) {
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const listRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const prioritiesRef = useRef(priorities);
  prioritiesRef.current = priorities;

  const atCap = priorities.length >= MAX;

  const addPriority = ({ label, domain }) => {
    if (atCap) return;
    setPriorities((prev) => [
      ...prev,
      { id: Date.now(), label, domain },
    ]);
    setAddOpen(false);
  };

  const removePriority = (id) => {
    setPriorities((prev) => prev.filter((p) => p.id !== id));
  };

  const getIndexAtY = useCallback((clientY) => {
    if (!listRef.current) return null;
    const rows = Array.from(listRef.current.children);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom) return i;
    }
    if (rows.length > 0) {
      if (clientY > rows[rows.length - 1].getBoundingClientRect().bottom) return rows.length - 1;
      if (clientY < rows[0].getBoundingClientRect().top) return 0;
    }
    return null;
  }, []);

  const onContainerPointerDown = useCallback((e) => {
    const rows = Array.from(listRef.current?.children || []);
    let idx = null;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].contains(e.target)) { idx = i; break; }
    }
    if (idx === null) return;
    const id = prioritiesRef.current[idx]?.id;
    if (!id) return;
    holdTimer.current = setTimeout(() => {
      dragIdRef.current = id;
      setDragId(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 280);
  }, []);

  const onContainerPointerMove = useCallback((e) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    const idx = getIndexAtY(e.clientY);
    if (idx === null) return;
    const from = prioritiesRef.current.findIndex((p) => p.id === dragIdRef.current);
    if (idx === from) return;
    setOverIndex(idx);
    setPriorities((prev) => {
      const next = [...prev];
      const f = next.findIndex((p) => p.id === dragIdRef.current);
      if (f === -1) return prev;
      const [moved] = next.splice(f, 1);
      next.splice(idx, 0, moved);
      return next;
    });
  }, [getIndexAtY]);

  const onContainerPointerUp = useCallback(() => {
    clearTimeout(holdTimer.current);
    dragIdRef.current = null;
    setDragId(null);
    setOverIndex(null);
  }, []);

  const onContainerPointerLeave = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
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
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          paddingTop: "max(10px, env(safe-area-inset-top))",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Top bar spacer */}
        <div style={{ height: 40, flexShrink: 0 }} />

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 10,
            flexShrink: 0,
            paddingInline: 14,
          }}
        >
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 28,
              fontWeight: 400,
              color: "#f0f0f0",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Priorities
          </h1>
        </div>

        {/* Status chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10, flexShrink: 0 }}>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#555",
              border: "1px solid #2a2a2a",
            }}
          >
            Current Focus
          </span>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              color: atCap ? "#FF453A" : "#4A9EFF",
              border: `1px solid ${atCap ? "rgba(255,69,58,0.35)" : "rgba(74,158,255,0.3)"}`,
              transition: "all 0.2s ease",
            }}
          >
            {priorities.length} / {MAX}
          </span>
        </div>

        {/* Priority list */}
        <div style={{ paddingInline: 14, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div
            style={{
              background: "#111111",
              borderRadius: 16,
              padding: "14px 16px 4px",
              border: "1px solid #1a1a1a",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: dragId ? "visible" : "hidden",
            }}
          >
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                WHAT MATTERS NOW
              </span>
            </div>

            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: dragId ? "visible" : "auto",
                touchAction: dragId ? "none" : "pan-y",
              }}
              onPointerDown={onContainerPointerDown}
              onPointerMove={onContainerPointerMove}
              onPointerUp={onContainerPointerUp}
              onPointerLeave={onContainerPointerLeave}
            >
              {priorities.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 0",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: "#444",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Nothing set yet
                  </span>
                </div>
              ) : (
                priorities.map((p, index) => (
                  <PriorityRow
                    key={p.id}
                    priority={p}
                    onDelete={removePriority}
                    isDragging={dragId === p.id}
                    isOver={overIndex === index && dragId !== p.id}
                  />
                ))
              )}
            </div>

            {/* Add row */}
            <div style={{ paddingTop: 10, paddingBottom: 6, flexShrink: 0 }}>
              <button
                onClick={() => !atCap && setAddOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  color: atCap ? "#2a2a2a" : "#383838",
                  letterSpacing: "0.08em",
                  cursor: atCap ? "default" : "pointer",
                  padding: "4px 0",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { if (!atCap) e.currentTarget.style.color = "#4A9EFF"; }}
                onMouseLeave={(e) => { if (!atCap) e.currentTarget.style.color = "#4a4a4a"; }}
              >
                {atCap ? "— at capacity" : "+ Add Priority"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingInline: 14, paddingTop: 14, flexShrink: 0 }}>
          <div
            style={{
              borderTop: "1px solid #181818",
              paddingTop: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => onNavigate?.("domains")}
              style={{
                background: "none",
                border: "none",
                color: "#4a4a4a",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: "pointer",
                padding: "4px 2px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4A9EFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
            >
              ← Domains
            </button>

            <button
              onClick={() => onNavigate?.("standards")}
              style={{
                background: "none",
                border: "none",
                color: "#4a4a4a",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: "pointer",
                padding: "4px 2px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4A9EFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
            >
              Standards →
            </button>
          </div>
        </div>

        {/* Add sheet */}
        {addOpen && (
          <AddSheet onAdd={addPriority} onClose={() => setAddOpen(false)} />
        )}
      </div>
    </div>
  );
}
