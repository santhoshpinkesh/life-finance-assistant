import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { CreditCard } from "../lib/types";
import { Card, ProgressBar, Button, Modal, Input, Badge } from "../components/ui";
import { formatMoney, ordinal } from "../lib/format";

const COLORS = ["#34D399", "#60A5FA", "#F5A524", "#FB7185", "#A78BFA", "#38BDF8"];

function emptyForm() {
  return {
    bank: "",
    card_name: "",
    card_last4: "",
    network: "",
    credit_limit: "",
    used_amount: "",
    due_date: "",
    statement_date: "",
    interest_rate: "",
    color: COLORS[0],
  };
}

export default function CreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<CreditCard[]>("/credit-cards")
      .then(setCards)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/credit-cards", {
        bank: form.bank,
        card_name: form.card_name,
        card_last4: form.card_last4 || undefined,
        network: form.network || undefined,
        credit_limit: Number(form.credit_limit) || 0,
        used_amount: Number(form.used_amount) || 0,
        due_date: form.due_date ? Number(form.due_date) : undefined,
        statement_date: form.statement_date ? Number(form.statement_date) : undefined,
        interest_rate: form.interest_rate ? Number(form.interest_rate) : undefined,
        color: form.color,
      });
      setShowAdd(false);
      setForm(emptyForm());
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card");
    }
  }

  async function onDelete(id: string) {
    await api.del(`/credit-cards/${id}`);
    load();
  }

  const totalLimit = cards.reduce((s, c) => s + c.credit_limit, 0);
  const totalUsed = cards.reduce((s, c) => s + c.used_amount, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl">Credit cards</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            {formatMoney(totalUsed)} used of {formatMoney(totalLimit)} across {cards.length} card
            {cards.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add card</Button>
      </header>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading…</p>
      ) : cards.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            No cards yet. Add your first card to start tracking utilization and due dates.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold">{c.card_name}</p>
                  <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                    {c.bank}
                    {c.card_last4 ? ` •••• ${c.card_last4}` : ""}
                  </p>
                </div>
                <span className="w-3 h-3 rounded-full mt-1" style={{ background: c.color || COLORS[0] }} />
              </div>

              <p className="font-mono text-xl mb-1">{formatMoney(c.available_limit)}</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                available of {formatMoney(c.credit_limit)}
              </p>

              <ProgressBar
                pct={c.utilization_pct}
                tone={c.utilization_pct > 70 ? "rose" : c.utilization_pct > 30 ? "amber" : "mint"}
              />
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {c.utilization_pct}% utilized
                </span>
                {c.due_date && <Badge tone="muted">Due {ordinal(c.due_date)}</Badge>}
              </div>

              <button
                onClick={() => onDelete(c.id)}
                className="text-xs"
                style={{ color: "var(--text-dim)" }}
              >
                Remove
              </button>
            </Card>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add credit card" onClose={() => setShowAdd(false)}>
          <form onSubmit={onSubmit}>
            <Input label="Bank" required value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="HDFC Bank" />
            <Input label="Card name" required value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} placeholder="Regalia" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Last 4 digits" value={form.card_last4} onChange={(e) => setForm({ ...form, card_last4: e.target.value })} maxLength={4} />
              <Input label="Network" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} placeholder="Visa" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Credit limit (₹)" type="number" required value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} />
              <Input label="Used amount (₹)" type="number" value={form.used_amount} onChange={(e) => setForm({ ...form, used_amount: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Due date (day of month)" type="number" min={1} max={31} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Input label="Statement date" type="number" min={1} max={31} value={form.statement_date} onChange={(e) => setForm({ ...form, statement_date: e.target.value })} />
            </div>
            <Input label="Interest rate (% p.a.)" type="number" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />

            <div className="flex gap-2 mb-4 mt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-6 h-6 rounded-full"
                  style={{ background: c, outline: form.color === c ? "2px solid var(--text)" : "none", outlineOffset: 2 }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>

            {error && <p className="text-sm mb-3" style={{ color: "var(--rose)" }}>{error}</p>}
            <Button type="submit" className="w-full">Save card</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
