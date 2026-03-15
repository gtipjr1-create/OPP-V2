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

function deriveStatusFromName(name) {
  if (name === "Health" || name === "Work" || name === "Build") {
    return "Active";
  }
  return "Steady";
}

export default function OPPApp() {
  const [screen, setScreen] = useState("home");
  const [domains, setDomains] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [weekAnchors, setWeekAnchors] = useState([]);
  const [sessionName, setSessionName] = useState(todaySessionName());
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [domainsError, setDomainsError] = useState("");

  async function loadDomains(userId) {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Load failed: ${error.message}`);
    }

    const formattedDomains = (data || []).map((domain) => ({
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      status: domain.status ? domain.status : deriveStatusFromName(domain.name),
      focus: domain.focus || "",
    }));

    setDomains(formattedDomains);
  }

  async function seedDefaultDomains(userId) {
    const seedRows = DOMAINS_DEFAULT.map((domain) => ({
      user_id: userId,
      name: domain.name,
      slug: domain.slug,
    }));

    const { error } = await supabase
      .from("domains")
      .upsert(seedRows, { onConflict: "user_id,slug" });

    if (error) {
      throw new Error(`Seed failed: ${error.message}`);
    }
  }

  useEffect(() => {
    async function initDomains() {
      try {
        setDomainsLoading(true);
        setDomainsError("");

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

        await seedDefaultDomains(user.id);
        await loadDomains(user.id);
      } catch (error) {
        console.error("Domains init error:", error);
        setDomainsError(error.message || "Failed to initialize domains.");
      } finally {
        setDomainsLoading(false);
      }
    }

    initDomains();
  }, []);

  let content;

  if (screen === "archived") {
    content = <ArchivedSessions onNavigate={setScreen} />;
  } else if (screen === "domains") {
    if (domainsLoading) {
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
          }}
        >
          Loading domains...
        </div>
      );
    } else if (domainsError) {
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
          <div style={{ fontSize: 18, color: "#f0f0f0" }}>Domains failed to load</div>
          <div style={{ fontSize: 14, color: "#888", maxWidth: 420 }}>{domainsError}</div>
        </div>
      );
    } else {
      content = <Domains onNavigate={setScreen} domains={domains} setDomains={setDomains} />;
    }
  } else if (screen === "priorities") {
    content = <Priorities onNavigate={setScreen} priorities={priorities} setPriorities={setPriorities} />;
  } else if (screen === "standards") {
    content = <Standards onNavigate={setScreen} />;
  } else if (screen === "active") {
    content = <ActiveSession onNavigate={setScreen} sessionName={sessionName} setSessionName={setSessionName} />;
  } else {
    content = (
      <Home
        onNavigate={setScreen}
        sessionName={sessionName}
        domains={domains}
        priorities={priorities}
        weekAnchors={weekAnchors}
        setWeekAnchors={setWeekAnchors}
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