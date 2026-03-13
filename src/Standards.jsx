import BottomNav from "./BottomNav";

const STANDARDS = [
  { id: 1, text: "Train regardless of mood." },
  { id: 2, text: "Build for the long term." },
  { id: 3, text: "Protect clarity." },
  { id: 4, text: "Finish before expanding." },
  { id: 5, text: "Keep your word to yourself." },
  { id: 6, text: "Move with discipline, not urgency." },
];

export default function Standards({ onNavigate }) {
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
        * { -webkit-user-select: none; user-select: none; }
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
            Standards
          </h1>
        </div>

        {/* Status chip */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
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
            Non-Negotiables
          </span>
        </div>

        {/* Standards list */}
        <div style={{ paddingInline: 14, flexShrink: 0 }}>
          <div
            style={{
              background: "#111111",
              borderRadius: 16,
              padding: "14px 16px 8px",
              border: "1px solid #1a1a1a",
            }}
          >
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
                HOW I OPERATE
              </span>
            </div>

            {STANDARDS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  borderBottom: i < STANDARDS.length - 1 ? "1px solid #1e1e1e" : "none",
                  padding: "14px 0",
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#c0c0c0",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <BottomNav current="standards" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
