const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  return inr.format(amount || 0);
}

export function ordinal(day: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  return `${day}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatDueLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d}d`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  credit_card: "Credit card",
  emi: "EMI / loan",
  bill: "Bill",
  subscription: "Subscription",
  document: "Document",
  insurance: "Insurance",
  investment: "Investment",
  other: "Other",
};
