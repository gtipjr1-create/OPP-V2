import { useState, useRef, useCallback } from "react";
import BottomNav from "./BottomNav";
import { supabase } from "./lib/supabase";
import {
  createPriority,
} from "./data/priorities";

const HORIZONS = ["Today", "This week", "Ongoing", "Season"];
const IDEAL = 3;
const MAX = 5;

const SHEET_STYLE = {
  position: "relative",
  background: "#000000",
  borderRadius: "20px 20px 0 0",
  border: "1px solid #1e1e1e",
  borderBottom: "none",
  padding: "20px 20px 36px",
  animation: "sheetUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
};

const SHEET_HANDLE = {
  width: 36,
  height: 4,
  background: "#333",
  borderRadius: 2,
  margin: "0 auto 20px",
};

const SHEET_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  color: "#555",
  letterSpacing: "0.1em",
  marginBottom: 16,
};

function formatPriorityRow(row, domainsList) {
  const domainNameById = new Map(domainsList.map((domain) => [domain.id, domain.name]));

  return {
    id: row.id,
    label: row.title || "",
    domain: row.domain_id ? domainNameById.get(row.domain_id) || "Build" : "Build",
    domainId: row.domain_id || null,
    horizon: row.horizon || "This week",
    deferred: row.status === "paused",
    status: row.status || "active",
    sortOrder: row.sort_order ?? 0,
    description: row.description || "",
  };
}

const AddSheet = ({ onAdd, onClose, domains, isSaving, errorMessage }) => {
  const domainChoices = domains.length > 0
    ? [...domains]
        .sort((a, b) => {
          const aScore = a.status === "Active" ? 0 : 1;
          const bScore = b.status === "Active" ? 0 : 1;
          if (aScore !== bScore) return aScore - bScore;
          return a.name.localeCompare(b.name);
        })
        .map((domain) => ({
          name: domain.name,
          status: domain.status === "Active" ? "Active" : "Steady",
        }))
    : [{ name: "Build", status: "Active" }];

  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState(
    domainChoices.find((choice) => choice.status === "Active")?.name ?? domainChoices[0]?.name ?? "Build"
  );
  const [horizon, setHorizon] = useState("This week");

  const handleAdd = () => {
    if (!label.trim() || isSaving) return;
    onAdd({ label: label.trim(), domain, horizon });
  };

  const chip = (active, status) => ({
    padding: "5px 13px",
    borderRadius: 20,
    border: `1px solid ${active ? "#4A9EFF" : "#222"}`,
    background: active ? "rgba(74,158,255,0.07)" : "transparent",
    color: active ? "#4A9EFF" : status === "Steady" ? "#373737" : "#444",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    cursor: isSaving ? "default" : "pointer",
    transition: "all 0.15s ease",
    opacity: isSaving ? 0.7 : 1,
  });

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
      <div style={SHEET_STYLE}>
        <div style={SHEET_HANDLE} />
        <div style={SHEET_LABEL}>ADD COMMITMENT</div>

        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What deserves attention now?"
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
            marginBottom: 18,
            opacity: isSaving ? 0.7 : 1,
          }}
        />

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          DOMAIN
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {domainChoices.map((choice) => (
            <button
              key={choice.name}
              className="tappable"
              onClick={() => !isSaving && setDomain(choice.name)}
              disabled={isSaving}
              style={chip(domain === choice.name, choice.status)}
            >
              {choice.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color:
              domainChoices.find((choice) => choice.name === domain)?.status === "Steady"
                ? "#6d5f42"
                : "#3f4f63",
            letterSpacing: "0.04em",
            marginTop: -8,
            marginBottom: 12,
          }}
        >
          {domainChoices.find((choice) => choice.name === domain)?.status === "Steady"
            ? "STEADY DOMAIN - maintenance lane"
            : "ACTIVE DOMAIN - current push lane"}
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
          HORIZON
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {HORIZONS.map((h) => (
            <button key={h} className="tappable" onClick={() => !isSaving && setHorizon(h)} disabled={isSaving} style={chip(horizon === h)}>
              {h.toUpperCase()}
            </button>
          ))}
        </div>

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
          onClick={handleAdd}
          className="tappable"
          disabled={!label.trim() || isSaving}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            background: label.trim() && !isSaving ? "#4A9EFF" : "#161616",
            border: `1px solid ${label.trim() && !isSaving ? "transparent" : "#222"}`,
            color: label.trim() && !isSaving ? "white" : "#333",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: label.trim() && !isSaving ? "pointer" : "default",
            transition: "all 0.2s ease",
          }}
        >
          {isSaving ? "Adding..." : "Add Commitment"}
        </button>
      </div>
    </div>
  );
};

function PriorityRow({ priority, onPark, onDelete, isDragging, isOver }) {
  return (
    <div
      style={{
        marginBottom: 8,
        opacity: isOver ? 0.25 : 1,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        background: isDragging ? "#202020" : "#0e0e0e",
        border: isDragging ? "1px solid #2a2a2a" : "1px solid #1a1a1a",
        borderRadius: 12,
        boxShadow: isDragging
          ? "0 16px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)"
          : "none",
        zIndex: isDragging ? 100 : 1,
        position: "relative",
        transition: isDragging
          ? "transform 0.01s, box-shadow 0.2s ease"
          : "transform 0.25s ease, opacity 0.15s ease, border-color 0.2s ease",
      }}
    >
      <div style={{ padding: "12px 12px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: "#4e4e4e",
              letterSpacing: "0.08em",
            }}
          >
            COMMITMENT
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: "#4A9EFF",
              letterSpacing: "0.06em",
            }}
          >
            IN FOCUS
          </span>
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#e8e8e8",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 8,
            lineHeight: 1.35,
          }}
        >
          {priority.label}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              fontWeight: 500,
              color: "#444",
              border: "1px solid #2a2a2a",
              borderRadius: 4,
              padding: "2px 6px",
              letterSpacing: "0.06em",
            }}
          >
            {priority.domain.toUpperCase()}
          </span>
          {priority.horizon && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: "#4a4a4a",
                letterSpacing: "0.05em",
              }}
            >
              {priority.horizon.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPark(priority.id);
            }}
            className="tappable"
            aria-label={`Pause commitment "${priority.label}"`}
            style={{
              background: "transparent",
              border: "1px solid #252525",
              borderRadius: 8,
              color: "#666",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              cursor: "pointer",
              padding: "6px 8px",
              lineHeight: 1,
            }}
          >
            PAUSE
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(priority.id);
            }}
            className="tappable"
            aria-label={`Remove commitment "${priority.label}"`}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,69,58,0.3)",
              borderRadius: 8,
              color: "#a45a56",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              cursor: "pointer",
              padding: "6px 8px",
              lineHeight: 1,
            }}
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
}

function NotNowRow({ priority, onActivate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        border: "1px solid #161616",
        borderRadius: 10,
        marginBottom: 8,
        background: "#0a0a0a",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "#888",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          {priority.label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: "#222",
              border: "1px solid #1e1e1e",
              borderRadius: 4,
              padding: "2px 6px",
              letterSpacing: "0.06em",
            }}
          >
            {priority.domain.toUpperCase()}
          </span>
          {priority.horizon && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: "#252525",
                letterSpacing: "0.04em",
              }}
            >
              {priority.horizon.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onActivate(priority.id)}
        className="tappable"
        aria-label={`Activate commitment "${priority.label}"`}
        style={{
          background: "transparent",
          border: "1px solid #23364a",
          borderRadius: 8,
          color: "#4A9EFF",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.06em",
          cursor: "pointer",
          padding: "6px 8px",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ACTIVATE
      </button>
    </div>
  );
}

export default function Priorities({ onNavigate, priorities, setPriorities, domains, userId }) {
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const listRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const activeRef = useRef([]);
  const prioritiesRef = useRef(priorities);

  prioritiesRef.current = priorities;

  const active = priorities.filter((p) => !p.deferred);
  const notNow = priorities.filter((p) => p.deferred);
  activeRef.current = active;

  const atCap = active.length >= MAX;
  const crowded = active.length > IDEAL;

  const domainIdByName = new Map(domains.map((domain) => [domain.name, domain.id]));

  const persistSortOrders = useCallback(async (nextList) => {
    if (!userId) throw new Error("No user found for priority reorder.");

    const updates = nextList.map((priority, index) =>
      supabase
        .from("priorities")
        .update({ sort_order: index })
        .eq("id", priority.id)
        .eq("user_id", userId)
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      throw new Error(`Priority reorder failed: ${failed.error.message}`);
    }
  }, [userId]);

  const addPriority = async ({ label, domain, horizon }) => {
    try {
      if (atCap) return;
      if (!userId) throw new Error("No user found for priority create.");

      setIsAdding(true);
      setActionError("");

      const domainId = domainIdByName.get(domain) || null;
      const data = await createPriority({
        userId,
        domainId,
        title: label,
        horizon,
        sortOrder: active.length,
      });

      const formatted = formatPriorityRow(data, domains);

      setPriorities((prev) => {
        const prevActive = prev.filter((p) => !p.deferred);
        const prevDeferred = prev.filter((p) => p.deferred);
        return [...prevActive, formatted, ...prevDeferred];
      });

      setAddOpen(false);
    } catch (error) {
      console.error("Failed to add priority:", error);
      setActionError(error.message || "Could not add commitment.");
    } finally {
      setIsAdding(false);
    }
  };

  const removePriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
      if (!userId) throw new Error("No user found for priority delete.");
      setActionError("");

      const nextList = previous.filter((p) => p.id !== id);
      setPriorities(nextList);

      const { error: deleteError } = await supabase
        .from("priorities")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error(`Priority delete failed: ${deleteError.message}`);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to remove priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not remove commitment.");
    }
  };

  const parkPriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
      if (!userId) throw new Error("No user found for priority update.");
      setActionError("");

      const activeItems = previous.filter((p) => !p.deferred);
      const deferredItems = previous.filter((p) => p.deferred);
      const moved = activeItems.find((p) => p.id === id);

      if (!moved) return;

      const nextList = [
        ...activeItems.filter((p) => p.id !== id),
        ...deferredItems,
        { ...moved, deferred: true, status: "paused" },
      ];

      setPriorities(nextList);

      const { error: statusError } = await supabase
        .from("priorities")
        .update({ status: "paused" })
        .eq("id", id)
        .eq("user_id", userId);

      if (statusError) {
        throw new Error(`Priority status update failed: ${statusError.message}`);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to park priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not pause commitment.");
    }
  };

  const activatePriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
      if (!userId) throw new Error("No user found for priority update.");
      const currentActive = previous.filter((p) => !p.deferred);
      if (currentActive.length >= MAX) return;

      setActionError("");

      const activeItems = previous.filter((p) => !p.deferred);
      const deferredItems = previous.filter((p) => p.deferred);
      const moved = deferredItems.find((p) => p.id === id);

      if (!moved) return;

      const nextList = [
        ...activeItems,
        { ...moved, deferred: false, status: "active" },
        ...deferredItems.filter((p) => p.id !== id),
      ];

      setPriorities(nextList);

      const { error: statusError } = await supabase
        .from("priorities")
        .update({ status: "active" })
        .eq("id", id)
        .eq("user_id", userId);

      if (statusError) {
        throw new Error(`Priority status update failed: ${statusError.message}`);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to activate priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not activate commitment.");
    }
  };

  const getIndexAtY = useCallback((clientY) => {
    if (!listRef.current) return null;
    const rows = Array.from(listRef.current.children);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom) return i;
    }
    if (rows.length > 0) {
      if (clientY > rows[rows.length - 1].getBoundingClientRect().bottom) return rows.length - 1;
      if (clientY < rows[0].getBoundingClientRect().top) return 0;
    }
    return null;
  }, []);

  const onContainerPointerDown = useCallback((e) => {
    const rows = Array.from(listRef.current?.children || []);
    let idx = null;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].contains(e.target)) {
        idx = i;
        break;
      }
    }

    if (idx === null) return;

    const id = activeRef.current[idx]?.id;
    if (!id) return;

    holdTimer.current = setTimeout(() => {
      dragIdRef.current = id;
      setDragId(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 280);
  }, []);

  const onContainerPointerMove = useCallback(
    (e) => {
      if (!dragIdRef.current) return;
      e.preventDefault();

      const idx = getIndexAtY(e.clientY);
      if (idx === null) return;

      const from = activeRef.current.findIndex((p) => p.id === dragIdRef.current);
      if (idx === from) return;

      setOverIndex(idx);

      setPriorities((prev) => {
        const act = prev.filter((p) => !p.deferred);
        const def = prev.filter((p) => p.deferred);
        const f = act.findIndex((p) => p.id === dragIdRef.current);
        if (f === -1) return prev;

        const next = [...act];
        const [moved] = next.splice(f, 1);
        next.splice(idx, 0, moved);

        return [...next, ...def];
      });
    },
    [getIndexAtY, setPriorities]
  );

  const onContainerPointerUp = useCallback(async () => {
    clearTimeout(holdTimer.current);

    const wasDragging = !!dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);
    setOverIndex(null);

    if (!wasDragging) return;

    try {
      setActionError("");
      await persistSortOrders(prioritiesRef.current);
    } catch (error) {
      console.error("Failed to persist priority order:", error);
      setActionError(error.message || "Could not save priority order.");
    }
  }, [persistSortOrders]);

  const onContainerPointerLeave = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

  let capacityColor = "#4A9EFF";
  let capacityText = `${active.length} active`;

  if (atCap) {
    capacityColor = "#FF453A";
    capacityText = `${active.length} active · at capacity`;
  } else if (crowded) {
    capacityColor = "#FF9F0A";
    capacityText = `${active.length} active · focus is crowded`;
  }

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
            Priorities
          </h1>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#383838",
              letterSpacing: "0.06em",
            }}
          >
            Focus management layer
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 10,
            flexShrink: 0,
            paddingInline: 14,
          }}
        >
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              color: active.length === 0 ? "#333" : capacityColor,
              border: `1px solid ${active.length === 0 ? "#1e1e1e" : `${capacityColor}44`}`,
              letterSpacing: "0.06em",
              transition: "all 0.3s ease",
            }}
          >
            {active.length === 0 ? "No focus locked" : capacityText}
          </span>
        </div>

        {actionError ? (
          <div
            style={{
              paddingInline: 14,
              marginBottom: 10,
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#d27d7d",
              textAlign: "center",
            }}
          >
            {actionError}
          </div>
        ) : null}

        <div style={{ flex: 1, overflowY: "auto", paddingInline: 14 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: dragId ? "visible" : "hidden",
              marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                IN FOCUS
              </span>
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#666",
                lineHeight: 1.4,
                marginBottom: 10,
              }}
            >
              Chosen commitments receiving active advancement now.
            </div>

            <div
              ref={listRef}
              style={{
                maxHeight: "42dvh",
                overflowY: dragId ? "visible" : "auto",
                touchAction: dragId ? "none" : "pan-y",
              }}
              onPointerDown={onContainerPointerDown}
              onPointerMove={onContainerPointerMove}
              onPointerUp={onContainerPointerUp}
              onPointerLeave={onContainerPointerLeave}
            >
              {active.length === 0 ? (
                <div style={{ padding: "28px 0 20px" }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#888",
                      fontStyle: "italic",
                      marginBottom: 6,
                    }}
                  >
                    No commitments in focus
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: "#555",
                      letterSpacing: "0.06em",
                    }}
                    >
                      Set 1-3 commitments that deserve attention now
                    </div>
                  </div>
              ) : (
                active.map((p, index) => (
                  <PriorityRow
                    key={p.id}
                    priority={p}
                    onPark={parkPriority}
                    onDelete={removePriority}
                    isDragging={dragId === p.id}
                    isOver={overIndex === index && dragId !== p.id}
                  />
                ))
              )}
            </div>

            <div style={{ paddingTop: 10, paddingBottom: 6, flexShrink: 0 }}>
              {active.length > 1 && (
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: "#454545",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  HOLD AND DRAG TO REORDER FOCUS WEIGHT
                </div>
              )}
              <button
                onClick={() => !atCap && setAddOpen(true)}
                className="tappable"
                aria-label={atCap ? "Commitment capacity reached" : "Add commitment"}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  color: atCap ? "#252525" : "#383838",
                  letterSpacing: "0.08em",
                  cursor: atCap ? "default" : "pointer",
                  padding: "4px 0",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!atCap) e.currentTarget.style.color = "#4A9EFF";
                }}
                onMouseLeave={(e) => {
                  if (!atCap) e.currentTarget.style.color = "#383838";
                }}
              >
                {atCap ? "- at capacity" : "+ Add Commitment"}
              </button>
            </div>
          </div>

          {notNow.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#2e2e2e",
                    letterSpacing: "0.1em",
                  }}
                >
                  NOT NOW
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#5b5b5b",
                  lineHeight: 1.4,
                  marginBottom: 8,
                }}
              >
                Paused commitments that can be reactivated when focus shifts.
              </div>
              {notNow.map((p) => (
                <NotNowRow key={p.id} priority={p} onActivate={activatePriority} />
              ))}
              <div style={{ height: 6 }} />
            </div>
          )}
        </div>

        <BottomNav current="priorities" onNavigate={onNavigate} />

        {addOpen && (
          <AddSheet
            onAdd={addPriority}
            onClose={() => {
              if (!isAdding) {
                setActionError("");
                setAddOpen(false);
              }
            }}
            domains={domains}
            isSaving={isAdding}
            errorMessage={actionError}
          />
        )}
      </div>
    </div>
  );
}



