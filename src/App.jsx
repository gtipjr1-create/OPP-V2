import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import LoginPage from "./LoginPage";
import OPPApp from "./OPPApp";
import ResetPasswordPage from "./ResetPasswordPage";

function getRecoveryState() {
  const hash = window.location.hash || "";
  const search = window.location.search || "";

  const hashParams = new URLSearchParams(
    hash.startsWith("#") ? hash.slice(1) : hash
  );
  const searchParams = new URLSearchParams(search);

  const typeFromHash = hashParams.get("type");
  const typeFromSearch = searchParams.get("type");

  const accessToken =
    hashParams.get("access_token") || searchParams.get("access_token");
  const refreshToken =
    hashParams.get("refresh_token") || searchParams.get("refresh_token");

  const isRecovery =
    typeFromHash === "recovery" ||
    typeFromSearch === "recovery" ||
    Boolean(accessToken && refreshToken);

  return {
    isRecovery,
    accessToken,
    refreshToken,
  };
}

export default function App() {
  const [session, setSession] = useState(undefined);

  const recoveryState = useMemo(() => getRecoveryState(), []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (recoveryState.accessToken && recoveryState.refreshToken) {
        await supabase.auth.setSession({
          access_token: recoveryState.accessToken,
          refresh_token: recoveryState.refreshToken,
        });

        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSession(data.session ?? null);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [recoveryState.accessToken, recoveryState.refreshToken]);

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

  if (recoveryState.isRecovery) {
    return <ResetPasswordPage />;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <OPPApp />;
}