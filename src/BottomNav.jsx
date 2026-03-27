const NAV_ITEMS = [
  { id: "home",       label: "Today"      },
  { id: "domains",    label: "Domains"    },
  { id: "priorities", label: "Focus"      },
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
        minHeight: "var(--shell-nav-height)",
        paddingTop: 6,
        paddingBottom: 6,
        paddingInline: 4,
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
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
              padding: "10px 0 8px",
              minHeight: 46,
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
                width: isActive ? 12 : 9,
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
