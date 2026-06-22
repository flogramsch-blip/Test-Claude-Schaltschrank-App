import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Input";
import { SegmentedControl } from "../components/ui/SegmentedControl";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-grouped px-6 dark:bg-surface-grouped-dark">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-3xl font-bold text-label dark:text-label-dark">
          🏠 Sanierungs-Tracker
        </h1>
        <p className="mb-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
          Kosten gemeinsam im Blick
        </p>

        <div className="mb-5">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "signin", label: "Anmelden" },
              { value: "signup", label: "Registrieren" },
            ]}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <Field
              label="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dein Name"
              required
            />
          )}
          <Field
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@beispiel.de"
            required
          />
          <Field
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
          />
          {error && <p className="text-sm text-ios-red">{error}</p>}
          <Button type="submit" fullWidth disabled={busy}>
            {mode === "signin" ? "Anmelden" : "Konto erstellen"}
          </Button>
        </form>
      </div>
    </div>
  );
}
