import { useCallback, useRef, useState } from "react";
import BottomNav from "./BottomNav";
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
    if (swipeX.current < THRESHOLD) onDelete(task.id);
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
          gap: 12,
          padding: isDragging ? "14px 10px" : "14px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          opacity: isOver ? 0.25 : task.done ? 0.38 : 1,
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

function OrientationPanel({ label, actionLabel, onAction, children }) {
  return (
    <div
      style={{
        border: "1px solid #1d1d1d",
        borderRadius: 12,
        padding: "12px 13px",
        background: "#090909",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
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
              fontSize: 14,
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

  const listRef = useRef(null);
  const quickAddInputRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
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
    const id = tasksRef.current[idx]?.id;
    if (!id) return;

    holdTimer.current = setTimeout(() => {
      dragIdRef.current = id;
      setDragId(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 280);
  }, []);

  const onContainerPointerMove = useCallback((e) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    const idx = getIndexAtY(e.clientY);
    if (idx === null) return;
    const from = tasksRef.current.findIndex((t) => t.id === dragIdRef.current);
    if (idx === from) return;
    setOverIndex(idx);
    setTasks((prev) => {
      const next = [...prev];
      const f = next.findIndex((t) => t.id === dragIdRef.current);
      if (f === -1) return prev;
      const [moved] = next.splice(f, 1);
      next.splice(idx, 0, moved);
      return next;
    });
  }, [getIndexAtY, setTasks]);

  const onContainerPointerUp = useCallback(async () => {
    clearTimeout(holdTimer.current);
    const wasDragging = !!dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);
    setOverIndex(null);
    if (!wasDragging) return;
    try {
      await persistSortOrders(tasksRef.current);
    } catch (error) {
      setActionError(error.message || "Could not save order.");
    }
  }, [persistSortOrders]);

  const onContainerPointerLeave = useCallback(() => {
    clearTimeout(holdTimer.current);
  }, []);

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
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

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
        <div
          style={{
            height: 38,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingInline: 16,
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
            marginBottom: 14,
            flexShrink: 0,
            paddingInline: 16,
          }}
        >
          <img
            src="/icons/favicon-32.png"
            alt=""
            aria-hidden="true"
            style={{ width: 28, height: 28, opacity: 0.5, marginBottom: 14 }}
          />
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              fontWeight: 400,
              color: "#f0f0f0",
              lineHeight: "36px",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {dateLabel}
          </h1>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#383838",
              letterSpacing: "0.06em",
              lineHeight: 1.3,
            }}
          >
            Today
          </span>
        </div>

        {actionError ? (
          <div
            style={{
              paddingInline: 16,
              marginBottom: 8,
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

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingInline: 16,
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          }}
        >
          <OrientationPanel label="Active Session">
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: "#c7c7c7",
                marginBottom: 4,
              }}
            >
              {total === 0
                ? "No day items defined."
                : `${doneCount}/${total} day items complete.`}
            </div>
            <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  color: "#727272",
                  letterSpacing: "0.04em",
                }}
            >
              {activePriorities.length} in focus · {activeDomains.length} active domains
            </div>
            {(todayHorizonCount > 0 || weeklyHorizonCount > 0) && (
              <div
                style={{
                  marginTop: 4,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  color: "#666666",
                  letterSpacing: "0.04em",
                }}
              >
                {todayHorizonCount} today-facing · {weeklyHorizonCount} week-facing
              </div>
            )}
          </OrientationPanel>

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
                        fontSize: 16,
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
                        fontSize: 13,
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
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {weekAnchors.slice(0, 3).map((anchor) => (
                  <div
                    key={anchor.id}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15,
                      color: "#c7c7c7",
                      lineHeight: 1.35,
                    }}
                  >
                    {anchor.text}
                  </div>
                ))}
              </div>
            )}
          </OrientationPanel>

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
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {activeDomains.slice(0, 3).map((domain) => (
                  <div key={domain.id} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      color: "#4A9EFF",
                        letterSpacing: "0.06em",
                        minWidth: 56,
                        flexShrink: 0,
                      }}
                    >
                      {domain.name.toUpperCase()}
                    </span>
                    <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15,
                      color: domain.focus ? "#9a9a9a" : "#6f6f6f",
                      fontStyle: domain.focus ? "normal" : "italic",
                      lineHeight: 1.35,
                      }}
                    >
                      {domain.focus || "No emphasis set"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </OrientationPanel>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
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
                padding: "12px 14px",
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
                width: 44,
                height: 44,
                borderRadius: 10,
                background:
                  quickAdd.trim() && !isAdding ? "rgba(74,158,255,0.1)" : "transparent",
                border: `1px solid ${
                  quickAdd.trim() && !isAdding ? "rgba(74,158,255,0.35)" : "#222"
                }`,
                color: quickAdd.trim() && !isAdding ? "#4A9EFF" : "#2e2e2e",
                fontSize: 22,
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

          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#9a9a9a",
                lineHeight: 1.3,
              }}
            >
              Day Items
            </span>
          </div>

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
        </div>

        <BottomNav current="home" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

