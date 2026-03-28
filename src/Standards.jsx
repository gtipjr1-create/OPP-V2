import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MobileShell from "./MobileShell";

function formatRuleNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function StandardRow({ standard, ruleNumber, onDelete, onTap, isDragging, isOver }) {
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
    if (swipeX.current < THRESHOLD) onDelete(standard.id);
    setOffset(0);
    swipeX.current = 0;
  };

  const reveal = Math.min(Math.abs(offset), 110);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderTop: "1px solid #1e1e1e" }}>
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
              fontSize: 13,
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
          gap: 12,
          padding: isDragging ? "14px 10px" : "14px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          opacity: isOver ? 0.25 : 1,
          transform: isDragging ? "scale(1.03)" : `translateX(${offset}px)`,
          background: isDragging ? "#222222" : "#000000",
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
          onClick={() => !isDragging && offset === 0 && onTap(standard)}
          className="tappable"
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: "#7a7a7a",
              letterSpacing: "0.08em",
              marginBottom: 7,
            }}
          >
            RULE {ruleNumber}
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 400,
              color: "#e6e6e6",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {standard.text}
          </p>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: "#666666",
              letterSpacing: "0.04em",
              marginTop: 6,
            }}
          >
            Tap to edit rule
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexShrink: 0,
            opacity: 0.26,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 14, height: 1.5, background: "#555", borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Standards({
  onNavigate,
  standards,
  maxStandards = 8,
  onAddStandard,
  onUpdateStandard,
  onRemoveStandard,
  onReorderStandards,
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [displayStandards, setDisplayStandards] = useState([]);

  const listRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const displayRef = useRef(displayStandards);
  displayRef.current = displayStandards;

  const sortedStandards = useMemo(() => {
    return [...standards].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [standards]);

  useEffect(() => {
    if (!dragIdRef.current) {
      setDisplayStandards(sortedStandards);
    }
  }, [sortedStandards]);

  const hasReachedMax = sortedStandards.length >= maxStandards;

  function startEdit(standard) {
    setEditingId(standard.id);
    setEditingText(standard.text);
    setLocalError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
    setLocalError("");
  }

  async function handleAdd() {
    const cleanDraft = draft.trim();
    if (!cleanDraft) {
      setLocalError("Write the standard first.");
      return;
    }
    if (hasReachedMax) {
      setLocalError(`Maximum ${maxStandards} standards.`);
      return;
    }

    try {
      setIsSaving(true);
      setLocalError("");
      await onAddStandard(cleanDraft);
      setDraft("");
    } catch (error) {
      setLocalError(error.message || "Failed to add standard.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveEdit() {
    const cleanText = editingText.trim();
    if (!editingId) return;
    if (!cleanText) {
      setLocalError("Standard cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      setLocalError("");
      await onUpdateStandard(editingId, cleanText);
      cancelEdit();
    } catch (error) {
      setLocalError(error.message || "Failed to update standard.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      setIsSaving(true);
      setLocalError("");
      await onRemoveStandard(id);
      if (editingId === id) cancelEdit();
    } catch (error) {
      setLocalError(error.message || "Failed to delete standard.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSaveEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  async function handleDraftKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAdd();
    }
  }

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
    if (isSaving || editingId) return;
    const rows = Array.from(listRef.current?.children || []);
    let idx = null;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].contains(e.target)) {
        idx = i;
        break;
      }
    }
    if (idx === null) return;
    const id = displayRef.current[idx]?.id;
    if (!id) return;

    holdTimer.current = setTimeout(() => {
      dragIdRef.current = id;
      setDragId(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 280);
  }, [isSaving, editingId]);

  const onContainerPointerMove = useCallback((e) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    const idx = getIndexAtY(e.clientY);
    if (idx === null) return;
    const from = displayRef.current.findIndex((s) => s.id === dragIdRef.current);
    if (idx === from) return;
    setOverIndex(idx);
    setDisplayStandards((prev) => {
      const next = [...prev];
      const f = next.findIndex((s) => s.id === dragIdRef.current);
      if (f === -1) return prev;
      const [moved] = next.splice(f, 1);
      next.splice(idx, 0, moved);
      return next;
    });
  }, [getIndexAtY]);

  const onContainerPointerUp = useCallback(async () => {
    clearTimeout(holdTimer.current);
    const wasDragging = !!dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);
    setOverIndex(null);
    if (!wasDragging) return;

    const nextIds = displayRef.current.map((s) => s.id);
    try {
      setIsSaving(true);
      setLocalError("");
      await onReorderStandards(nextIds);
    } catch (error) {
      setLocalError(error.message || "Failed to reorder standards.");
    } finally {
      setIsSaving(false);
    }
  }, [onReorderStandards]);

  const onContainerPointerLeave = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

  return (
    <MobileShell
      currentNav="standards"
      onNavigate={onNavigate}
      header={
        <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 26,
            marginBottom: 10,
            paddingInline: "var(--mobile-page-gutter)",
          }}
        >
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "var(--mobile-screen-title-size)",
              fontWeight: 400,
              color: "#f0f0f0",
              lineHeight: "36px",
              textAlign: "center",
              marginBottom: 7,
            }}
          >
            Standards
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
            Governing layer
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
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
            Non-Negotiables · {sortedStandards.length}/{maxStandards}
          </span>
        </div>
        </>
      }
    >
      <div
        style={{
          marginTop: 6,
          marginBottom: 14,
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--mobile-meta-size)",
          color: "#666",
          lineHeight: 1.4,
        }}
      >
        These rules govern behavior across mood, energy, and circumstances.
      </div>

      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "var(--mobile-section-title-size)",
            fontWeight: 600,
            color: "#9a9a9a",
            lineHeight: 1.3,
          }}
        >
          How I Operate
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder={hasReachedMax ? "Maximum reached" : "Write a governing rule"}
          disabled={hasReachedMax || isSaving}
          style={{
            flex: 1,
            minWidth: 0,
            background: "#0a0a0a",
            border: "1px solid #1d1d1d",
            borderRadius: 14,
            color: "#d6d6d6",
            fontSize: 16,
            padding: "13px 12px",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          className="tappable"
          disabled={hasReachedMax || isSaving}
          style={{
            flexShrink: 0,
            padding: "13px 12px",
            borderRadius: 14,
            border: "1px solid #2a2a2a",
            background: "transparent",
            color: hasReachedMax ? "#444" : "#c8c8c8",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            cursor: hasReachedMax || isSaving ? "default" : "pointer",
          }}
        >
          Add
        </button>
      </div>

      <div
        style={{
          marginBottom: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--mobile-screen-subtitle-size)",
          fontWeight: 500,
          color: "#7a7a7a",
          lineHeight: 1.35,
        }}
      >
        Direct · Operational · Repeatable
      </div>

      {localError ? (
        <div style={{ marginBottom: 8, fontSize: "var(--mobile-meta-size)", color: "#8a8a8a", lineHeight: 1.4 }}>
          {localError}
        </div>
      ) : null}

      {displayStandards.length === 0 ? (
        <div style={{ paddingTop: 16 }}>
          <p style={{ color: "#b0b0b0", fontSize: "var(--mobile-body-size)", lineHeight: 1.6 }}>
            No governing rules defined yet.
          </p>
          <p style={{ color: "#6a6a6a", fontSize: "var(--mobile-screen-subtitle-size)", lineHeight: 1.6, marginTop: 4 }}>
            Standards should be clear enough to follow even when motivation is low.
          </p>
          <p style={{ color: "#4f4f4f", fontSize: "var(--mobile-meta-size)", lineHeight: 1.6, marginTop: 6 }}>
            Example shape: "Finish planned work before drift."
          </p>
        </div>
      ) : (
        <div
          ref={listRef}
          style={{
            overflow: dragId ? "visible" : "hidden",
            touchAction: dragId ? "none" : "pan-y",
          }}
          onPointerDown={onContainerPointerDown}
          onPointerMove={onContainerPointerMove}
          onPointerUp={onContainerPointerUp}
          onPointerLeave={onContainerPointerLeave}
        >
          {displayStandards.map((standard, index) => {
            const isEditing = editingId === standard.id;

            if (isEditing) {
              return (
                <div
                  key={standard.id}
                  style={{ borderTop: "1px solid #1e1e1e", padding: "14px 0" }}
                >
                  <input
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleSaveEdit}
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      border: "1px solid #262626",
                      borderRadius: 10,
                      color: "#d6d6d6",
                      fontSize: 16,
                      lineHeight: 1.45,
                      padding: "10px 12px",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                </div>
              );
            }

            return (
              <StandardRow
                key={standard.id}
                standard={standard}
                ruleNumber={formatRuleNumber(index)}
                onDelete={handleDelete}
                onTap={startEdit}
                isDragging={dragId === standard.id}
                isOver={overIndex === index && dragId !== standard.id}
              />
            );
          })}
        </div>
      )}
    </MobileShell>
  );
}






