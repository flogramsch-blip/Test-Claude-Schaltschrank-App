import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Input";
import { SegmentedControl } from "../components/ui/SegmentedControl";

export function HouseholdSetup() {
  const { createHousehold, joinHousehold, signOut } = useAuth();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("Unsere Sanierung");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "create") {
        await createHousehold(name);
      } else {
        await joinHousehold(code);
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
        <h1 className="mb-1 text-center text-2xl font-bold text-label dark:text-label-dark">
          Haushalt einrichten
        </h1>
        <p className="mb-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
          Erstelle euren gemeinsamen Bereich oder tritt dem deines Partners bei.
        </p>

        <div className="mb-5">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "create", label: "Neu erstellen" },
              { value: "join", label: "Beitreten" },
            ]}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "create" ? (
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          ) : (
            <Field
              label="Einladungscode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="z. B. AB12CD"
              required
            />
          )}
          {error && <p className="text-sm text-ios-red">{error}</p>}
          <Button type="submit" fullWidth disabled={busy}>
            {mode === "create" ? "Haushalt erstellen" : "Beitreten"}
          </Button>
          <Button type="button" variant="plain" onClick={() => signOut()}>
            Abmelden
          </Button>
        </form>
      </div>
    </div>
  );
}
