import { useState } from "react";


const STATUS_STYLES = {
  Active: {
    color: "#4A9EFF",
    border: "rgba(74,158,255,0.35)",
    bg: "rgba(74,158,255,0.07)",
  },
  Steady: {
    color: "#555",
    border: "#2a2a2a",
    bg: "transparent",
  },
  Quiet: {
    color: "#333",
    border: "#1e1e1e",
    bg: "transparent",
  },
};

const FOCUS_COLOR = { Active: "#bbb", Steady: "#606060", Quiet: "#3a3a3a" };
const CARD_OPACITY = { Active: 1, Steady: 1, Quiet: 0.5 };

const STATUSES = ["Active", "Steady", "Quiet"];

const EditSheet = ({ domain, onSave, onClose }) => {
  const [status, setStatus] = useState(domain.status);
  const [focus, setFocus] = useState(domain.focus);

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
      <div
        style={{
          position: "relative",
          background: "#000000",
          borderRadius: "20px 20px 0 0",
          border: "1px solid #1e1e1e",
          borderBottom: "none",
          padding: "20px 20px 36px",
          animation: "sheetUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#555",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          {domain.name.toUpperCase()}
        </div>

        {/* Status picker */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          STATUS
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {STATUSES.map((s) => {
            const active = status === s;
            const st = STATUS_STYLES[s];
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${active ? st.color : "#222"}`,
                  background: active ? st.bg : "transparent",
                  color: active ? st.color : "#444",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Focus line */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          CURRENT FOCUS
        </div>
        <input
          autoFocus
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave({ ...domain, status, focus: focus.trim() })}
          placeholder="What are you pointed at right now?"
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

        <button
          onClick={() => onSave({ ...domain, status, focus: focus.trim() })}
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
          Save
        </button>
      </div>
    </div>
  );
};

function DomainCard({ domain, onTap }) {
  const st = STATUS_STYLES[domain.status];
  const focusColor = FOCUS_COLOR[domain.status];
  const opacity = CARD_OPACITY[domain.status];

  return (
    <div
      onClick={() => onTap(domain.id)}
      style={{
        background: "#111111",
        borderRadius: 14,
        padding: "14px 16px",
        border: "1px solid #1a1a1a",
        cursor: "pointer",
        opacity,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: domain.focus ? 8 : 0,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: "#555",
            letterSpacing: "0.12em",
          }}
        >
          {domain.name.toUpperCase()}
        </span>

        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: st.color,
            background: st.bg,
            border: `1px solid ${st.border}`,
            borderRadius: 4,
            padding: "2px 7px",
            letterSpacing: "0.06em",
          }}
        >
          {domain.status.toUpperCase()}
        </span>
      </div>

      {domain.focus ? (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: focusColor,
            lineHeight: 1.4,
          }}
        >
          {domain.focus}
        </div>
      ) : (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#444",
            fontStyle: "italic",
          }}
        >
          No focus set
        </div>
      )}
    </div>
  );
}

export default function Domains({ onNavigate, domains, setDomains }) {
  const [editId, setEditId] = useState(null);

  const editDomain = domains.find((d) => d.id === editId) || null;

  const saveDomain = (updated) => {
    setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setEditId(null);
  };

  const activeDomains = domains.filter((d) => d.status === "Active").length;

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
            Domains
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
            Life Structure
          </span>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              color: "#4A9EFF",
              border: "1px solid rgba(74,158,255,0.3)",
            }}
          >
            {activeDomains} active
          </span>
        </div>

        {/* Domain list */}
        <div
          style={{
            paddingInline: 14,
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} onTap={setEditId} />
          ))}
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
              onClick={() => onNavigate?.("active")}
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
              ← Active Session
            </button>

            <button
              onClick={() => onNavigate?.("priorities")}
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
              Priorities →
            </button>
          </div>
        </div>

        {/* Edit sheet */}
        {editDomain && (
          <EditSheet
            domain={editDomain}
            onSave={saveDomain}
            onClose={() => setEditId(null)}
          />
        )}
      </div>
    </div>
  );
}
