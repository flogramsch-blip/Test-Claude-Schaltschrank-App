const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuro(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(timestamp: number) {
  if (!timestamp) return "–";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(timestamp),
  );
}
