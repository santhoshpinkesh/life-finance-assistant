import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName || undefined);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold"
            style={{ background: "var(--mint)", color: "#06251A" }}
          >
            L
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Life Finance Assistant</span>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h1 className="font-display font-semibold text-xl mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            {mode === "login" ? "Sign in to see what's due." : "Track every card, EMI, and deadline in one ledger."}
          </p>

          <form onSubmit={onSubmit}>
            {mode === "register" && (
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Santhosh Reddy"
              />
            )}
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-sm mb-3" style={{ color: "var(--rose)" }}>
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            className="text-xs mt-4 w-full text-center"
            style={{ color: "var(--text-dim)" }}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
