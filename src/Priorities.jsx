import { useState, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase";
import BottomNav from "./BottomNav";

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
  const availableDomains = domains.length > 0 ? domains.map((domain) => domain.name) : ["Build"];
  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState(availableDomains.includes("Build") ? "Build" : availableDomains[0]);
  const [horizon, setHorizon] = useState("This week");

  const handleAdd = () => {
    if (!label.trim() || isSaving) return;
    onAdd({ label: label.trim(), domain, horizon });
  };

  const chip = (active) => ({
    padding: "5px 13px",
    borderRadius: 20,
    border: `1px solid ${active ? "#4A9EFF" : "#222"}`,
    background: active ? "rgba(74,158,255,0.07)" : "transparent",
    color: active ? "#4A9EFF" : "#444",
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
        <div style={SHEET_LABEL}>ADD PRIORITY</div>

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
          {availableDomains.map((d) => (
            <button key={d} onClick={() => !isSaving && setDomain(d)} disabled={isSaving} style={chip(domain === d)}>
              {d.toUpperCase()}
            </button>
          ))}
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
            <button key={h} onClick={() => !isSaving && setHorizon(h)} disabled={isSaving} style={chip(horizon === h)}>
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
          {isSaving ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

function PriorityRow({ priority, onPark, onDelete, isDragging, isOver }) {
  const swipeX = useRef(0);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = -90;

  const onTouchStart = (e) => {
    if (!isDragging) startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) return;
    swipeX.current = Math.max(dx, -110);
    setOffset(swipeX.current);
  };

  const onTouchEnd = () => {
    if (swipeX.current < THRESHOLD) onDelete(priority.id);
    setOffset(0);
    swipeX.current = 0;
  };

  const reveal = Math.min(Math.abs(offset), 110);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #1e1e1e" }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: reveal,
          background: "#FF453A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.1s ease",
        }}
      >
        {reveal > 20 && (
          <span
            style={{
              fontSize: 12,
              color: "white",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.06em",
            }}
          >
            REMOVE
          </span>
        )}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: isDragging ? "13px 10px" : "13px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          opacity: isOver ? 0.25 : 1,
          transform: isDragging ? "scale(1.03)" : `translateX(${offset}px)`,
          background: isDragging ? "#222222" : "#111111",
          borderRadius: isDragging ? 12 : 0,
          boxShadow: isDragging
            ? "0 16px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)"
            : "none",
          zIndex: isDragging ? 100 : 1,
          position: "relative",
          transition: isDragging
            ? "transform 0.01s, box-shadow 0.2s ease"
            : offset !== 0
            ? "none"
            : "transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexShrink: 0,
            opacity: 0.2,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 14, height: 1.5, background: "#555", borderRadius: 1 }}
            />
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "#d0d0d0",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 5,
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
                  color: "#383838",
                  letterSpacing: "0.04em",
                }}
              >
                {priority.horizon.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPark(priority.id);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#252525",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            cursor: "pointer",
            padding: "4px 6px",
            flexShrink: 0,
            transition: "color 0.15s ease",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#252525")}
        >
          —
        </button>
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
        padding: "11px 0",
        borderBottom: "1px solid #161616",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "#2e2e2e",
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
        style={{
          background: "none",
          border: "none",
          color: "#2a2a2a",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          cursor: "pointer",
          padding: "4px 6px",
          flexShrink: 0,
          transition: "color 0.15s ease",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4A9EFF")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a2a")}
      >
        +
      </button>
    </div>
  );
}

export default function Priorities({ onNavigate, priorities, setPriorities, domains }) {
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

  async function getCurrentUserId() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new Error("No signed-in user found.");
    }

    return user.id;
  }

  async function persistSortOrders(nextList) {
    const updates = nextList.map((priority, index) =>
      supabase
        .from("priorities")
        .update({ sort_order: index })
        .eq("id", priority.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      throw new Error(failed.error.message);
    }
  }

  const addPriority = async ({ label, domain, horizon }) => {
    try {
      if (atCap) return;

      setIsAdding(true);
      setActionError("");

      const userId = await getCurrentUserId();
      const domainId = domainIdByName.get(domain) || null;

      const { data, error } = await supabase
        .from("priorities")
        .insert({
          user_id: userId,
          domain_id: domainId,
          title: label,
          description: "",
          status: "active",
          sort_order: active.length,
          horizon,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const formatted = formatPriorityRow(data, domains);

      setPriorities((prev) => {
        const prevActive = prev.filter((p) => !p.deferred);
        const prevDeferred = prev.filter((p) => p.deferred);
        return [...prevActive, formatted, ...prevDeferred];
      });

      setAddOpen(false);
    } catch (error) {
      console.error("Failed to add priority:", error);
      setActionError(error.message || "Could not add priority.");
    } finally {
      setIsAdding(false);
    }
  };

  const removePriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
      setActionError("");

      const nextList = previous.filter((p) => p.id !== id);
      setPriorities(nextList);

      const { error } = await supabase.from("priorities").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to remove priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not remove priority.");
    }
  };

  const parkPriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
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

      const { error } = await supabase
        .from("priorities")
        .update({ status: "paused" })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to park priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not park priority.");
    }
  };

  const activatePriority = async (id) => {
    const previous = prioritiesRef.current;

    try {
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

      const { error } = await supabase
        .from("priorities")
        .update({ status: "active" })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await persistSortOrders(nextList);
    } catch (error) {
      console.error("Failed to activate priority:", error);
      setPriorities(previous);
      setActionError(error.message || "Could not activate priority.");
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
  }, []);

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
            What matters now
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
              background: "#111111",
              borderRadius: 16,
              padding: "14px 16px 4px",
              border: "1px solid #1a1a1a",
              display: "flex",
              flexDirection: "column",
              overflow: dragId ? "visible" : "hidden",
              marginBottom: 10,
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
                      color: "#333",
                      fontStyle: "italic",
                      marginBottom: 6,
                    }}
                  >
                    No focus locked
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: "#2a2a2a",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Set 1–3 priorities that deserve attention now
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
              <button
                onClick={() => !atCap && setAddOpen(true)}
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
                {atCap ? "— at capacity" : "+ Add Priority"}
              </button>
            </div>
          </div>

          {notNow.length > 0 && (
            <div
              style={{
                background: "#0d0d0d",
                borderRadius: 16,
                padding: "14px 16px 4px",
                border: "1px solid #161616",
                marginBottom: 10,
              }}
            >
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