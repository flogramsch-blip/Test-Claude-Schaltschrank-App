export type MeasureStatus = "geplant" | "in_arbeit" | "fertig";

export interface MeasureType {
  id: string;
  name: string;
  color: string;
  taxFree: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Attachment {
  id: string;
  label: string;
  url: string;
  addedAt: number;
}

export interface FundingEntry {
  id: string;
  amount: number;
  note: string;
  receivedAt: number | null;
  createdAt: number;
}

export interface Measure {
  id: string;
  name: string;
  categoryId: string;
  typeId: string;
  sollCost: number;
  istCost: number | null;
  status: MeasureStatus;
  notes: string;

  company: string;
  location: string;
  contact: string;
  supervisor: string;
  material: string;

  isFundable: boolean;
  fundingPercent: number | null;
  energyConsultantRequested: boolean;
  offerObtained: boolean;

  attachments: Attachment[];
  fundingEntries: FundingEntry[];

  plannedStart: number | null;
  plannedEnd: number | null;

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
  houseLabel?: string;
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

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Maßnahmen", color: "#007aff", order: 0 },
  { name: "Anschaffungen", color: "#af52de", order: 1 },
  { name: "Material", color: "#ff9500", order: 2 },
];
