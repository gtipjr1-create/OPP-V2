import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import ActiveSession from "./ActiveSession";
import ArchivedSessions from "./ArchivedSessions";
import Domains from "./Domains";
import Priorities from "./Priorities";
import Standards from "./Standards";
import Home from "./Home";

const DOMAINS_DEFAULT = [
  { name: "Health", slug: "health" },
  { name: "Work", slug: "work" },
  { name: "Build", slug: "build" },
  { name: "Mind", slug: "mind" },
  { name: "Write", slug: "write" },
  { name: "Life", slug: "life" },
];

function todaySessionName() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[now.getDay()];
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const yy = String(now.getFullYear()).slice(-2);
  return `${day} / ${m}·${d}·${yy}`;
}

function deriveDomainStatusFromName(name) {
  if (name === "Health" || name === "Work" || name === "Build") {
    return "Active";
  }
  return "Steady";
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

export default function OPPApp() {
  const [screen, setScreen] = useState("home");
  const [domains, setDomains] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [weekAnchors, setWeekAnchors] = useState([]);
  const [sessionName, setSessionName] = useState(todaySessionName());
  const [appError, setAppError] = useState("");
  const [userId, setUserId] = useState(null);

  async function loadDomains(userIdValue) {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Domains load failed: ${error.message}`);
    }

    const formattedDomains = (data || []).map((domain) => ({
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
    const seedRows = DOMAINS_DEFAULT.map((domain) => ({
      user_id: userIdValue,
      name: domain.name,
      slug: domain.slug,
    }));

    const { error } = await supabase
      .from("domains")
      .upsert(seedRows, { onConflict: "user_id,slug" });

    if (error) {
      throw new Error(`Domains seed failed: ${error.message}`);
    }
  }

  async function loadPriorities(userIdValue, domainsList) {
    const { data, error } = await supabase
      .from("priorities")
      .select("*")
      .eq("user_id", userIdValue)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Priorities load failed: ${error.message}`);
    }

    const formattedPriorities = (data || []).map((row) => formatPriorityRow(row, domainsList));
    setPriorities(formattedPriorities);
    return formattedPriorities;
  }

  async function loadWeeklyAnchors(userIdValue) {
    const { data, error } = await supabase
      .from("weekly_anchors")
      .select("*")
      .eq("user_id", userIdValue)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Weekly anchors load failed: ${error.message}`);
    }

    const formattedAnchors = (data || []).map(formatWeeklyAnchorRow);
    setWeekAnchors(formattedAnchors);
    return formattedAnchors;
  }

  async function addWeeklyAnchor(text) {
    if (!userId) {
      throw new Error("No user found for weekly anchor create.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;
    if (weekAnchors.length >= 3) return;

    const nextSortOrder = weekAnchors.length;

    const { data, error } = await supabase
      .from("weekly_anchors")
      .insert({
        user_id: userId,
        text: cleanText,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Weekly anchor create failed: ${error.message}`);
    }

    const newAnchor = formatWeeklyAnchorRow(data);
    setWeekAnchors((prev) => [...prev, newAnchor]);
  }

  async function updateWeeklyAnchor(id, text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const { data, error } = await supabase
      .from("weekly_anchors")
      .update({ text: cleanText })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Weekly anchor update failed: ${error.message}`);
    }

    const updatedAnchor = formatWeeklyAnchorRow(data);

    setWeekAnchors((prev) =>
      prev.map((anchor) => (anchor.id === id ? updatedAnchor : anchor))
    );
  }

  async function removeWeeklyAnchor(id) {
    const remainingAnchors = weekAnchors.filter((anchor) => anchor.id !== id);

    const { error: deleteError } = await supabase
      .from("weekly_anchors")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Weekly anchor delete failed: ${deleteError.message}`);
    }

    for (let index = 0; index < remainingAnchors.length; index += 1) {
      const anchor = remainingAnchors[index];

      if (anchor.sortOrder !== index) {
        const { error: reorderError } = await supabase
          .from("weekly_anchors")
          .update({ sort_order: index })
          .eq("id", anchor.id);

        if (reorderError) {
          throw new Error(`Weekly anchor reorder failed: ${reorderError.message}`);
        }
      }
    }

    setWeekAnchors(
      remainingAnchors.map((anchor, index) => ({
        ...anchor,
        sortOrder: index,
      }))
    );
  }

  useEffect(() => {
    async function initApp() {
      try {
        setAppError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(`Auth user lookup failed: ${userError.message}`);
        }

        if (!user) {
          throw new Error("No signed-in user found.");
        }

        setUserId(user.id);

        await seedDefaultDomains(user.id);
        const loadedDomains = await loadDomains(user.id);
        await loadPriorities(user.id, loadedDomains);
        await loadWeeklyAnchors(user.id);
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
      />
    );
  } else if (screen === "standards") {
    content = <Standards onNavigate={setScreen} />;
  } else if (screen === "active") {
    content = (
      <ActiveSession
        onNavigate={setScreen}
        sessionName={sessionName}
        setSessionName={setSessionName}
      />
    );
  } else {
    content = (
      <Home
        onNavigate={setScreen}
        sessionName={sessionName}
        domains={domains}
        priorities={priorities}
        weekAnchors={weekAnchors}
        onAddWeeklyAnchor={addWeeklyAnchor}
        onUpdateWeeklyAnchor={updateWeeklyAnchor}
        onRemoveWeeklyAnchor={removeWeeklyAnchor}
      />
    );
  }

  return (
    <div>
      {content}

      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}