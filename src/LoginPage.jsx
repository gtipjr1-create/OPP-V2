import { useState } from "react";
import { supabase } from "./lib/supabase";
import { ensureProfile } from "./ensureProfile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created. You can now sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { error: profileError } = await ensureProfile();
        if (profileError) throw profileError;
      }
    } catch (error) {
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    color: "#d0d0d0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    padding: "13px 16px",
    outline: "none",
  };

  return (
    <div
      style={{
        height: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 34,
            color: "#f0f0f0",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          OPP
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#383838",
            letterSpacing: "0.1em",
            marginBottom: 44,
          }}
        >
          PERSONAL OPERATING SYSTEM
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "#0d0d0d",
            borderRadius: 12,
            padding: 4,
            border: "1px solid #1e1e1e",
          }}
        >
          {["signup", "signin"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 9,
                background: mode === m ? "#1e1e1e" : "transparent",
                border: "none",
                color: mode === m ? "#e0e0e0" : "#3a3a3a",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {m === "signup" ? "SIGN UP" : "SIGN IN"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "14px",
              borderRadius: 12,
              background: loading ? "#161616" : "#4A9EFF",
              border: `1px solid ${loading ? "#222" : "transparent"}`,
              color: loading ? "#444" : "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Working..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {message ? (
          <div
            style={{
              marginTop: 16,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
