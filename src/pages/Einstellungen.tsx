import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { Screen } from "../components/ui/Screen";
import { CardGroup } from "../components/ui/Card";
import { ListCell } from "../components/ui/ListCell";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Field } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { registerForPushNotifications } from "../lib/notifications";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const SWATCHES = ["#34c759", "#007aff", "#ff9500", "#ff3b30", "#af52de", "#5ac8fa", "#ff2d55", "#8e8e93"];

export function Einstellungen() {
  const { user, signOut, firebaseUser } = useAuth();
  const { mode, setMode } = useTheme();
  const householdId = user?.householdId ?? null;
  const { types, addType, updateType, deleteType } = useMeasureTypes(householdId);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", color: SWATCHES[0], taxFree: false });
  const [notifStatus, setNotifStatus] = useState<"idle" | "requesting" | "on">("idle");

  useEffect(() => {
    if (!householdId) return;
    getDoc(doc(db, "households", householdId)).then((snap) => {
      setInviteCode((snap.data()?.inviteCode as string) ?? null);
    });
  }, [householdId]);

  function openNewType() {
    setEditingId(null);
    setForm({ name: "", color: SWATCHES[0], taxFree: false });
    setShowSheet(true);
  }

  function openEditType(id: string) {
    const t = types.find((x) => x.id === id);
    if (!t) return;
    setEditingId(id);
    setForm({ name: t.name, color: t.color, taxFree: t.taxFree });
    setShowSheet(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateType(editingId, form);
    } else {
      await addType({ ...form, order: types.length });
    }
    setShowSheet(false);
  }

  async function handleDelete() {
    if (!editingId) return;
    await deleteType(editingId);
    setShowSheet(false);
  }

  async function handleEnableNotifications() {
    if (!firebaseUser) return;
    setNotifStatus("requesting");
    await registerForPushNotifications(firebaseUser.uid);
    setNotifStatus("on");
  }

  return (
    <Screen title="Einstellungen">
      <CardGroup title="Maßnahmenarten">
        {types.map((t) => (
          <ListCell
            key={t.id}
            leading={<span className="h-3 w-3 shrink-0 rounded-full" style={{ background: t.color }} />}
            label={t.name}
            detail={t.taxFree ? "Steuerfrei" : undefined}
            chevron
            onClick={() => openEditType(t.id)}
          />
        ))}
        <ListCell
          leading={<Plus size={18} className="text-ios-blue" />}
          label={<span className="text-ios-blue">Neue Art hinzufügen</span>}
          onClick={openNewType}
        />
      </CardGroup>

      <CardGroup title="Darstellung">
        <div className="px-4 py-3">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "light", label: "Hell" },
              { value: "dark", label: "Dunkel" },
              { value: "system", label: "System" },
            ]}
          />
        </div>
      </CardGroup>

      <CardGroup title="Benachrichtigungen">
        <ListCell
          label="Push-Benachrichtigungen"
          value={notifStatus === "on" ? "Aktiv" : "Aktivieren"}
          onClick={handleEnableNotifications}
        />
      </CardGroup>

      <CardGroup title="Haushalt">
        <ListCell label="Einladungscode" value={inviteCode ?? "–"} />
      </CardGroup>

      <CardGroup>
        <ListCell label="Abmelden" destructive onClick={() => signOut()} />
      </CardGroup>

      <BottomSheet
        open={showSheet}
        title={editingId ? "Art bearbeiten" : "Neue Art"}
        onClose={() => setShowSheet(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="z. B. Eigenleistung"
            required
          />
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
              Farbe
            </span>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="h-8 w-8 rounded-full ring-offset-2"
                  style={{ background: c, boxShadow: form.color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5 dark:bg-surface-elevated-dark">
            <span className="text-[15px] text-label dark:text-label-dark">Ohne Steuer / Rechnung</span>
            <input
              type="checkbox"
              checked={form.taxFree}
              onChange={(e) => setForm((f) => ({ ...f, taxFree: e.target.checked }))}
              className="h-5 w-5 accent-ios-blue"
            />
          </label>
          <Button type="submit" fullWidth>
            {editingId ? "Speichern" : "Hinzufügen"}
          </Button>
          {editingId && (
            <Button type="button" variant="destructive" fullWidth onClick={handleDelete}>
              <span className="flex items-center justify-center gap-2">
                <Trash2 size={16} /> Löschen
              </span>
            </Button>
          )}
        </form>
      </BottomSheet>
    </Screen>
  );
}
