import { useMemo, useState } from "react";
import BottomNav from "./BottomNav";

export default function Standards({
  onNavigate,
  standards,
  maxStandards = 6,
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

  const sortedStandards = useMemo(() => {
    return [...standards].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [standards]);

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
      setLocalError(`You can keep up to ${maxStandards} standards.`);
      return;
    }

    try {
      setIsSaving(true);
      setLocalError("");
      await onAddStandard(cleanDraft);
      setDraft("");
    } catch (error) {
      console.error("Add standard failed:", error);
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
      console.error("Update standard failed:", error);
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

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Delete standard failed:", error);
      setLocalError(error.message || "Failed to delete standard.");
    } finally {
      setIsSaving(false);
    }
  }

  async function moveStandard(id, direction) {
    const currentIndex = sortedStandards.findIndex((standard) => standard.id === id);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sortedStandards.length) return;

    const nextStandards = [...sortedStandards];
    const temp = nextStandards[currentIndex];
    nextStandards[currentIndex] = nextStandards[targetIndex];
    nextStandards[targetIndex] = temp;

    const nextIds = nextStandards.map((standard) => standard.id);

    try {
      setIsSaving(true);
      setLocalError("");
      await onReorderStandards(nextIds);
    } catch (error) {
      console.error("Reorder standards failed:", error);
      setLocalError(error.message || "Failed to reorder standards.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSaveEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  async function handleDraftKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleAdd();
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
            marginBottom: 10,
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
            }}
          >
            Standards
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
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
            }}
          >
            Non-Negotiables · {sortedStandards.length}/{maxStandards}
          </span>
        </div>

        <div style={{ paddingInline: 14, paddingBottom: 14, flexShrink: 0 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#555",
                  letterSpacing: "0.1em",
                }}
              >
                HOW I OPERATE
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: localError ? 8 : 0,
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder={hasReachedMax ? "Maximum reached" : "Add a standard"}
                disabled={hasReachedMax || isSaving}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "#0a0a0a",
                  border: "1px solid #1d1d1d",
                  borderRadius: 12,
                  color: "#d6d6d6",
                  fontSize: 14,
                  padding: "12px 12px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />

              <button
                onClick={handleAdd}
                disabled={hasReachedMax || isSaving}
                style={{
                  flexShrink: 0,
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid #2a2a2a",
                  color: hasReachedMax ? "#444" : "#c8c8c8",
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                ADD
              </button>
            </div>

            {localError ? (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#8a8a8a",
                  lineHeight: 1.4,
                }}
              >
                {localError}
              </div>
            ) : null}

            {sortedStandards.length === 0 ? (
              <div
                style={{
                  paddingTop: 16,
                  paddingBottom: 4,
                }}
              >
                <p
                  style={{
                    color: "#6e6e6e",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  No standards set yet.
                </p>
                <p
                  style={{
                    color: "#4f4f4f",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginTop: 4,
                  }}
                >
                  Define the rules you operate by.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: 14 }}>
                {sortedStandards.map((standard, index) => {
                  const isEditing = editingId === standard.id;
                  const isFirst = index === 0;
                  const isLast = index === sortedStandards.length - 1;

                  return (
                    <div
                      key={standard.id}
                      style={{
                        borderTop: "1px solid #1e1e1e",
                        padding: "14px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            paddingTop: 2,
                          }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editingText}
                              onChange={(event) => setEditingText(event.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onBlur={handleSaveEdit}
                              style={{
                                width: "100%",
                                background: "#0a0a0a",
                                border: "1px solid #262626",
                                borderRadius: 10,
                                color: "#d6d6d6",
                                fontSize: 14,
                                lineHeight: 1.5,
                                padding: "10px 12px",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(standard)}
                              disabled={isSaving}
                              style={{
                                width: "100%",
                                textAlign: "left",
                              }}
                            >
                              <p
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: 14,
                                  fontWeight: 400,
                                  color: "#e0e0e0",
                                  lineHeight: 1.55,
                                  margin: 0,
                                }}
                              >
                                {standard.text}
                              </p>
                            </button>
                          )}
                        </div>

                        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    paddingTop: 2,
  }}
>
  <button
    onClick={() => moveStandard(standard.id, -1)}
    disabled={isFirst || isSaving}
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1px solid #242424",
      color: isFirst ? "#343434" : "#8d8d8d",
      fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace",
    }}
  >
    ↑
  </button>

  <button
    onClick={() => moveStandard(standard.id, 1)}
    disabled={isLast || isSaving}
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1px solid #242424",
      color: isLast ? "#343434" : "#8d8d8d",
      fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace",
    }}
  >
    ↓
  </button>

  <button
    onClick={() => handleDelete(standard.id)}
    disabled={isSaving}
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1px solid #242424",
      color: "#7a7a7a",
      fontSize: 10,
      fontFamily: "'IBM Plex Mono', monospace",
    }}
  >
    ×
  </button>
</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        <BottomNav current="standards" onNavigate={onNavigate} />
      </div>
    </div>
  );
}