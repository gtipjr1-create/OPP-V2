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
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <OPPApp />;
}