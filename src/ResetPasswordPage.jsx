import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("saving");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Unable to update password.");
      return;
    }

    setStatus("success");
    setMessage("Password updated. You can now log in with your new password.");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#000",
        color: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid #1f1f1f",
          borderRadius: 24,
          padding: 24,
          background: "#050505",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#6f6f6f",
            marginBottom: 16,
          }}
        >
          Password Recovery
        </div>

        <h1
          style={{
            margin: "0 0 10px 0",
            fontSize: 32,
            lineHeight: 1.05,
            fontWeight: 600,
          }}
        >
          Set a new password
        </h1>

        <p
          style={{
            margin: "0 0 24px 0",
            color: "#9a9a9a",
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          Enter your new password below to regain access to OPP.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid #222",
              background: "#0a0a0a",
              color: "#fff",
              padding: "0 16px",
              fontSize: 16,
              outline: "none",
            }}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid #222",
              background: "#0a0a0a",
              color: "#fff",
              padding: "0 16px",
              fontSize: 16,
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={status === "saving"}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid #2b2b2b",
              background: "#111",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: status === "saving" ? "default" : "pointer",
            }}
          >
            {status === "saving" ? "Updating..." : "Update password"}
          </button>
        </form>

        {message ? (
          <p
            style={{
              marginTop: 16,
              color: status === "success" ? "#9fd3a8" : "#b8b8b8",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}