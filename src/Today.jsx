import { useCallback, useEffect, useRef, useState } from "react";
import MobileShell from "./MobileShell";
import { supabase } from "./lib/supabase";
import { createTodayTask } from "./data/todayTasks";

const HORIZON_ORDER = {
  today: 0,
  "this week": 1,
  ongoing: 2,
  season: 3,
};

function todayDateLabel() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[now.getDay()];
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const yy = String(now.getFullYear()).slice(-2);
  return `${day} / ${m}.${d}.${yy}`;
}

function normalizeHorizon(horizon) {
  const value = String(horizon || "").trim().toLowerCase();
  if (value === "thisweek") return "this week";
  if (value === "sustained") return "ongoing";
  if (value in HORIZON_ORDER) return value;
  return "this week";
}

function horizonLabel(horizon) {
  const key = normalizeHorizon(horizon);
  if (key === "today") return "Today";
  if (key === "this week") return "This Week";
  if (key === "ongoing") return "Ongoing";
  if (key === "season") return "Season";
  return "This Week";
}

function horizonWeight(horizon) {
  return HORIZON_ORDER[normalizeHorizon(horizon)] ?? HORIZON_ORDER["this week"];
}

function localISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function updateTodayTaskDoneForUser(id, done, userId) {
  const { error } = await supabase
    .from("today_tasks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Today task update failed: ${error.message}`);
  }
}

async function deleteTodayTaskForUser(id, userId) {
  const { error } = await supabase
    .from("today_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Today task delete failed: ${error.message}`);
  }
}

async function updateTodayTaskSortOrdersForUser(tasks, userId) {
  const updates = tasks.map((task, index) =>
    supabase
      .from("today_tasks")
      .update({ sort_order: index })
      .eq("id", task.id)
      .eq("user_id", userId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(`Today task reorder failed: ${failed.error.message}`);
  }
}

const CheckIcon = ({ checked }) => (
  <div
    style={{
      width: 20,
      height: 20,
      borderRadius: 5,
      border: checked ? "none" : "1.5px solid #3a3a3a",
      background: checked ? "#1a3a5c" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.15s ease",
    }}
  >
    {checked && (
      <svg width="11" height="8" viewBox="0 0 12 9" fill="none">
        <path
          d="M1 4L4.5 7.5L11 1"
          stroke="#4A9EFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

function TaskRow({ task, onToggle, onDelete, isDragging, isOver }) {
  const swipeX = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = -90;

  const onTouchStart = (e) => {
    if (!isDragging) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isHorizontalSwipe.current = false;
    }
  };

  const onTouchMove = (e) => {
    if (isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!isHorizontalSwipe.current) {
      const horizontalIntent = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      if (!horizontalIntent) return;
      isHorizontalSwipe.current = true;
    }

    if (dx > 0) return;
    swipeX.current = Math.max(dx, -110);
    setOffset(swipeX.current);
  };

  const onTouchEnd = () => {
    if (swipeX.current < THRESHOLD) onDelete(task.id);
    setOffset(0);
    swipeX.current = 0;
    isHorizontalSwipe.current = false;
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
          gap: 12,
          padding: isDragging ? "13px 10px" : "13px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          opacity: isOver ? 0.25 : task.done ? 0.38 : 1,
          transform: isDragging ? "scale(1.03)" : `translateX(${offset}px)`,
          background: isDragging ? "#1a1a1a" : "transparent",
          borderRadius: isDragging ? 12 : 0,
          boxShadow: isDragging
            ? "0 14px 36px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.45)"
            : "none",
          zIndex: isDragging ? 100 : 1,
          position: "relative",
          transition: isDragging
            ? "transform 0.01s, box-shadow 0.2s ease"
            : offset !== 0
            ? "none"
            : "transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
      >
        <button
          type="button"
          onClick={() => !isDragging && offset === 0 && onToggle(task.id)}
          className="tappable"
          aria-label={
            task.done ? `Mark day item "${task.label}" as not done` : `Mark day item "${task.label}" as done`
          }
          style={{ flexShrink: 0, cursor: "pointer", background: "none", border: "none" }}
        >
          <CheckIcon checked={task.done} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: task.done ? "#383838" : "#d0d0d0",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.3s ease",
            }}
          >
            {task.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrientationPanel({ label, actionLabel, onAction, children }) {
  return (
    <div
      style={{
        border: "1px solid #1d1d1d",
        borderRadius: 12,
        padding: "10px 11px",
        background: "#090909",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#a8a8a8",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="tappable"
            style={{
              background: "none",
              border: "none",
              color: "#9a9a9a",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function Today({
  onNavigate,
  tasks,
  setTasks,
  priorities = [],
  weekAnchors = [],
  domains = [],
  userId,
}) {
  const [quickAdd, setQuickAdd] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const [domainsExpanded, setDomainsExpanded] = useState(
    typeof window !== "undefined" ? window.innerHeight >= 780 : true
  );

  const listRef = useRef(null);
  const quickAddInputRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pointerYRef = useRef(null);
  const autoScrollRafRef = useRef(null);
  const pointerIdRef = useRef(null);
  const pointerTargetRef = useRef(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const dateLabel = todayDateLabel();
  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const activePriorities = priorities.filter((p) => !p.deferred);
  const activeDomains = domains.filter((d) => d.status === "Active");
  const todayHorizonCount = activePriorities.filter((p) => normalizeHorizon(p.horizon) === "today").length;
  const weeklyHorizonCount = activePriorities.filter(
    (p) => normalizeHorizon(p.horizon) === "this week"
  ).length;
  const previewPriorities = [...activePriorities]
    .sort((a, b) => horizonWeight(a.horizon) - horizonWeight(b.horizon))
    .slice(0, 4);
  const isShortViewport = viewportHeight < 780;
  const visibleDomainCount = isShortViewport && !domainsExpanded ? 1 : 2;
  const visibleActiveDomains = activeDomains.slice(0, visibleDomainCount);
  const hiddenDomainCount = Math.max(activeDomains.length - visibleActiveDomains.length, 0);

  useEffect(() => {
    function handleResize() {
      setViewportHeight(window.innerHeight);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
    };
  }, []);

  async function addTask() {
    const label = quickAdd.trim();
    if (!label || isAdding) return;

    try {
      setIsAdding(true);
      setActionError("");

      const data = await createTodayTask({
        userId,
        label,
        sortOrder: tasks.length,
        date: localISODate(),
      });

      setTasks((prev) => [
        ...prev,
        { id: data.id, label: data.label, done: data.done, sortOrder: data.sort_order },
      ]);
      setQuickAdd("");
    } catch (error) {
      setActionError(error.message || "Could not add day item.");
    } finally {
      setIsAdding(false);
    }
  }

  async function toggleTask(id) {
    const task = tasksRef.current.find((t) => t.id === id);
    if (!task) return;

    const previous = tasksRef.current;
    const nextDone = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));

    try {
      await updateTodayTaskDoneForUser(id, nextDone, userId);
    } catch (error) {
      setTasks(previous);
      setActionError(error.message || "Could not update day item.");
    }
  }

  async function deleteTask(id) {
    const previous = tasksRef.current;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodayTaskForUser(id, userId);
    } catch (error) {
      setTasks(previous);
      setActionError(error.message || "Could not delete day item.");
    }
  }

  const persistSortOrders = useCallback(async (nextList) => {
    await updateTodayTaskSortOrdersForUser(nextList, userId);
  }, [userId]);

  const moveDraggedTaskToIndex = useCallback((targetIndex) => {
    if (!dragIdRef.current || targetIndex === null) return;
    const from = tasksRef.current.findIndex((t) => t.id === dragIdRef.current);
    if (from === -1 || targetIndex === from) return;

    setOverIndex(targetIndex);
    setTasks((prev) => {
      const next = [...prev];
      const f = next.findIndex((t) => t.id === dragIdRef.current);
      if (f === -1) return prev;
      const [moved] = next.splice(f, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, [setTasks]);

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

  const stopAutoScrollLoop = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  const lockContainerScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.style.touchAction = "none";
    scrollContainerRef.current.style.overscrollBehavior = "none";
  }, []);

  const unlockContainerScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.style.touchAction = "";
    scrollContainerRef.current.style.overscrollBehavior = "";
  }, []);

  const runAutoScrollLoop = useCallback(() => {
    if (!dragIdRef.current || !scrollContainerRef.current || pointerYRef.current === null) {
      stopAutoScrollLoop();
      return;
    }

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const threshold = 72;
    const maxSpeed = 16;
    let delta = 0;

    if (pointerYRef.current < rect.top + threshold) {
      const intensity = (rect.top + threshold - pointerYRef.current) / threshold;
      delta = -Math.ceil(Math.max(2, intensity * maxSpeed));
    } else if (pointerYRef.current > rect.bottom - threshold) {
      const intensity = (pointerYRef.current - (rect.bottom - threshold)) / threshold;
      delta = Math.ceil(Math.max(2, intensity * maxSpeed));
    }

    if (delta !== 0) {
      const previousTop = container.scrollTop;
      container.scrollTop += delta;
      if (container.scrollTop !== previousTop) {
        const idx = getIndexAtY(pointerYRef.current);
        moveDraggedTaskToIndex(idx);
      }
    }

    autoScrollRafRef.current = requestAnimationFrame(runAutoScrollLoop);
  }, [getIndexAtY, moveDraggedTaskToIndex, stopAutoScrollLoop]);

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
    const id = tasksRef.current[idx]?.id;
    if (!id) return;

    pointerIdRef.current = e.pointerId;
    pointerTargetRef.current = e.currentTarget instanceof Element ? e.currentTarget : null;
    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    pointerYRef.current = e.clientY;

    holdTimer.current = setTimeout(() => {
      dragIdRef.current = id;
      setDragId(id);
      const scrollContainer = listRef.current?.closest(".mobile-shell-scroll");
      scrollContainerRef.current = scrollContainer || null;
      lockContainerScroll();
      if (pointerTargetRef.current && pointerIdRef.current !== null) {
        try {
          pointerTargetRef.current.setPointerCapture(pointerIdRef.current);
        } catch {
          // Ignore capture failures on non-capturable targets.
        }
      }
      stopAutoScrollLoop();
      autoScrollRafRef.current = requestAnimationFrame(runAutoScrollLoop);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 240);
  }, [lockContainerScroll, runAutoScrollLoop, stopAutoScrollLoop]);

  const onContainerPointerMove = useCallback((e) => {
    pointerYRef.current = e.clientY;
    if (!dragIdRef.current) {
      const movedX = Math.abs(e.clientX - pointerStartXRef.current);
      const movedY = Math.abs(e.clientY - pointerStartYRef.current);
      if (movedX > 14 || movedY > 14) {
        clearTimeout(holdTimer.current);
      }
      return;
    }
    e.preventDefault();
    const idx = getIndexAtY(e.clientY);
    moveDraggedTaskToIndex(idx);
  }, [getIndexAtY, moveDraggedTaskToIndex]);

  const onContainerPointerUp = useCallback(async () => {
    clearTimeout(holdTimer.current);
    stopAutoScrollLoop();
    const wasDragging = !!dragIdRef.current;
    unlockContainerScroll();
    if (pointerTargetRef.current && pointerIdRef.current !== null) {
      try {
        pointerTargetRef.current.releasePointerCapture(pointerIdRef.current);
      } catch {
        // No-op if capture was never set.
      }
    }
    dragIdRef.current = null;
    pointerYRef.current = null;
    scrollContainerRef.current = null;
    pointerIdRef.current = null;
    pointerTargetRef.current = null;
    setDragId(null);
    setOverIndex(null);
    if (!wasDragging) return;
    try {
      await persistSortOrders(tasksRef.current);
    } catch (error) {
      setActionError(error.message || "Could not save order.");
    }
  }, [persistSortOrders, stopAutoScrollLoop, unlockContainerScroll]);

  const onContainerPointerLeave = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

  return (
    <MobileShell
      currentNav="home"
      onNavigate={onNavigate}
      header={
        <div
          style={{
            paddingTop: 0,
            paddingBottom: 2,
          }}
        >
          <div
            style={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingInline: "var(--mobile-page-gutter)",
            }}
          >
            <button
              onClick={() => onNavigate("settings")}
              className="tappable"
              aria-label="Open settings"
              style={{
                background: "#0b0b0b",
                border: "1px solid #232323",
                borderRadius: 999,
                color: "#6e6e6e",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
                padding: "6px 10px",
              }}
            >
              Settings
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 4,
              paddingInline: "var(--mobile-page-gutter)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 35,
                height: 35,
                marginBottom: 8,
                animation: "iconPulse 2.8s ease-in-out infinite",
                transformOrigin: "center",
              }}
            >
              <img
                src="/icons/icon-192.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "var(--type-size-page-title)",
                fontWeight: 400,
                color: "#f0f0f0",
                lineHeight: "34px",
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              {dateLabel}
            </h1>
          </div>
        </div>
      }
    >
      <style>{`
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 0.84; }
          50% { transform: scale(1.06); opacity: 1; }
        }
      `}</style>

      {actionError ? (
        <div
          style={{
            paddingInline: "var(--mobile-page-gutter)",
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "var(--mobile-meta-size)",
            color: "#d27d7d",
            textAlign: "center",
          }}
        >
          {actionError}
        </div>
      ) : null}

      <div style={{ marginTop: 4 }}>
        <OrientationPanel label="Active Session">
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: "#c7c7c7",
                marginBottom: 3,
              }}
            >
              {total === 0
                ? "No day items defined."
                : `${doneCount}/${total} day items complete.`}
            </div>
            <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: "#727272",
                  letterSpacing: "0.04em",
                }}
            >
              {activePriorities.length} in focus · {activeDomains.length} active domains
            </div>
            {(todayHorizonCount > 0 || weeklyHorizonCount > 0) && (
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: "#666666",
                  letterSpacing: "0.04em",
                }}
              >
                {todayHorizonCount} today-facing · {weeklyHorizonCount} week-facing
              </div>
            )}
          </OrientationPanel>
      </div>

          <OrientationPanel
            label="Current Focus"
            actionLabel="Manage"
            onAction={() => onNavigate("priorities")}
          >
            {previewPriorities.length === 0 ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "#8b8b8b",
                  fontStyle: "italic",
                }}
              >
                No commitments in focus.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {previewPriorities.map((priority) => (
                  <div key={priority.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 99,
                        background: "#4A9EFF",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 15,
                        color:
                          normalizeHorizon(priority.horizon) === "today"
                            ? "#d5d5d5"
                            : normalizeHorizon(priority.horizon) === "this week"
                            ? "#c7c7c7"
                            : "#9a9a9a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {priority.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color:
                          normalizeHorizon(priority.horizon) === "today"
                            ? "#4A9EFF"
                            : "#4f4f4f",
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {horizonLabel(priority.horizon)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </OrientationPanel>

          <OrientationPanel label="This Week">
            {weekAnchors.length === 0 ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: "#8b8b8b",
                  fontStyle: "italic",
                }}
              >
                No weekly anchors yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {weekAnchors.slice(0, 3).map((anchor) => (
                  <div
                    key={anchor.id}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: "#c7c7c7",
                      lineHeight: 1.3,
                    }}
                  >
                    {anchor.text}
                  </div>
                ))}
              </div>
            )}
          </OrientationPanel>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              ref={quickAddInputRef}
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              onFocus={() => {
                requestAnimationFrame(() => {
                  quickAddInputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                });
              }}
              placeholder="Add day item..."
              disabled={isAdding}
              style={{
                flex: 1,
                background: "#111",
                border: "1px solid #222",
                borderRadius: 10,
                color: "#ccc",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                padding: "10px 13px",
                outline: "none",
                opacity: isAdding ? 0.7 : 1,
              }}
            />
            <button
              onClick={addTask}
              className="tappable"
              aria-label="Add day item"
              disabled={!quickAdd.trim() || isAdding}
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background:
                  quickAdd.trim() && !isAdding ? "rgba(74,158,255,0.1)" : "transparent",
                border: `1px solid ${
                  quickAdd.trim() && !isAdding ? "rgba(74,158,255,0.35)" : "#222"
                }`,
                color: quickAdd.trim() && !isAdding ? "#4A9EFF" : "#2e2e2e",
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: quickAdd.trim() && !isAdding ? "pointer" : "default",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              +
            </button>
          </div>

          <OrientationPanel
            label="Domains"
            actionLabel="Open"
            onAction={() => onNavigate("domains")}
          >
            {activeDomains.length === 0 ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: "#8b8b8b",
                  fontStyle: "italic",
                }}
              >
                No active domains set.
              </div>
            ) : (
              <>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {visibleActiveDomains.map((domain) => (
                  <div key={domain.id} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: "#4A9EFF",
                        letterSpacing: "0.06em",
                        minWidth: 52,
                        flexShrink: 0,
                      }}
                    >
                      {domain.name.toUpperCase()}
                    </span>
                    <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: domain.focus ? "#9a9a9a" : "#6f6f6f",
                      fontStyle: domain.focus ? "normal" : "italic",
                      lineHeight: 1.3,
                      }}
                    >
                      {domain.focus || "No emphasis set"}
                    </span>
                  </div>
                ))}
              </div>
              {hiddenDomainCount > 0 && (
                <button
                  type="button"
                  onClick={() => setDomainsExpanded(true)}
                  className="tappable"
                  style={{
                    marginTop: 6,
                    background: "none",
                    border: "none",
                    color: "#5d5d5d",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Show {hiddenDomainCount} more
                </button>
              )}
              {isShortViewport && domainsExpanded && activeDomains.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDomainsExpanded(false)}
                  className="tappable"
                  style={{
                    marginTop: 6,
                    background: "none",
                    border: "none",
                    color: "#4f4f4f",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Show less
                </button>
              )}
              </>
            )}
          </OrientationPanel>

          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--mobile-section-title-size)",
                fontWeight: 600,
                color: "#9a9a9a",
                lineHeight: 1.3,
              }}
            >
              Day Items
            </span>
          </div>
          {tasks.length > 1 && (
            <div
              style={{
                marginBottom: 8,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: "#4f4f4f",
                letterSpacing: "0.04em",
              }}
            >
              Hold and drag any day item to reorder
            </div>
          )}

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
            {tasks.length === 0 ? (
              <div style={{ padding: "28px 0 20px" }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#9a9a9a",
                    fontStyle: "italic",
                    marginBottom: 6,
                  }}
                >
                  No day items yet
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#7f7f7f",
                    lineHeight: 1.4,
                  }}
                >
                  Capture what needs to be handled today
                </div>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  isDragging={dragId === task.id}
                  isOver={overIndex === index && dragId !== task.id}
                />
              ))
            )}
          </div>
    </MobileShell>
  );
}




