import { useState } from "react";
import ActiveSession from "./ActiveSession";
import ArchivedSessions from "./ArchivedSessions";
import Domains from "./Domains";
import Priorities from "./Priorities";
import Standards from "./Standards";
import Home from "./Home";

const DOMAINS_DEFAULT = [
  { id: "health", name: "Health", status: "Active", focus: "" },
  { id: "work",   name: "Work",   status: "Active", focus: "" },
  { id: "build",  name: "Build",  status: "Active", focus: "" },
  { id: "mind",   name: "Mind",   status: "Steady", focus: "" },
  { id: "write",  name: "Write",  status: "Steady", focus: "" },
  { id: "life",   name: "Life",   status: "Steady", focus: "" },
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

export default function App() {
  const [screen, setScreen] = useState("home");
  const [domains, setDomains] = useState(DOMAINS_DEFAULT);
  const [priorities, setPriorities] = useState([]);
  const [weekAnchors, setWeekAnchors] = useState([]);
  const [sessionName, setSessionName] = useState(todaySessionName());

  if (screen === "archived") return <ArchivedSessions onNavigate={setScreen} />;
  if (screen === "domains") return <Domains onNavigate={setScreen} domains={domains} setDomains={setDomains} />;
  if (screen === "priorities") return <Priorities onNavigate={setScreen} priorities={priorities} setPriorities={setPriorities} />;
  if (screen === "standards") return <Standards onNavigate={setScreen} />;
  if (screen === "active") return <ActiveSession onNavigate={setScreen} sessionName={sessionName} setSessionName={setSessionName} />;
  return <Home onNavigate={setScreen} sessionName={sessionName} domains={domains} priorities={priorities} weekAnchors={weekAnchors} setWeekAnchors={setWeekAnchors} />;
}
