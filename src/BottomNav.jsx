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
        borderTop: "1px solid #232323",
        background: "#000",
        display: "flex",
        paddingTop: 10,
        paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        paddingInline: 6,
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
              color: isActive ? "#f0f0f0" : "#8a8a8a",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              letterSpacing: "0.06em",
              cursor: "pointer",
              padding: "12px 0 10px",
              transition: "color 0.15s ease",
              textAlign: "center",
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {label}
            <div
              style={{
                width: isActive ? 14 : 10,
                height: 2,
                borderRadius: 99,
                background: isActive ? "#dcdcdc" : "#2a2a2a",
                transition: "all 0.15s ease",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
