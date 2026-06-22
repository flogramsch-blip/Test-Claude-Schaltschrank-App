import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();

/**
 * Notifies every other household member by push when a measure's
 * planned (Soll) or actual (Ist) cost is created or changed. This is
 * what makes notifications arrive even while the app is closed.
 */
export const onMeasureChange = onDocumentWritten(
  "households/{householdId}/measures/{measureId}",
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return; // measure was deleted

    const before = event.data?.before.data();
    const { householdId } = event.params;
    const db = getFirestore();

    const householdSnap = await db.doc(`households/${householdId}`).get();
    const memberIds: string[] = householdSnap.data()?.memberIds ?? [];
    const recipientIds = memberIds.filter((id) => id !== after.updatedBy);
    if (recipientIds.length === 0) return;

    const userDocs = await db.getAll(...recipientIds.map((id) => db.doc(`users/${id}`)));
    const tokens = userDocs.flatMap((d) => (d.data()?.fcmTokens as string[]) ?? []);
    if (tokens.length === 0) return;

    const isNew = !before;
    const title = isNew ? "Neue Maßnahme" : "Kosten aktualisiert";
    const body = isNew
      ? `"${after.name}" wurde hinzugefügt (Soll: ${after.sollCost} €)`
      : `"${after.name}": Soll ${after.sollCost} € / Ist ${after.istCost ?? "offen"} €`;

    await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
    });
  },
);
