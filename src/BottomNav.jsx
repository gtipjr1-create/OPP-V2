const NAV_ITEMS = [
  { id: "home",       label: "Today"      },
  { id: "domains",    label: "Domains"    },
  { id: "priorities", label: "Priorities" },
  { id: "standards",  label: "Standards"  },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: "1px solid #181818",
        background: "#000",
        display: "flex",
        paddingTop: 8,
        paddingBottom: "max(18px, env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className="tappable"
            aria-current={isActive ? "page" : undefined}
            aria-label={`Go to ${label}`}
            style={{
              background: "none",
              border: "none",
              color: isActive ? "#e0e0e0" : "#4a4a4a",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              letterSpacing: "0.06em",
              cursor: "pointer",
              padding: "13px 0 11px",
              transition: "color 0.15s ease",
              textAlign: "center",
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            {label}
            <div
              style={{
                width: 3,
                height: 2,
                borderRadius: 99,
                background: isActive ? "#e0e0e0" : "transparent",
                transition: "background 0.15s ease",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
