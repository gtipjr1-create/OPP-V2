import { useState } from "react";
import MobileShell from "./MobileShell";

const GLOSSARY_GROUPS = [
  {
    title: "Core State Terms",
    items: [
      { term: "Active", definition: "A lane or item receiving deliberate advancement now." },
      { term: "Steady", definition: "A lane that remains maintained and visible without current push." },
      { term: "Session", definition: "The current operating window of re-entry, orientation, and daily control." },
    ],
  },
  {
    title: "Structural Terms",
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
    title: "Horizon Definitions",
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
    <MobileShell
      currentNav="settings"
      onNavigate={onNavigate}
      header={
        <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 28,
            marginBottom: 8,
            paddingInline: "var(--mobile-page-gutter)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              marginBottom: 6,
              color: "#5a5a5a",
              opacity: 0.9,
            }}
          >
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
              <path
                d="M11 3h2l.45 2.14a6.9 6.9 0 0 1 1.62.67l1.86-1.2 1.42 1.42-1.2 1.86c.27.51.5 1.05.67 1.62L21 11v2l-2.14.45a6.9 6.9 0 0 1-.67 1.62l1.2 1.86-1.42 1.42-1.86-1.2a6.9 6.9 0 0 1-1.62.67L13 21h-2l-.45-2.14a6.9 6.9 0 0 1-1.62-.67l-1.86 1.2-1.42-1.42 1.2-1.86a6.9 6.9 0 0 1-.67-1.62L3 13v-2l2.14-.45c.17-.57.4-1.11.67-1.62l-1.2-1.86 1.42-1.42 1.86 1.2c.51-.27 1.05-.5 1.62-.67L11 3Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "var(--mobile-screen-title-size)",
              fontWeight: 400,
              color: "#f0f0f0",
              lineHeight: "36px",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Settings
          </h1>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--mobile-screen-subtitle-size)",
              fontWeight: 500,
              color: "#383838",
              lineHeight: 1.35,
            }}
          >
            Account and system language
          </span>
        </div>

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
              color: "#555",
              border: "1px solid #2a2a2a",
              letterSpacing: "0.06em",
            }}
          >
            Account
          </span>
        </div>
        </>
      }
    >
      <div style={{ marginTop: 6, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "var(--mobile-section-title-size)",
            fontWeight: 600,
            color: "#555",
          }}
        >
          Session
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
            fontSize: 15,
            fontWeight: 500,
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
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "9px 14px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginTop: 18, marginBottom: 10 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "#555",
          }}
        >
          Glossary
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
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "#444",
                lineHeight: 1.3,
              }}
            >
              {group.title}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                fontWeight: 500,
                color: "#3f3f3f",
                letterSpacing: "0.06em",
              }}
            >
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
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#c8c8c8",
                      marginBottom: 4,
                    }}
                  >
                    {item.term}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
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

    </MobileShell>
  );
}




