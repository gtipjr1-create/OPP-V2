import { useState } from "react";
import ActiveSession from "./ActiveSession";
import ArchivedSessions from "./ArchivedSessions";

export default function App() {
  const [screen, setScreen] = useState("active");

  if (screen === "archived") return <ArchivedSessions onNavigate={setScreen} />;
  return <ActiveSession onNavigate={setScreen} />;
}
