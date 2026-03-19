import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { ensureProfile } from "./ensureProfile";
import Today from "./Today";
import ArchivedSessions from "./ArchivedSessions";
import Domains from "./Domains";
import Priorities from "./Priorities";
import Standards from "./Standards";
import Settings from "./Settings";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
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
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
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

  async function loadStandards(userIdValue) {
    const { data, error } = await supabase
      .from("standards")
      .select("*")
      .eq("user_id", userIdValue)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Standards load failed: ${error.message}`);
    }

    const formattedStandards = (data || []).map(formatStandardRow);
    setStandards(formattedStandards);
    return formattedStandards;
  }

  async function loadTodayTasks(userIdValue) {
    const { data, error } = await supabase
      .from("today_tasks")
      .select("*")
      .eq("user_id", userIdValue)
      .eq("date", todayISODate())
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Today tasks load failed: ${error.message}`);
    }

    const formatted = (data || []).map(formatTodayTaskRow);
    setTodayTasks(formatted);
    return formatted;
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
    if (!userId) {
      throw new Error("No user found for weekly anchor update.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    const { data, error } = await supabase
      .from("weekly_anchors")
      .update({ text: cleanText })
      .eq("id", id)
      .eq("user_id", userId)
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
    if (!userId) {
      throw new Error("No user found for weekly anchor delete.");
    }

    const remainingAnchors = weekAnchors.filter((anchor) => anchor.id !== id);

    const { error: deleteError } = await supabase
      .from("weekly_anchors")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Weekly anchor delete failed: ${deleteError.message}`);
    }

    for (let index = 0; index < remainingAnchors.length; index += 1) {
      const anchor = remainingAnchors[index];

      if (anchor.sortOrder !== index) {
        const { error: reorderError } = await supabase
          .from("weekly_anchors")
          .update({ sort_order: index })
          .eq("id", anchor.id)
          .eq("user_id", userId);

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

  async function addStandard(text) {
    if (!userId) {
      throw new Error("No user found for standard create.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;
    if (standards.length >= MAX_STANDARDS) return;

    const nextSortOrder = standards.length;

    const { data, error } = await supabase
      .from("standards")
      .insert({
        user_id: userId,
        text: cleanText,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Standard create failed: ${error.message}`);
    }

    const newStandard = formatStandardRow(data);
    setStandards((prev) => [...prev, newStandard]);
  }

  async function updateStandard(id, text) {
    if (!userId) {
      throw new Error("No user found for standard update.");
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    const { data, error } = await supabase
      .from("standards")
      .update({
        text: cleanText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Standard update failed: ${error.message}`);
    }

    const updatedStandard = formatStandardRow(data);

    setStandards((prev) =>
      prev.map((standard) => (standard.id === id ? updatedStandard : standard))
    );
  }

  async function normalizeStandardSortOrders(standardRows) {
    if (!userId) {
      throw new Error("No user found for standard reorder.");
    }

    for (let index = 0; index < standardRows.length; index += 1) {
      const standard = standardRows[index];
      const temporarySortOrder = 1000 + index;

      const { error: bumpError } = await supabase
        .from("standards")
        .update({
          sort_order: temporarySortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", standard.id)
        .eq("user_id", userId);

      if (bumpError) {
        throw new Error(`Standard temporary reorder failed: ${bumpError.message}`);
      }
    }

    for (let index = 0; index < standardRows.length; index += 1) {
      const standard = standardRows[index];

      const { error: finalError } = await supabase
        .from("standards")
        .update({
          sort_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", standard.id)
        .eq("user_id", userId);

      if (finalError) {
        throw new Error(`Standard final reorder failed: ${finalError.message}`);
      }
    }

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

    const { error: deleteError } = await supabase
      .from("standards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Standard delete failed: ${deleteError.message}`);
    }

    await normalizeStandardSortOrders(remainingStandards);
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

    await normalizeStandardSortOrders(reorderedStandards);
  }

  useEffect(() => {
    async function initApp() {
      try {
        setAppError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          await supabase.auth.signOut();
          return;
        }

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
      />
    );
  } else if (screen === "settings") {
    content = (
      <Settings
        onNavigate={setScreen}
        onSignOut={async () => { await supabase.auth.signOut(); }}
      />
    );
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
      />
    );
  } else {
    content = (
      <Today
        onNavigate={setScreen}
        tasks={todayTasks}
        setTasks={setTodayTasks}
        userId={userId}
        onSignOut={async () => { await supabase.auth.signOut(); }}
      />
    );
  }

  return <div>{content}</div>;
}