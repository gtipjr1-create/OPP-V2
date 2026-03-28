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
import Today from "./Today";
import ArchivedSessions from "./ArchivedSessions";
import Domains from "./Domains";
import Priorities from "./Priorities";
import Standards from "./Standards";
import Settings from "./Settings";

function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    const data = await fetchTodayTasks(userIdValue, todayISODate());
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
    if (!Array.isArray(nextStandardIds) || nextStandardIds.length !== standards.length) {
      return;
    }

    const standardById = new Map(standards.map((standard) => [standard.id, standard]));
    const reorderedStandards = nextStandardIds
      .map((id) => standardById.get(id))
      .filter(Boolean);

    if (reorderedStandards.length !== standards.length) {
      throw new Error("Standard reorder list was incomplete.");
    }

    await syncStandardSortOrders(reorderedStandards);
  }

  useEffect(() => {
    async function initApp() {
      try {
        setAppError("");

        const user = await getCurrentUser();
        setUserId(user.id);

        const { error: profileError } = await ensureProfile();
        if (profileError) {
          throw new Error(`Profile setup failed: ${profileError.message}`);
        }

        await seedDefaultDomains(user.id);
        const loadedDomains = await loadDomains(user.id);
        await loadPriorities(user.id, loadedDomains);
        await loadWeeklyAnchors(user.id);
        await loadStandards(user.id);
        await loadTodayTasks(user.id);
      } catch (error) {
        console.error("App init error:", error);
        setAppError(error.message || "Failed to initialize app.");
      }
    }

    initApp();
  }, []);

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

  return <div>{content}</div>;
}
