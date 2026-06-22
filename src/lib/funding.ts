import type { FundingEntry } from "../types";

export function receivedFundingTotal(entries: FundingEntry[]) {
  return entries.filter((e) => e.receivedAt !== null).reduce((sum, e) => sum + e.amount, 0);
}

export function pendingFundingTotal(entries: FundingEntry[]) {
  return entries.filter((e) => e.receivedAt === null).reduce((sum, e) => sum + e.amount, 0);
}

export function netCostAfterFunding(istCost: number | null, entries: FundingEntry[]) {
  return (istCost ?? 0) - receivedFundingTotal(entries);
}
