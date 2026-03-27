import { useState } from "react";
import BottomNav from "./BottomNav";
import { updateDomain } from "./data/domains";

const STATUSES = ["Active", "Steady"];
const MAX_ACTIVE_DOMAINS = 3;
const DOMAIN_PURPOSES = {
  Health: "Energy, recovery, and physical capability.",
  Work: "Career output, reliability, and contribution.",
  Build: "Long-arc projects and asset creation.",
  Mind: "Mental clarity, reflection, and learning.",
  Write: "Expression, thinking, and publishing practice.",
  Life: "Home, logistics, relationships, and stability.",
};

function domainPurpose(name) {
  return DOMAIN_PURPOSES[name] || "A structural lane of life allocation.";
}

const EditSheet = ({ domain, onSave, onClose, isSaving, errorMessage, atActiveCap }) => {
  const [status, setStatus] = useState(domain.status === "Active" ? "Active" : "Steady");
  const [focus, setFocus] = useState(domain.focus || "");

  const handleSave = () => {
    onSave({
      ...domain,
      status,
      focus: focus.trim(),
    });
  };

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
        onClick={isSaving ? undefined : onClose}
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
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#b0b0b0",
            marginBottom: 16,
          }}
        >
          {domain.name}
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#7a7a7a",
            marginBottom: 8,
          }}
        >
          Status
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: atActiveCap && status !== "Active" ? 8 : 18 }}>
          {STATUSES.map((s) => {
            const isSelected = status === s;
            const blocked = s === "Active" && atActiveCap && status !== "Active";
            const color = s === "Active" ? "#4A9EFF" : "#555";
            const bg = s === "Active" ? "rgba(74,158,255,0.07)" : "transparent";
            const border = s === "Active" ? "rgba(74,158,255,0.35)" : "#2a2a2a";

            return (
              <button
                key={s}
                onClick={() => !isSaving && !blocked && setStatus(s)}
                disabled={isSaving || blocked}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? border : "#222"}`,
                  background: isSelected ? bg : "transparent",
                  color: isSelected ? color : blocked ? "#2a2a2a" : "#444",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: isSaving || blocked ? "default" : "pointer",
                  transition: "all 0.15s ease",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: status === "Active" ? "#6f86a1" : "#6a6a6a",
            lineHeight: 1.4,
            marginTop: -10,
            marginBottom: 14,
          }}
        >
          {status === "Active"
            ? "Active means this lane receives current push and can shape Today focus."
            : "Steady means this lane stays maintained without current push pressure."}
        </div>

        {atActiveCap && status !== "Active" && (
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#555",
              letterSpacing: "0.06em",
              marginBottom: 18,
            }}
          >
            {MAX_ACTIVE_DOMAINS} active · at capacity
          </div>
        )}

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#7a7a7a",
            marginBottom: 8,
          }}
        >
          Purpose
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#707070",
            lineHeight: 1.4,
            marginBottom: 12,
          }}
        >
          {domainPurpose(domain.name)}
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#7a7a7a",
            marginBottom: 8,
          }}
        >
          Current Focus
        </div>

        <input
          autoFocus
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isSaving && handleSave()}
          placeholder="What is this lane pointed at right now?"
          disabled={isSaving}
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
            marginBottom: 12,
            opacity: isSaving ? 0.7 : 1,
          }}
        />

        {errorMessage ? (
          <div
            style={{
              marginBottom: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#d27d7d",
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          onClick={handleSave}
          disabled={isSaving}
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
            cursor: isSaving ? "default" : "pointer",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

function ActiveDomainCard({ domain, onTap }) {
  return (
    <div
      onClick={() => onTap(domain.id)}
      className="tappable"
      style={{
        padding: "10px 0",
        borderBottom: "1px solid #1a1a1a",
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
            fontSize: 16,
            fontWeight: 600,
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
          Active
        </span>
      </div>

      {domain.focus ? (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#9a9a9a",
            lineHeight: 1.42,
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
      className="tappable"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: isLast ? "none" : "1px solid #161616",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#bbb",
            marginBottom: domain.focus ? 3 : 0,
          }}
        >
          {domain.name}
        </div>
        {domain.focus && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#8c8c8c",
              lineHeight: 1.42,
            }}
          >
            {domain.focus}
          </div>
        )}
      </div>
      <span style={{ color: "#222", fontSize: 14, flexShrink: 0 }}>&rsaquo;</span>
    </div>
  );
}

export default function Domains({ onNavigate, domains, setDomains }) {
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const editDomain = domains.find((d) => d.id === editId) || null;

  const saveDomain = async (updated) => {
    try {
      setIsSaving(true);
      setSaveError("");

      const data = await updateDomain({
        id: updated.id,
        status: updated.status,
        focus: updated.focus,
      });

      setDomains((prev) =>
        prev.map((d) =>
          d.id === updated.id
            ? {
                ...d,
                status: data.status || updated.status,
                focus: data.focus || "",
              }
            : d
        )
      );

      setEditId(null);
    } catch (error) {
      console.error("Failed to save domain:", error);
      setSaveError(error.message || "Could not save domain.");
    } finally {
      setIsSaving(false);
    }
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
        <div style={{ height: 28, flexShrink: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
            flexShrink: 0,
            paddingInline: 16,
          }}
        >
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              fontWeight: 400,
              color: "#f0f0f0",
              lineHeight: "36px",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Domains
          </h1>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#383838",
              lineHeight: 1.35,
            }}
          >
            Structural life lanes
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
              fontWeight: 500,
              color: activeDomains.length > 0 ? "#4A9EFF" : "#333",
              border: `1px solid ${activeDomains.length > 0 ? "rgba(74,158,255,0.3)" : "#1e1e1e"}`,
              letterSpacing: "0.06em",
            }}
          >
            {summaryText || "No domains defined"}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingInline: 16,
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: activeDomains.length > 0 ? "#555" : "#333",
                marginBottom: 8,
              }}
            >
              Active
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#7a7a7a",
                lineHeight: 1.42,
                marginBottom: 10,
              }}
            >
              Active lanes receive deliberate advancement now.
            </div>

            {activeDomains.length === 0 ? (
              <div style={{ padding: "12px 0" }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: "#686868",
                    fontStyle: "italic",
                    marginBottom: 4,
                  }}
                >
                  No active domains set
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#5e5e5e",
                    lineHeight: 1.35,
                  }}
                >
                  Promote a lane to active when it needs deliberate push
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeDomains.map((domain) => (
                  <ActiveDomainCard key={domain.id} domain={domain} onTap={setEditId} />
                ))}
              </div>
            )}
          </div>

          {steadyDomains.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: 10,
                }}
              >
                Steady
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "#787878",
                  lineHeight: 1.42,
                  marginBottom: 10,
                }}
              >
                Steady lanes remain maintained and visible.
              </div>
              <div>
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
            onClose={() => {
              if (!isSaving) {
                setSaveError("");
                setEditId(null);
              }
            }}
            isSaving={isSaving}
            errorMessage={saveError}
            atActiveCap={activeDomains.length >= MAX_ACTIVE_DOMAINS && editDomain.status !== "Active"}
          />
        )}
      </div>
    </div>
  );
}


