const STATUS_DOT = {
  Active: "#4A9EFF",
  Steady: "#3a3a3a",
  Quiet:  "#222",
};

export default function Home({ onNavigate, sessionName, domains, priorities }) {
  const activeDomains = domains.filter((d) => d.status === "Active").length;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#000000",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        *:not(input) { -webkit-user-select: none; user-select: none; }
        @keyframes glowHalo  { 0%, 100% { opacity: 0.5;  r: 180px; } 50% { opacity: 0.85; r: 183px; } }
        @keyframes outerRing { 0%, 100% { r: 168px; stroke-opacity: 0.9;  } 50% { r: 171px; stroke-opacity: 1;    } }
        @keyframes innerRing { 0%, 100% { r: 122px; stroke-opacity: 0.85; } 50% { r: 125px; stroke-opacity: 1;    } }
        @keyframes dotGlow   { 0%, 100% { opacity: 0.12; r: 22px; } 50% { opacity: 0.4;  r: 28px; } }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          paddingTop: "max(28px, env(safe-area-inset-top))",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          paddingInline: 20,
        }}
      >
        {/* Mark */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 16, marginBottom: 40 }}>
          <svg width="56" height="56" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="hGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4A9EFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0" />
              </radialGradient>
              <filter id="hDotBlur" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            <circle cx="256" cy="256" r="180" fill="url(#hGlowGrad)" style={{ animation: "glowHalo 3s ease-in-out infinite" }} />
            <circle cx="256" cy="256" r="168" stroke="white" strokeWidth="10" style={{ animation: "outerRing 3s ease-in-out infinite" }} />
            <circle cx="256" cy="256" r="122" stroke="#4A9EFF" strokeWidth="8" style={{ animation: "innerRing 3s ease-in-out infinite" }} />
            <circle cx="256" cy="256" r="22" fill="#4A9EFF" filter="url(#hDotBlur)" style={{ animation: "dotGlow 3s ease-in-out infinite" }} />
            <circle cx="256" cy="256" r="22" fill="#4A9EFF" />
            <circle cx="256" cy="256" r="14" fill="white" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Session tile */}
        <div
          onClick={() => onNavigate("active")}
          style={{
            background: "#111111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                fontWeight: 400,
                color: "#f0f0f0",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                marginBottom: 6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sessionName}
            </div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: "#555",
                letterSpacing: "0.08em",
              }}
            >
              Active Session
            </span>
          </div>
          <span style={{ color: "#333", fontSize: 18, flexShrink: 0 }}>›</span>
        </div>

        {/* Priorities section */}
        <div
          onClick={() => onNavigate("priorities")}
          style={{
            background: "#111111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: priorities.length > 0 ? 14 : 0,
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

          {priorities.length === 0 ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {priorities.map((p) => (
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

          {priorities.length === 0 && (
            <div style={{ marginTop: 12 }}>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#2e2e2e",
                  fontStyle: "italic",
                }}
              >
                Nothing set yet
              </span>
            </div>
          )}
        </div>

        {/* Domain strip */}
        <div
          onClick={() => onNavigate("domains")}
          style={{
            background: "#111111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: "16px 18px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
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
                color: activeDomains > 0 ? "#4A9EFF" : "#333",
                letterSpacing: "0.06em",
              }}
            >
              {activeDomains} active
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {domains.map((d) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: d.status === "Quiet" ? 0.4 : 1,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: STATUS_DOT[d.status],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: d.status === "Active" ? "#c0c0c0" : "#555",
                    flex: 1,
                  }}
                >
                  {d.name}
                </span>
                {d.focus && (
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: "#383838",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "55%",
                    }}
                  >
                    {d.focus}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
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
              onClick={() => onNavigate("standards")}
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
              Standards
            </button>

            <button
              onClick={() => onNavigate("archived")}
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
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
