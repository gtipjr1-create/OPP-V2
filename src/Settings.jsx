import { useState } from "react";
import BottomNav from "./BottomNav";

const GLOSSARY_GROUPS = [
  {
    title: "CORE STATE TERMS",
    items: [
      { term: "Active", definition: "A lane or item receiving deliberate advancement now." },
      { term: "Steady", definition: "A lane that remains maintained and visible without current push." },
      { term: "Session", definition: "The current operating window of re-entry, orientation, and daily control." },
    ],
  },
  {
    title: "STRUCTURAL TERMS",
    items: [
      { term: "Domain", definition: "A structural life lane that organizes long-term attention and effort." },
      { term: "Priority", definition: "A selected focus object inside the commitment layer." },
      { term: "Commitment", definition: "A deliberately chosen item that deserves active attention now." },
      { term: "Standard", definition: "A rule of operation that governs behavior regardless of mood, energy, or circumstances." },
      { term: "Day Item", definition: "A day-level capture point used to maintain order and completion within the current day." },
      { term: "Horizon", definition: "The time-frame that defines a commitment's relevance." },
    ],
  },
  {
    title: "HORIZON DEFINITIONS",
    items: [
      { term: "Today", definition: "Immediate day-level relevance." },
      { term: "This Week", definition: "Current weekly relevance and active short-range attention." },
      { term: "Ongoing", definition: "Continuing relevance without immediate endpoint." },
      { term: "Season", definition: "Longer-arc relevance tied to a broader period of life, effort, or development." },
    ],
  },
];

export default function Settings({ onNavigate, onSignOut }) {
  const [openGlossaryGroup, setOpenGlossaryGroup] = useState(null);

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
        className="screen-reveal"
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
        <div style={{ height: 40, flexShrink: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 16,
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
            Settings
          </h1>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#383838",
              letterSpacing: "0.06em",
            }}
          >
            Account and system language
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#555",
              border: "1px solid #2a2a2a",
              letterSpacing: "0.06em",
            }}
          >
            Account
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingInline: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "#555",
                letterSpacing: "0.1em",
              }}
            >
              SESSION
            </span>
          </div>

          <div
            style={{
              borderTop: "1px solid #1e1e1e",
              borderBottom: "1px solid #1e1e1e",
              padding: "14px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#bbb",
              }}
            >
              Sign Out
            </span>
            <button
              onClick={onSignOut}
              className="tappable"
              style={{
                background: "none",
                border: "1px solid #2a2a2a",
                borderRadius: 999,
                color: "#c8c8c8",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              SIGN OUT
            </button>
          </div>

          <div style={{ marginTop: 20, marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "#555",
                letterSpacing: "0.1em",
              }}
            >
              GLOSSARY
            </span>
          </div>

          {GLOSSARY_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <button
                type="button"
                className="tappable"
                onClick={() =>
                  setOpenGlossaryGroup((prev) => (prev === group.title ? null : group.title))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "0 0 8px",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: "#444",
                    letterSpacing: "0.08em",
                  }}
                >
                  {group.title}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#3f3f3f",
                    letterSpacing: "0.06em",
                  }}
                >
                  {openGlossaryGroup === group.title ? "-" : "+"}
                </span>
              </button>
              {openGlossaryGroup === group.title ? (
                <div style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a" }}>
                  {group.items.map((item, index) => (
                    <div
                      key={item.term}
                      style={{
                        padding: "10px 0",
                        borderBottom: index < group.items.length - 1 ? "1px solid #151515" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          color: "#c8c8c8",
                          letterSpacing: "0.06em",
                          marginBottom: 4,
                        }}
                      >
                        {item.term}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          color: "#8a8a8a",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.definition}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <BottomNav current="settings" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
