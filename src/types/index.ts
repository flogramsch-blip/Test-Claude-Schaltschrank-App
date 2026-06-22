export type MeasureStatus = "geplant" | "in_arbeit" | "fertig";

export interface MeasureType {
  id: string;
  name: string;
  color: string;
  taxFree: boolean;
  order: number;
}

export interface Measure {
  id: string;
  name: string;
  typeId: string;
  sollCost: number;
  istCost: number | null;
  status: MeasureStatus;
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  householdId: string | null;
  fcmTokens: string[];
}

export const STATUS_LABELS: Record<MeasureStatus, string> = {
  geplant: "Geplant",
  in_arbeit: "In Arbeit",
  fertig: "Fertig",
};

export const DEFAULT_MEASURE_TYPES: Omit<MeasureType, "id">[] = [
  { name: "Eigenleistung", color: "#34c759", taxFree: false, order: 0 },
  { name: "Unternehmen (mit Rechnung)", color: "#007aff", taxFree: false, order: 1 },
  { name: "Unternehmen (ohne Rechnung)", color: "#ff9500", taxFree: true, order: 2 },
];
