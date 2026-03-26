import { useCallback, useRef, useState } from "react";
import BottomNav from "./BottomNav";
import { supabase } from "./lib/supabase";
import { createTodayTask } from "./data/todayTasks";

function todayDateLabel() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[now.getDay()];
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const yy = String(now.getFullYear()).slice(-2);
  return `${day} / ${m}.${d}.${yy}`;
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
          padding: isDragging ? "13px 10px" : "13px 0",
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
          aria-label={task.done ? `Mark "${task.label}" as not done` : `Mark "${task.label}" as done`}
          style={{ flexShrink: 0, cursor: "pointer", background: "none", border: "none" }}
        >
          <CheckIcon checked={task.done} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: task.done ? "#383838" : "#d0d0d0",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.35,
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
            opacity: 0.18,
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

const SettingsSheet = ({ onClose, onSignOut }) => (
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
      onClick={onClose}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
    />
    <div style={SHEET_STYLE}>
      <div style={SHEET_HANDLE} />
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: "#383838",
          letterSpacing: "0.14em",
          marginBottom: 4,
        }}
      >
        ACCOUNT
      </div>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e1e" }}>
        <button
          type="button"
          onClick={onSignOut}
          className="tappable"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 14px",
            cursor: "pointer",
            background: "#000",
            border: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#bbb",
              fontWeight: 400,
            }}
          >
            Sign Out
          </span>
          <span style={{ color: "#333", fontSize: 16 }}>&rsaquo;</span>
        </button>
      </div>
    </div>
  </div>
);

export default function Today({ onNavigate, tasks, setTasks, userId, onSignOut }) {
  const [quickAdd, setQuickAdd] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const listRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const dateLabel = todayDateLabel();
  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;

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
      setActionError(error.message || "Could not add task.");
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
      setActionError(error.message || "Could not update task.");
    }
  }

  async function deleteTask(id) {
    const previous = tasksRef.current;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodayTaskForUser(id, userId);
    } catch (error) {
      setTasks(previous);
      setActionError(error.message || "Could not delete task.");
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

  let statusText = "No tasks";
  let statusColor = "#333";
  let statusBorder = "#1e1e1e";

  if (total > 0) {
    if (doneCount === total) {
      statusText = "All done";
      statusColor = "#34C759";
      statusBorder = "rgba(52,199,89,0.35)";
    } else {
      statusText =
        doneCount === 0 ? `${total} task${total !== 1 ? "s" : ""}` : `${doneCount} of ${total} done`;
      statusColor = "#4A9EFF";
      statusBorder = "rgba(74,158,255,0.3)";
    }
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
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingInline: 16,
          }}
        >
          <button
            onClick={() => setSettingsOpen(true)}
            className="tappable"
            aria-label="Open account settings"
            style={{
              background: "none",
              border: "none",
              color: "#3a3a3a",
              fontSize: 17,
              cursor: "pointer",
              letterSpacing: "3px",
              padding: "4px 2px",
            }}
          >
            ...
          </button>
        </div>

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
            {dateLabel}
          </h1>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#383838",
              letterSpacing: "0.06em",
            }}
          >
            Today
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 10,
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
              color: statusColor,
              border: `1px solid ${statusBorder}`,
              letterSpacing: "0.06em",
              transition: "all 0.3s ease",
            }}
          >
            {statusText}
          </span>
        </div>

        {actionError ? (
          <div
            style={{
              paddingInline: 14,
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

        <div style={{ flex: 1, overflowY: "auto", paddingInline: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a task..."
              disabled={isAdding}
              style={{
                flex: 1,
                background: "#111",
                border: "1px solid #222",
                borderRadius: 9,
                color: "#ccc",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                padding: "10px 12px",
                outline: "none",
                opacity: isAdding ? 0.7 : 1,
              }}
            />
            <button
              onClick={addTask}
              className="tappable"
              aria-label="Add task"
              disabled={!quickAdd.trim() || isAdding}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
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

          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "#555",
                letterSpacing: "0.1em",
              }}
            >
              TASKS
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
                    color: "#888",
                    fontStyle: "italic",
                    marginBottom: 6,
                  }}
                >
                  No tasks yet
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#555",
                    letterSpacing: "0.06em",
                  }}
                >
                  Add what needs to get done today
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

        {settingsOpen && (
          <SettingsSheet
            onClose={() => setSettingsOpen(false)}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </div>
  );
}

