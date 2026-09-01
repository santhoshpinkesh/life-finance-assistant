import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Reminder, ReminderCategory } from "../lib/types";
import { Card, Button, Modal, Input, Select, Badge } from "../components/ui";
import { formatMoney, formatDueLabel, CATEGORY_LABELS } from "../lib/format";

function emptyForm() {
  return {
    title: "",
    category: "bill" as ReminderCategory,
    due_date: new Date().toISOString().slice(0, 10),
    amount: "",
    notes: "",
    is_recurring: false,
    recurrence_days: "",
  };
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "completed">("active");

  function load() {
    setLoading(true);
    api.get<Reminder[]>("/reminders").then(setReminders).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/reminders", {
        title: form.title,
        category: form.category,
        due_date: form.due_date,
        amount: form.amount ? Number(form.amount) : undefined,
        notes: form.notes || undefined,
        is_recurring: form.is_recurring,
        recurrence_days: form.recurrence_days ? Number(form.recurrence_days) : undefined,
      });
      setShowAdd(false);
      setForm(emptyForm());
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reminder");
    }
  }

  async function toggleComplete(r: Reminder) {
    await api.patch(`/reminders/${r.id}`, { is_completed: !r.is_completed });
    load();
  }

  async function onDelete(id: string) {
    await api.del(`/reminders/${id}`);
    load();
  }

  const filtered = reminders
    .filter((r) => (filter === "active" ? !r.is_completed : r.is_completed))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl">Reminders</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            {reminders.filter((r) => !r.is_completed).length} active
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add reminder</Button>
      </header>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("active")}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: filter === "active" ? "var(--surface-2)" : "transparent", color: filter === "active" ? "var(--text)" : "var(--text-dim)" }}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: filter === "completed" ? "var(--surface-2)" : "transparent", color: filter === "completed" ? "var(--text)" : "var(--text-dim)" }}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Nothing here yet.
          </p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          {filtered.map((r) => {
            const label = formatDueLabel(r.due_date);
            const tone = r.is_completed ? "muted" : label.includes("overdue") ? "rose" : label === "Due today" ? "amber" : "muted";
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <input
                  type="checkbox"
                  checked={r.is_completed}
                  onChange={() => toggleComplete(r)}
                  className="w-4 h-4 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${r.is_completed ? "line-through" : ""}`} style={{ color: r.is_completed ? "var(--text-dim)" : "var(--text)" }}>
                    {r.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                    {CATEGORY_LABELS[r.category]}
                    {r.amount ? ` · ${formatMoney(r.amount)}` : ""}
                    {r.is_recurring ? " · recurring" : ""}
                  </p>
                </div>
                {!r.is_completed && <Badge tone={tone as "mint" | "amber" | "rose" | "muted"}>{label}</Badge>}
                <button onClick={() => onDelete(r.id)} className="text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
                  Remove
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {showAdd && (
        <Modal title="Add reminder" onClose={() => setShowAdd(false)}>
          <form onSubmit={onSubmit}>
            <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Passport renewal" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ReminderCategory })}>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Input label="Due date" type="date" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <Input label="Amount (₹, optional)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <label className="flex items-center gap-2 mb-3 text-sm">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
              />
              Recurring
            </label>
            {form.is_recurring && (
              <Input label="Repeats every (days)" type="number" value={form.recurrence_days} onChange={(e) => setForm({ ...form, recurrence_days: e.target.value })} placeholder="30" />
            )}

            {error && <p className="text-sm mb-3" style={{ color: "var(--rose)" }}>{error}</p>}
            <Button type="submit" className="w-full">Save reminder</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
