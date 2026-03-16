import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import LoginPage from "./LoginPage";
import OPPApp from "./OPPApp";

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div
        style={{
          height: "100dvh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "#2a2a2a",
        }}
      >
        OPP
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <OPPApp />;
}