import { useCallback, useEffect, useRef, useState } from "react";

const PRIORITY_COLORS = {
  HIGH: { color: "#FF453A", border: "#FF453A", bg: "rgba(255,69,58,0.07)" },
  NORMAL: { color: "#666", border: "#2e2e2e", bg: "transparent" },
  LOW: { color: "#383838", border: "#222", bg: "transparent" },
};

const PRIORITY_WEIGHT = { HIGH: 3, NORMAL: 2, LOW: 1 };
const FILTERS = ["HIGH", "NORMAL", "LOW"];

const SETTINGS_SECTIONS = [
  { title: "SESSION", items: ["Duplicate", "Export", "Archive", "Rename"] },
  { title: "PERSONAL", items: ["Themes", "Profile", "Preferences"] },
  { title: "VIEW", items: ["Display Options", "Layout Adjustments", "Motion Intensity"] },
];

function getPctColor(pct) {
  if (pct === 100) return "#34C759";
  return "#4A9EFF";
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

const SHEET_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  color: "#555",
  letterSpacing: "0.1em",
  marginBottom: 16,
};

const BTN_PRIMARY = {
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  background: "#4A9EFF",
  border: "none",
  color: "white",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const BTN_GHOST = {
  flex: 1,
  padding: "13px",
  borderRadius: 12,
  background: "transparent",
  border: "1px solid #222222",
  color: "#666",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const BTN_DANGER = {
  flex: 1,
  padding: "13px",
  borderRadius: 12,
  background: "#FF453A",
  border: "none",
  color: "white",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
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

const PriorityBadge = ({ label }) => {
  const c = PRIORITY_COLORS[label] || PRIORITY_COLORS.LOW;
  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
        letterSpacing: "0.06em",
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        padding: "2px 6px",
        lineHeight: 1,
        opacity: label === "LOW" ? 0.6 : 1,
      }}
    >
      {label}
    </span>
  );
};

const LockToggle = ({ locked, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 11px",
      borderRadius: 6,
      border: `1px solid ${locked ? "#252525" : "rgba(74,158,255,0.4)"}`,
      background: locked ? "transparent" : "rgba(74,158,255,0.07)",
      color: locked ? "#444" : "#4A9EFF",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: "0.08em",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
  >
    <div
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: locked ? "#333" : "#4A9EFF",
        transition: "background 0.2s ease",
      }}
    />
    {locked ? "LOCKED" : "EDIT"}
  </button>
);

const SettingsLayer = ({ onClose, onAction }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#080808",
      borderRadius: "inherit",
      animation: "slideInRight 0.52s cubic-bezier(0.16,1,0.3,1) forwards",
      display: "flex",
      flexDirection: "column",
      zIndex: 10,
    }}
  >
    <div
      style={{
        position: "relative",
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        borderBottom: "1px solid #222",
      }}
    >
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#444",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          letterSpacing: "0.04em",
          padding: 0,
        }}
      >
        ‹ <span style={{ color: "#383838" }}>back</span>
      </button>
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: "#555",
          letterSpacing: "0.1em",
        }}
      >
        SETTINGS
      </span>
    </div>

    <div style={{ flex: 1, overflowY: "auto", padding: "8px 18px 32px" }}>
      {SETTINGS_SECTIONS.map((section, si) => (
        <div key={si} style={{ marginTop: 24 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: "#383838",
              letterSpacing: "0.14em",
              marginBottom: 4,
            }}
          >
            {section.title}
          </div>

          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #222" }}>
            {section.items.map((item, ii) => (
              <div
                key={ii}
                onClick={() => onAction(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 14px",
                  borderBottom: ii < section.items.length - 1 ? "1px solid #111111" : "none",
                  cursor: "pointer",
                  background: "#000000",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#131313";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#000000";
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
                  {item}
                </span>
                <span style={{ color: "#333", fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RenameSheet = ({ currentName, onSave, onClose, isSaving }) => {
  const [value, setValue] = useState(currentName);

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
        <div style={SHEET_LABEL}>RENAME SESSION</div>
        <input
          autoFocus
          value={value}
          disabled={isSaving}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim() && !isSaving) onSave(value.trim());
          }}
          style={{
            width: "100%",
            background: "#161616",
            border: "1.5px solid #4A9EFF",
            borderRadius: 9,
            color: "#f0f0f0",
            fontFamily: "'DM Serif Display', serif",
            fontSize: 22,
            padding: "12px 14px",
            outline: "none",
            marginBottom: 16,
            opacity: isSaving ? 0.7 : 1,
          }}
        />
        <button
          onClick={() => value.trim() && !isSaving && onSave(value.trim())}
          disabled={isSaving}
          style={{ ...BTN_PRIMARY, opacity: isSaving ? 0.7 : 1 }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

const EditSheet = ({ task, onSave, onClose, isSaving }) => {
  const [label, setLabel] = useState(task.label);
  const [time, setTime] = useState(task.time);
  const [priority, setPriority] = useState(task.priority);

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
        <div style={SHEET_LABEL}>EDIT TASK</div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#444",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            LABEL
          </div>
          <input
            value={label}
            disabled={isSaving}
            onChange={(e) => setLabel(e.target.value)}
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
              opacity: isSaving ? 0.7 : 1,
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#444",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            TIME
          </div>
          <input
            value={time}
            disabled={isSaving}
            onChange={(e) => setTime(e.target.value)}
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
              opacity: isSaving ? 0.7 : 1,
            }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#444",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            PRIORITY
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {FILTERS.map((f) => {
              const active = priority === f;
              const activeColor = f === "HIGH" ? "#FF453A" : "#4A9EFF";
              const activeBg = f === "HIGH" ? "rgba(255,69,58,0.07)" : "rgba(74,158,255,0.07)";

              return (
                <button
                  key={f}
                  onClick={() => !isSaving && setPriority(f)}
                  disabled={isSaving}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: `1px solid ${active ? activeColor : "#222"}`,
                    background: active ? activeBg : "transparent",
                    color: active ? activeColor : "#444",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    fontWeight: 500,
                    cursor: isSaving ? "default" : "pointer",
                    transition: "all 0.15s ease",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => !isSaving && onSave({ ...task, label, time, priority })}
          disabled={isSaving}
          style={{ ...BTN_PRIMARY, opacity: isSaving ? 0.7 : 1 }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ConfirmDeleteSheet = ({ taskLabel, onConfirm, onClose, isSaving }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 30,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    }}
  >
    <div
      onClick={isSaving ? undefined : onClose}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }}
    />
    <div style={SHEET_STYLE}>
      <div style={SHEET_HANDLE} />
      <div
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 20,
          color: "#f0f0f0",
          marginBottom: 8,
        }}
      >
        Delete task?
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#555",
          marginBottom: 24,
        }}
      >
        "{taskLabel}" will be permanently removed.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} disabled={isSaving} style={BTN_GHOST}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isSaving} style={BTN_DANGER}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

function SwipeRow({ task, onTap, onToggle, onDelete, isDragging, isOver, isSaving }) {
  const swipeX = useRef(0);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = -90;

  const onTouchStart = (e) => {
    if (!isDragging && !isSaving) startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (isDragging || isSaving) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) return;
    swipeX.current = Math.max(dx, -110);
    setOffset(swipeX.current);
  };

  const onTouchEnd = () => {
    if (swipeX.current < THRESHOLD && !isSaving) onDelete(task.id);
    setOffset(0);
    swipeX.current = 0;
  };

  const reveal = Math.min(Math.abs(offset), 110);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #2a2a2a" }}>
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
          transition: isDragging ? "none" : "width 0.1s ease",
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
            DELETE
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
          padding: isDragging ? "12px 10px" : "12px 0",
          marginLeft: isDragging ? -10 : 0,
          marginRight: isDragging ? -10 : 0,
          cursor: "default",
          opacity: isOver ? 0.25 : isSaving ? 0.7 : 1,
          transform: isDragging ? "scale(1.04)" : `translateX(${offset}px)`,
          background: isDragging ? "#222222" : "#111111",
          borderRadius: isDragging ? 12 : 0,
          boxShadow: isDragging ? "0 16px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)" : "none",
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
          onClick={(e) => {
            e.stopPropagation();
            if (offset === 0 && !isDragging && !isSaving) onToggle(task.id);
          }}
        >
          <CheckIcon checked={task.done} />
        </div>

        <div
          onClick={() => offset === 0 && !isDragging && !isSaving && onTap(task.id)}
          style={{ flex: 1, minWidth: 0 }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: task.done ? "#3a3a3a" : "#d0d0d0",
              textDecoration: task.done ? "line-through" : "none",
              textDecorationColor: "#3a3a3a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 3,
            }}
          >
            {task.label}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: "#606060",
              }}
            >
              @ {task.time}
            </span>
            <PriorityBadge label={task.priority} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveSession({
  onNavigate,
  sessionName,
  tasks,
  onRenameSession,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onCreateNewSession,
}) {
  const [activeFilter, setActiveFilter] = useState("NORMAL");
  const [displayTasks, setDisplayTasks] = useState(tasks || []);
  const [quickAdd, setQuickAdd] = useState("");
  const [locked, setLocked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const listRef = useRef(null);
  const holdTimer = useRef(null);
  const dragIdRef = useRef(null);
  const displayTasksRef = useRef(displayTasks);
  displayTasksRef.current = displayTasks;

  useEffect(() => {
    if (!dragIdRef.current) {
      setDisplayTasks(tasks || []);
    }
  }, [tasks]);

  const completedCount = displayTasks.filter((t) => t.done).length;
  const total = displayTasks.length;
  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const totalPoints = displayTasks.reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] || 2), 0);
  const earnedPoints = displayTasks
    .filter((t) => t.done)
    .reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] || 2), 0);
  const weightedPct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const completionColor = getPctColor(completionPct);
  const weightedColor = getPctColor(weightedPct);
  const isComplete = total > 0 && completionPct === 100;

  async function runMutation(work) {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await work();
    } catch (error) {
      console.error(error);
      alert(error.message || "Action failed.");
    } finally {
      setIsSaving(false);
    }
  }

  const toggleTask = async (id) => {
    if (dragIdRef.current) return;
    await runMutation(async () => {
      await onToggleTask(id);
    });
  };

  const openEdit = (id) => {
    if (locked || dragIdRef.current || isSaving) return;
    const task = displayTasks.find((t) => t.id === id);
    if (task) setEditTask(task);
  };

  const saveEdit = async (updated) => {
    await runMutation(async () => {
      await onUpdateTask(updated);
      setEditTask(null);
    });
  };

  const deleteTask = (id) => {
    if (isSaving) return;
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    await runMutation(async () => {
      await onDeleteTask(confirmDeleteId);
      setConfirmDeleteId(null);
    });
  };

  const addTask = async () => {
    if (!quickAdd.trim() || locked) return;

    const value = quickAdd.trim();

    await runMutation(async () => {
      await onAddTask({
        label: value,
        priority: activeFilter,
      });
      setQuickAdd("");
    });
  };

  const handleNewSession = async () => {
    await runMutation(async () => {
      await onCreateNewSession();
      setQuickAdd("");
      setSettingsOpen(false);
      setRenameOpen(false);
      setEditTask(null);
      setConfirmDeleteId(null);
      setLocked(false);
      setActiveFilter("NORMAL");
    });
  };

  const handleSettingsAction = (item) => {
    if (item === "Rename") {
      setSettingsOpen(false);
      setRenameOpen(true);
    }
    if (item === "Archive") {
      setSettingsOpen(false);
      onNavigate?.("archived");
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

  const onContainerPointerDown = useCallback(
    (e) => {
      if (locked || isSaving) return;
      const rows = Array.from(listRef.current?.children || []);
      let idx = null;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].contains(e.target)) {
          idx = i;
          break;
        }
      }

      if (idx === null) return;
      const id = displayTasksRef.current[idx]?.id;
      if (!id) return;

      holdTimer.current = setTimeout(() => {
        dragIdRef.current = id;
        setDragId(id);
        if (navigator.vibrate) navigator.vibrate(30);
      }, 280);
    },
    [locked, isSaving]
  );

  const onContainerPointerMove = useCallback(
    (e) => {
      if (!dragIdRef.current || isSaving) return;
      e.preventDefault();
      const idx = getIndexAtY(e.clientY);
      if (idx === null) return;

      const from = displayTasksRef.current.findIndex((t) => t.id === dragIdRef.current);
      if (idx === from) return;

      setOverIndex(idx);
      setDisplayTasks((prev) => {
        const next = [...prev];
        const fromIndex = next.findIndex((t) => t.id === dragIdRef.current);
        if (fromIndex === -1) return prev;
        const [moved] = next.splice(fromIndex, 1);
        next.splice(idx, 0, moved);
        return next;
      });
    },
    [getIndexAtY, isSaving]
  );

  const onContainerPointerUp = useCallback(async () => {
    clearTimeout(holdTimer.current);

    const dragged = dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);

    const reorderedIds = displayTasksRef.current.map((task) => task.id);
    setOverIndex(null);

    if (!dragged || isSaving) return;

    try {
      setIsSaving(true);
      await onReorderTasks(reorderedIds);
    } catch (error) {
      console.error(error);
      alert(error.message || "Task reorder failed.");
      setDisplayTasks(tasks || []);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onReorderTasks, tasks]);

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        *:not(input) { -webkit-user-select: none; user-select: none; }
        .nsb:hover span { color: #4A9EFF !important; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0.7; } to { transform: translateX(0); opacity: 1; } }
        @keyframes sheetUp { from { transform: translateY(100%); opacity: 0.8; } to { transform: translateY(0); opacity: 1; } }
        @keyframes glowHalo { 0%, 100% { opacity: 0.5; r: 180px; } 50% { opacity: 0.85; r: 183px; } }
        @keyframes outerRing { 0%, 100% { r: 168px; stroke-opacity: 0.9; } 50% { r: 171px; stroke-opacity: 1; } }
        @keyframes innerRing { 0%, 100% { r: 122px; stroke-opacity: 0.85; } 50% { r: 125px; stroke-opacity: 1; } }
        @keyframes dotGlow { 0%, 100% { opacity: 0.12; r: 22px; } 50% { opacity: 0.4; r: 28px; } }
      `}</style>

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
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ position: "relative", height: 44, flexShrink: 0 }}>
          <button
            onClick={() => !isSaving && onNavigate?.("home")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "none",
              border: "none",
              color: "#4a4a4a",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.06em",
              cursor: isSaving ? "default" : "pointer",
              padding: "14px 16px",
              transition: "color 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
          >
            ← Today
          </button>
          <button
            onClick={() => !isSaving && setSettingsOpen(true)}
            style={{
              position: "absolute",
              top: 10,
              right: 16,
              background: "none",
              border: "none",
              color: "#4a4a4a",
              fontSize: 17,
              cursor: isSaving ? "default" : "pointer",
              letterSpacing: "3px",
              padding: "4px 2px",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            ···
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 10,
            flexShrink: 0,
            gap: 6,
            paddingInline: 14,
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            <defs>
              <radialGradient id="hGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4A9EFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0" />
              </radialGradient>
              <filter id="hDotBlur" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            <circle
              cx="256"
              cy="256"
              r="180"
              fill="url(#hGlowGrad)"
              style={{ animation: "glowHalo 3s ease-in-out infinite" }}
            />
            <circle
              cx="256"
              cy="256"
              r="168"
              stroke="white"
              strokeWidth="10"
              style={{ animation: "outerRing 3s ease-in-out infinite" }}
            />
            <circle
              cx="256"
              cy="256"
              r="122"
              stroke="#4A9EFF"
              strokeWidth="8"
              style={{ animation: "innerRing 3s ease-in-out infinite" }}
            />
            <circle
              cx="256"
              cy="256"
              r="22"
              fill="#4A9EFF"
              filter="url(#hDotBlur)"
              style={{ animation: "dotGlow 3s ease-in-out infinite" }}
            />
            <circle cx="256" cy="256" r="22" fill="#4A9EFF" />
            <circle cx="256" cy="256" r="14" fill="white" fillOpacity="0.25" />
          </svg>

          <button
            type="button"
            onClick={() => !isSaving && setRenameOpen(true)}
            disabled={isSaving}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: isSaving ? "default" : "pointer",
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              const heading = e.currentTarget.querySelector("span");
              if (heading) heading.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              const heading = e.currentTarget.querySelector("span");
              if (heading) heading.style.color = "#f0f0f0";
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: "'DM Serif Display', serif",
                fontSize: 28,
                fontWeight: 400,
                color: "#f0f0f0",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                textAlign: "center",
                transition: "color 0.15s ease",
              }}
            >
              {sessionName}
            </span>
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4, flexShrink: 0 }}>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#555",
              border: "1px solid #2a2a2a",
            }}
          >
            Active Session
          </span>

          {completionPct === 100 ? (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: "#34C759",
                border: "1px solid rgba(52,199,89,0.35)",
              }}
            >
              Complete
            </span>
          ) : (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: "#4A9EFF",
                border: "1px solid rgba(74,158,255,0.3)",
              }}
            >
              In Progress
            </span>
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#606060",
            marginBottom: 10,
            flexShrink: 0,
            letterSpacing: "0.02em",
            paddingInline: 14,
          }}
        >
          {total} tasks&nbsp;&nbsp;·&nbsp;&nbsp;{displayTasks.filter((t) => t.priority === "HIGH").length} high
          priority&nbsp;&nbsp;·&nbsp;&nbsp;{total} scheduled
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 12,
            flexShrink: 0,
            paddingInline: 14,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "COMPLETION", value: `${completionPct}%`, color: completionColor },
            { label: "WEIGHTED", value: `${weightedPct}%`, color: weightedColor },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 20,
                background: `${color}18`,
                border: `1.5px solid ${color}55`,
                transition: "background 0.5s ease, border-color 0.5s ease",
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  color,
                  transition: "color 0.5s ease",
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color,
                  opacity: 0.6,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ paddingInline: 14, flexShrink: 0 }}>
          <div
            style={{
              background: "#111111",
              borderRadius: 16,
              padding: "14px 16px 16px",
              border: "1px solid #1a1a1a",
              display: "flex",
              flexDirection: "column",
              overflow: dragId ? "visible" : "hidden",
            }}
          >
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#666",
                  letterSpacing: "0.1em",
                }}
              >
                WORK STACK
              </span>
            </div>

            {!isComplete && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexShrink: 0 }}>
                <input
                  style={{
                    background: "#0d0d0d",
                    border: `1px solid ${locked ? "#1a1a1a" : "#222"}`,
                    borderRadius: 8,
                    color: locked ? "#333" : "#bbb",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    padding: "8px 11px",
                    flex: 1,
                    outline: "none",
                    transition: "all 0.15s ease",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                  placeholder={locked ? "Unlock to add tasks..." : "What's next?"}
                  value={quickAdd}
                  disabled={locked || isSaving}
                  onChange={(e) => setQuickAdd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />

                <button
                  onClick={addTask}
                  disabled={locked || isSaving}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: locked ? "transparent" : "rgba(74,158,255,0.1)",
                    border: `1px solid ${locked ? "#1a1a1a" : "rgba(74,158,255,0.35)"}`,
                    color: locked ? "#2e2e2e" : "#4A9EFF",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: locked || isSaving ? "default" : "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  +
                </button>
              </div>
            )}

            {!isComplete && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 10,
                  flexShrink: 0,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {FILTERS.map((f) => {
                    const active = activeFilter === f;
                    const activeColor = f === "HIGH" ? "#FF453A" : "#4A9EFF";
                    const activeBg = f === "HIGH" ? "rgba(255,69,58,0.07)" : "rgba(74,158,255,0.07)";

                    return (
                      <button
                        key={f}
                        onClick={() => !isSaving && setActiveFilter(f)}
                        disabled={isSaving}
                        style={{
                          padding: "5px 13px",
                          borderRadius: 20,
                          border: `1px solid ${active ? activeColor : "#222"}`,
                          background: active ? activeBg : "transparent",
                          color: active ? activeColor : "#444",
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          cursor: isSaving ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          opacity: isSaving ? 0.7 : 1,
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>

                <LockToggle locked={locked} onToggle={() => !isSaving && setLocked(!locked)} />
              </div>
            )}

            <div
              ref={listRef}
              style={{
                maxHeight: "46dvh",
                overflowY: dragId ? "visible" : "auto",
                touchAction: dragId ? "none" : "pan-y",
              }}
              onPointerDown={onContainerPointerDown}
              onPointerMove={onContainerPointerMove}
              onPointerUp={onContainerPointerUp}
              onPointerLeave={onContainerPointerLeave}
            >
              {displayTasks.length === 0 ? (
                <div
                  style={{
                    padding: "36px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#444",
                      fontStyle: "italic",
                    }}
                  >
                    What is this session for?
                  </span>
                </div>
              ) : (
                displayTasks.map((task, index) => (
                  <SwipeRow
                    key={task.id}
                    task={task}
                    onTap={openEdit}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    isDragging={dragId === task.id}
                    isOver={overIndex === index && dragId !== task.id}
                    isSaving={isSaving}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ paddingInline: 14, paddingTop: 14, paddingBottom: "max(12px, env(safe-area-inset-bottom))", flexShrink: 0 }}>
          <div style={{ borderTop: "1px solid #181818", paddingTop: 11 }}>
            <button
              onClick={handleNewSession}
              disabled={isSaving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "none",
                cursor: isSaving ? "default" : "pointer",
                padding: "4px 2px",
                opacity: isSaving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.querySelector("span").style.color = "#4A9EFF")}
              onMouseLeave={(e) => (e.currentTarget.querySelector("span").style.color = isComplete ? "#4A9EFF" : "#4a4a4a")}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  color: isComplete ? "#4A9EFF" : "#4a4a4a",
                  letterSpacing: "0.08em",
                  transition: "color 0.15s ease",
                }}
              >
                + New Session
              </span>
            </button>
          </div>
        </div>

        {settingsOpen && (
          <SettingsLayer onClose={() => setSettingsOpen(false)} onAction={handleSettingsAction} />
        )}

        {renameOpen && (
          <RenameSheet
            currentName={sessionName}
            isSaving={isSaving}
            onSave={(name) =>
              runMutation(async () => {
                await onRenameSession(name);
                setRenameOpen(false);
              })
            }
            onClose={() => setRenameOpen(false)}
          />
        )}

        {editTask && (
          <EditSheet
            task={editTask}
            isSaving={isSaving}
            onSave={saveEdit}
            onClose={() => setEditTask(null)}
          />
        )}

        {confirmDeleteId && (
          <ConfirmDeleteSheet
            taskLabel={displayTasks.find((t) => t.id === confirmDeleteId)?.label || ""}
            isSaving={isSaving}
            onConfirm={confirmDelete}
            onClose={() => setConfirmDeleteId(null)}
          />
        )}
      </div>
    </div>
  );
}