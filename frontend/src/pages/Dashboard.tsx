import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DashboardSummary, Reminder } from "../lib/types";
import { Card, ProgressBar, Badge } from "../components/ui";
import { formatMoney, formatDueLabel, CATEGORY_LABELS } from "../lib/format";
import { useAuth } from "../context/AuthContext";

function ReminderRow({ r }: { r: Reminder }) {
  const label = formatDueLabel(r.due_date);
  const tone = label.includes("overdue") ? "rose" : label === "Due today" ? "amber" : "muted";
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <div className="min-w-0">
        <p className="text-sm truncate">{r.title}</p>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          {CATEGORY_LABELS[r.category]}
          {r.amount ? ` · ${formatMoney(r.amount)}` : ""}
        </p>
      </div>
      <Badge tone={tone as "mint" | "amber" | "rose" | "muted"}>{label}</Badge>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get<DashboardSummary>("/dashboard/summary")
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const greetingName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display font-semibold text-2xl">Hi {greetingName} — here's your ledger</h1>
      </header>

      {error && (
        <Card className="mb-6">
          <p style={{ color: "var(--rose)" }}>{error}</p>
        </Card>
      )}

      {summary && (
        <>
          {/* Hero row: the ledger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <p className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>
                Credit available
              </p>
              <p className="font-mono text-3xl font-medium" style={{ color: "var(--mint)" }}>
                {formatMoney(summary.total_credit_available)}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                of {formatMoney(summary.total_credit_limit)} limit
              </p>
            </Card>

            <Card>
              <p className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>
                Overall utilization
              </p>
              <p
                className="font-mono text-3xl font-medium"
                style={{
                  color:
                    summary.overall_utilization_pct > 70
                      ? "var(--rose)"
                      : summary.overall_utilization_pct > 30
                      ? "var(--amber)"
                      : "var(--mint)",
                }}
              >
                {summary.overall_utilization_pct}%
              </p>
              <div className="mt-2">
                <ProgressBar
                  pct={summary.overall_utilization_pct}
                  tone={summary.overall_utilization_pct > 70 ? "rose" : summary.overall_utilization_pct > 30 ? "amber" : "mint"}
                />
              </div>
            </Card>

            <Card>
              <p className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>
                Monthly commitments
              </p>
              <p className="font-mono text-3xl font-medium">{formatMoney(summary.total_monthly_commitments)}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                across active EMIs & loans
              </p>
            </Card>
          </div>

          {(summary.cards_over_30pct > 0 || summary.cards_over_70pct > 0) && (
            <div className="flex gap-2 mb-6">
              {summary.cards_over_70pct > 0 && (
                <Badge tone="rose">{summary.cards_over_70pct} card(s) over 70% utilization</Badge>
              )}
              {summary.cards_over_30pct > 0 && (
                <Badge tone="amber">{summary.cards_over_30pct} card(s) over 30% utilization</Badge>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h2 className="font-display font-semibold text-sm mb-1">Missed</h2>
              <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                Needs attention now
              </p>
              {summary.missed_reminders.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  Nothing missed. Clean slate.
                </p>
              ) : (
                summary.missed_reminders.map((r) => <ReminderRow key={r.id} r={r} />)
              )}
            </Card>

            <Card>
              <h2 className="font-display font-semibold text-sm mb-1">Today</h2>
              <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                Due today
              </p>
              {summary.today_reminders.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  Nothing due today.
                </p>
              ) : (
                summary.today_reminders.map((r) => <ReminderRow key={r.id} r={r} />)
              )}
            </Card>

            <Card>
              <h2 className="font-display font-semibold text-sm mb-1">Next 7 days</h2>
              <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                Coming up
              </p>
              {summary.upcoming_reminders_7d.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  Nothing in the next week.
                </p>
              ) : (
                summary.upcoming_reminders_7d.map((r) => <ReminderRow key={r.id} r={r} />)
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
