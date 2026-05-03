import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "./data/auth";
import { loadDomains as fetchDomains, seedDefaultDomains as upsertDefaultDomains } from "./data/domains";
import { loadPriorities as fetchPriorities } from "./data/priorities";
import {
  createStandard,
  deleteStandard,
  loadStandards as fetchStandards,
  normalizeStandardSortOrders,
  markStandardReviewed,
  updateStandardText,
} from "./data/standards";
import { loadTodayTasks as fetchTodayTasks } from "./data/todayTasks";
import {
  createWeeklyAnchor,
  deleteWeeklyAnchor,
  loadWeeklyAnchors as fetchWeeklyAnchors,
  updateWeeklyAnchorSortOrders,
  updateWeeklyAnchorText,
} from "./data/weeklyAnchors";
import { ensureProfile } from "./ensureProfile";
import { getLocalISODate } from "./lib/date";
import { reorderByIds } from "./lib/reorder";
import { runInitStep } from "./lib/initRunner";
import Today from "./Today";
import ArchivedSessions from "./ArchivedSessions";
import Domains from "./Domains";
import Priorities from "./Priorities";
import Standards from "./Standards";
import Settings from "./Settings";

const DOMAINS_DEFAULT = [
  { name: "Health", slug: "health" },
  { name: "Work", slug: "work" },
  { name: "Build", slug: "build" },
  { name: "Mind", slug: "mind" },
  { name: "Write", slug: "write" },
  { name: "Life", slug: "life" },
];

const MAX_STANDARDS = 8;

function deriveDomainStatusFromName(name) {
  if (name === "Health" || name === "Work" || name === "Build") {
    return "Active";
  }
  return "Steady";
}

function formatTodayTaskRow(row) {
  return {
    id: row.id,
    label: row.label || "",
    done: Boolean(row.done),
    sortOrder: row.sort_order ?? 0,
    date: row.date || null,
  };
}

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

function formatWeeklyAnchorRow(row) {
  return {
    id: row.id,
    text: row.text || "",
    sortOrder: row.sort_order ?? 0,
  };
}

function formatStandardRow(row) {
  return {
    id: row.id,
    text: row.text || "",
    category: row.category || "Execution",
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    lastReviewedAt: row.last_reviewed_at || null,
  };
}

export default function OPPApp() {
  const [screen, setScreen] = useState("home");
  const [domains, setDomains] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [weekAnchors, setWeekAnchors] = useState([]);
  const [standards, setStandards] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [appError, setAppError] = useState("");
  const [initWarnings, setInitWarnings] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initRunId, setInitRunId] = useState(0);
  const [userId, setUserId] = useState(null);

  async function loadDomains(userIdValue) {
    const data = await fetchDomains(userIdValue);
    const formattedDomains = data.map((domain) => ({
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      status: domain.status ? domain.status : deriveDomainStatusFromName(domain.name),
      focus: domain.focus || "",
    }));

    setDomains(formattedDomains);
    return formattedDomains;
  }

  async function seedDefaultDomains(userIdValue) {
    await upsertDefaultDomains(userIdValue, DOMAINS_DEFAULT);
  }

  async function loadPriorities(userIdValue, domainsList) {
    const data = await fetchPriorities(userIdValue);
    const formattedPriorities = data.map((row) => formatPriorityRow(row, domainsList));
    setPriorities(formattedPriorities);
    return formattedPriorities;
  }

  async function loadWeeklyAnchors(userIdValue) {
    const data = await fetchWeeklyAnchors(userIdValue);
    const formattedAnchors = data.map(formatWeeklyAnchorRow);
    setWeekAnchors(formattedAnchors);
    return formattedAnchors;
  }

  async function loadStandards(userIdValue) {
    const data = await fetchStandards(userIdValue);
    const formattedStandards = data.map(formatStandardRow);
    setStandards(formattedStandards);
    return formattedStandards;
  }

  async function loadTodayTasks(userIdValue) {
    const data = await fetchTodayTasks(userIdValue, getLocalISODate());
    const formatted = data.map(formatTodayTaskRow);
    setTodayTasks(formatted);
    return formatted;
  }

  async function _addWeeklyAnchor(text) {
    if (!userId) {
      throw new Error("No user found for weekly anchor create.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;
    if (weekAnchors.length >= 3) return;

    const data = await createWeeklyAnchor({
      userId,
      text: cleanText,
      sortOrder: weekAnchors.length,
    });

    const newAnchor = formatWeeklyAnchorRow(data);
    setWeekAnchors((prev) => [...prev, newAnchor]);
  }

  async function _updateWeeklyAnchor(id, text) {
    if (!userId) {
      throw new Error("No user found for weekly anchor update.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    const data = await updateWeeklyAnchorText({
      id,
      userId,
      text: cleanText,
    });

    const updatedAnchor = formatWeeklyAnchorRow(data);

    setWeekAnchors((prev) =>
      prev.map((anchor) => (anchor.id === id ? updatedAnchor : anchor))
    );
  }

  async function _removeWeeklyAnchor(id) {
    if (!userId) {
      throw new Error("No user found for weekly anchor delete.");
    }

    const remainingAnchors = weekAnchors.filter((anchor) => anchor.id !== id);

    await deleteWeeklyAnchor(id, userId);
    await updateWeeklyAnchorSortOrders(remainingAnchors, userId);

    setWeekAnchors(
      remainingAnchors.map((anchor, index) => ({
        ...anchor,
        sortOrder: index,
      }))
    );
  }

  async function addStandard(input) {
    if (!userId) {
      throw new Error("No user found for standard create.");
    }

    const payload = typeof input === "string" ? { text: input, category: "Execution" } : input || {};
    const cleanText = String(payload.text || "").trim();
    const category = payload.category || "Execution";
    if (!cleanText) return;
    if (standards.length >= MAX_STANDARDS) return;

    const nextSortOrder = standards.length;

    const data = await createStandard({
      userId,
      text: cleanText,
      category,
      sortOrder: nextSortOrder,
      lastReviewedAt: new Date().toISOString(),
    });
    const newStandard = formatStandardRow(data);
    setStandards((prev) => [...prev, newStandard]);
  }

  async function updateStandard(id, input) {
    if (!userId) {
      throw new Error("No user found for standard update.");
    }

    const payload = typeof input === "string" ? { text: input } : input || {};
    const cleanText = String(payload.text || "").trim();
    if (!cleanText) return;

    const data = await updateStandardText({
      id,
      userId,
      text: cleanText,
      category: payload.category,
    });
    const updatedStandard = formatStandardRow(data);

    setStandards((prev) =>
      prev.map((standard) => (standard.id === id ? updatedStandard : standard))
    );
  }

  async function markStandardAsReviewed(id) {
    if (!userId) {
      throw new Error("No user found for standard review.");
    }

    const data = await markStandardReviewed({
      id,
      userId,
      reviewedAt: new Date().toISOString(),
    });
    const reviewedStandard = formatStandardRow(data);

    setStandards((prev) =>
      prev.map((standard) => (standard.id === id ? reviewedStandard : standard))
    );
  }

  async function syncStandardSortOrders(standardRows) {
    if (!userId) {
      throw new Error("No user found for standard reorder.");
    }

    await normalizeStandardSortOrders(standardRows, userId);

    setStandards(
      standardRows.map((standard, index) => ({
        ...standard,
        sortOrder: index,
      }))
    );
  }

  async function removeStandard(id) {
    if (!userId) {
      throw new Error("No user found for standard delete.");
    }

    const remainingStandards = standards.filter((standard) => standard.id !== id);

    await deleteStandard(id, userId);
    await syncStandardSortOrders(remainingStandards);
  }

  async function reorderStandards(nextStandardIds) {
    const reorderedStandards = reorderByIds(standards, nextStandardIds);

    const previousStandards = standards;
    try {
      await syncStandardSortOrders(reorderedStandards);
    } catch (error) {
      setStandards(previousStandards);
      throw error;
    }
  }

  useEffect(() => {
    async function initApp() {
      try {
        setIsInitializing(true);
        setAppError("");
        setInitWarnings([]);

        const warnings = [];
        const user = await runInitStep("User check failed", () => getCurrentUser(), warnings, {
          critical: true,
        });
        setUserId(user.id);

        const ensureProfileResult = await runInitStep(
          "Profile setup failed",
          () => ensureProfile(),
          warnings,
          { critical: true }
        );
        const { error: profileError } = ensureProfileResult || {};
        if (profileError) {
          throw new Error(`Profile setup failed: ${profileError.message}`);
        }

        await runInitStep("Domain seed failed", () => seedDefaultDomains(user.id), warnings);

        const loadedDomains =
          (await runInitStep("Domains load failed", () => loadDomains(user.id), warnings)) || [];

        await Promise.all([
          runInitStep(
            "Priorities load failed",
            () => loadPriorities(user.id, loadedDomains),
            warnings
          ),
          runInitStep("Weekly anchors load failed", () => loadWeeklyAnchors(user.id), warnings),
          runInitStep("Standards load failed", () => loadStandards(user.id), warnings),
          runInitStep("Today tasks load failed", () => loadTodayTasks(user.id), warnings),
        ]);

        setInitWarnings(warnings);
      } catch (error) {
        console.error("App init error:", error);
        setAppError(error.message || "Failed to initialize app.");
      } finally {
        setIsInitializing(false);
      }
    }

    initApp();
  }, [initRunId]);

  function retryInit() {
    setInitRunId((value) => value + 1);
  }

  let content;

  if (appError) {
    content = (
      <div
        style={{
          minHeight: "100dvh",
          background: "#000",
          color: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          padding: 24,
          textAlign: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 18, color: "#f0f0f0" }}>App failed to load</div>
        <div style={{ fontSize: 14, color: "#888", maxWidth: 420 }}>{appError}</div>
        <button
          type="button"
          onClick={retryInit}
          disabled={isInitializing}
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #2f2f2f",
            color: "#bdbdbd",
            background: "transparent",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
            cursor: isInitializing ? "default" : "pointer",
            opacity: isInitializing ? 0.65 : 1,
          }}
        >
          {isInitializing ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  } else if (screen === "archived") {
    content = <ArchivedSessions onNavigate={setScreen} />;
  } else if (screen === "domains") {
    content = <Domains onNavigate={setScreen} domains={domains} setDomains={setDomains} />;
  } else if (screen === "priorities") {
    content = (
      <Priorities
        onNavigate={setScreen}
        priorities={priorities}
        setPriorities={setPriorities}
        domains={domains}
        userId={userId}
      />
    );
  } else if (screen === "settings") {
    content = <Settings onNavigate={setScreen} onSignOut={signOut} />;
  } else if (screen === "standards") {
    content = (
      <Standards
        onNavigate={setScreen}
        standards={standards}
        maxStandards={MAX_STANDARDS}
        onAddStandard={addStandard}
        onUpdateStandard={updateStandard}
        onRemoveStandard={removeStandard}
        onReorderStandards={reorderStandards}
        onMarkStandardReviewed={markStandardAsReviewed}
      />
    );
  } else {
    content = (
      <Today
        onNavigate={setScreen}
        tasks={todayTasks}
        setTasks={setTodayTasks}
        priorities={priorities}
        weekAnchors={weekAnchors}
        domains={domains}
        userId={userId}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div>
      {initWarnings.length > 0 ? (
        <div
          style={{
            margin: "0 auto",
            maxWidth: 560,
            padding: "10px 14px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#8d8d8d",
            background: "#080808",
            border: "1px solid #1b1b1b",
            borderRadius: 10,
          }}
        >
          Some sections could not load:
          <div style={{ marginTop: 6, lineHeight: 1.4 }}>
            {initWarnings.slice(0, 2).join(" | ")}
            {initWarnings.length > 2 ? " | ...more" : ""}
          </div>
          <button
            type="button"
            onClick={retryInit}
            disabled={isInitializing}
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #2a2a2a",
              color: "#9f9f9f",
              background: "transparent",
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.04em",
              cursor: isInitializing ? "default" : "pointer",
              opacity: isInitializing ? 0.65 : 1,
            }}
          >
            {isInitializing ? "Retrying..." : "Retry load"}
          </button>
        </div>
      ) : null}
      {content}
    </div>
  );
}
