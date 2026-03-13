import { useState } from "react";
import BottomNav from "./BottomNav";

const STATUSES = ["Active", "Steady"];

const EditSheet = ({ domain, onSave, onClose }) => {
  const [status, setStatus] = useState(domain.status === "Active" ? "Active" : "Steady");
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
            const isSelected = status === s;
            const color = s === "Active" ? "#4A9EFF" : "#555";
            const bg = s === "Active" ? "rgba(74,158,255,0.07)" : "transparent";
            const border = s === "Active" ? "rgba(74,158,255,0.35)" : "#2a2a2a";
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? border : "#222"}`,
                  background: isSelected ? bg : "transparent",
                  color: isSelected ? color : "#444",
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
          onKeyDown={(e) =>
            e.key === "Enter" && onSave({ ...domain, status, focus: focus.trim() })
          }
          placeholder="What are you pointed at right now?"
          style={{
            width: "100%",
            background: "#161616",
            border: "1.5px solid #222222",
            borderRadius: 9,
            color: "#ccc",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
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

function ActiveDomainCard({ domain, onTap }) {
  return (
    <div
      onClick={() => onTap(domain.id)}
      style={{
        background: "#111111",
        borderRadius: 14,
        padding: "14px 16px",
        border: "1px solid #1a1a1a",
        cursor: "pointer",
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
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: "#c8c8c8",
            letterSpacing: "-0.01em",
          }}
        >
          {domain.name}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            fontWeight: 500,
            color: "#4A9EFF",
            background: "rgba(74,158,255,0.07)",
            border: "1px solid rgba(74,158,255,0.3)",
            borderRadius: 4,
            padding: "2px 7px",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          ACTIVE
        </span>
      </div>

      {domain.focus ? (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#888",
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
            color: "#333",
            fontStyle: "italic",
          }}
        >
          No focus set
        </div>
      )}
    </div>
  );
}

function SteadyDomainRow({ domain, onTap, isLast }) {
  return (
    <div
      onClick={() => onTap(domain.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 0",
        borderBottom: isLast ? "none" : "1px solid #161616",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "#3a3a3a",
            marginBottom: domain.focus ? 3 : 0,
          }}
        >
          {domain.name}
        </div>
        {domain.focus && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#2e2e2e",
              lineHeight: 1.35,
            }}
          >
            {domain.focus}
          </div>
        )}
      </div>
      <span style={{ color: "#222", fontSize: 14, flexShrink: 0 }}>›</span>
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

  const activeDomains = domains.filter((d) => d.status === "Active");
  const steadyDomains = domains.filter((d) => d.status !== "Active");

  const summaryText = [
    activeDomains.length > 0 ? `${activeDomains.length} active` : null,
    steadyDomains.length > 0 ? `${steadyDomains.length} steady` : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
        {/* Top bar spacer */}
        <div style={{ height: 40, flexShrink: 0 }} />

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
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
              marginBottom: 6,
            }}
          >
            Domains
          </h1>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#383838",
              letterSpacing: "0.06em",
            }}
          >
            Life structure
          </span>
        </div>

        {/* Summary chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              color: activeDomains.length > 0 ? "#4A9EFF" : "#333",
              border: `1px solid ${activeDomains.length > 0 ? "rgba(74,158,255,0.3)" : "#1e1e1e"}`,
              letterSpacing: "0.06em",
            }}
          >
            {summaryText || "No domains defined"}
          </span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingInline: 14 }}>

          {/* Active section */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: activeDomains.length > 0 ? "#555" : "#333",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              ACTIVE
            </div>

            {activeDomains.length === 0 ? (
              <div
                style={{
                  background: "#0d0d0d",
                  borderRadius: 14,
                  padding: "22px 16px",
                  border: "1px solid #161616",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#2e2e2e",
                    fontStyle: "italic",
                    marginBottom: 4,
                  }}
                >
                  No active domains set
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#222",
                    letterSpacing: "0.06em",
                  }}
                >
                  Tap a domain to mark it active
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeDomains.map((domain) => (
                  <ActiveDomainCard key={domain.id} domain={domain} onTap={setEditId} />
                ))}
              </div>
            )}
          </div>

          {/* Steady section */}
          {steadyDomains.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#333",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                STEADY
              </div>
              <div
                style={{
                  background: "#0d0d0d",
                  borderRadius: 14,
                  padding: "2px 16px",
                  border: "1px solid #161616",
                }}
              >
                {steadyDomains.map((domain, i) => (
                  <SteadyDomainRow
                    key={domain.id}
                    domain={domain}
                    onTap={setEditId}
                    isLast={i === steadyDomains.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        <BottomNav current="domains" onNavigate={onNavigate} />

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
