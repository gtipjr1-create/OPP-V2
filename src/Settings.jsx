import BottomNav from "./BottomNav";

export default function Settings({ onNavigate, onSignOut }) {
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
        <div style={{ height: 16, flexShrink: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 32,
            flexShrink: 0,
            paddingInline: 14,
          }}
        >
          <h1
            style={{
              fontFamily: "'Halant', serif",
              fontSize: 28,
              fontWeight: 400,
              color: "#f0f0f0",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Settings
          </h1>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingInline: 14 }}>
          <div
            style={{
              borderBottom: "1px solid #1a1a1a",
              padding: "16px 0",
            }}
          >
            <button
              onClick={onSignOut}
              style={{
                background: "none",
                border: "none",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                color: "#888",
                letterSpacing: "0.08em",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
            >
              SIGN OUT
            </button>
          </div>
        </div>

        <BottomNav current="settings" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
