import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { EMI } from "../lib/types";
import { Card, Button, Modal, Input, Select, Badge } from "../components/ui";
import { formatMoney, ordinal } from "../lib/format";

function emptyForm() {
  return {
    loan_name: "",
    bank: "",
    loan_type: "emi" as "emi" | "loan",
    emi_amount: "",
    emi_day: "",
    outstanding_principal: "",
    tenure_months: "",
    remaining_months: "",
    interest_rate: "",
  };
}

export default function EMIs() {
  const [emis, setEmis] = useState<EMI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api.get<EMI[]>("/emis").then(setEmis).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/emis", {
        loan_name: form.loan_name,
        bank: form.bank || undefined,
        loan_type: form.loan_type,
        emi_amount: Number(form.emi_amount) || 0,
        emi_day: Number(form.emi_day) || 1,
        outstanding_principal: form.outstanding_principal ? Number(form.outstanding_principal) : undefined,
        tenure_months: form.tenure_months ? Number(form.tenure_months) : undefined,
        remaining_months: form.remaining_months ? Number(form.remaining_months) : undefined,
        interest_rate: form.interest_rate ? Number(form.interest_rate) : undefined,
      });
      setShowAdd(false);
      setForm(emptyForm());
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save EMI");
    }
  }

  async function onDelete(id: string) {
    await api.del(`/emis/${id}`);
    load();
  }

  const totalMonthly = emis.reduce((s, e) => s + e.emi_amount, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl">EMIs & loans</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            {formatMoney(totalMonthly)} committed per month across {emis.length} loan{emis.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add EMI</Button>
      </header>

      {loading ? (
        <p style={{ color: "var(--text-dim)" }}>Loading…</p>
      ) : emis.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            No EMIs or loans tracked yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emis.map((e) => {
            const progress =
              e.tenure_months && e.remaining_months
                ? Math.round(((e.tenure_months - e.remaining_months) / e.tenure_months) * 100)
                : null;
            return (
              <Card key={e.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-semibold">{e.loan_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                      {e.bank || "—"} · {e.loan_type === "emi" ? "EMI" : "Loan"}
                    </p>
                  </div>
                  <Badge tone="muted">Due {ordinal(e.emi_day)}</Badge>
                </div>

                <p className="font-mono text-xl mb-3">{formatMoney(e.emi_amount)}<span className="text-xs" style={{ color: "var(--text-dim)" }}> /month</span></p>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                  {e.outstanding_principal != null && (
                    <div>
                      Outstanding<br />
                      <span className="font-mono" style={{ color: "var(--text)" }}>{formatMoney(e.outstanding_principal)}</span>
                    </div>
                  )}
                  {progress !== null && (
                    <div>
                      Progress<br />
                      <span className="font-mono" style={{ color: "var(--text)" }}>{progress}% ({e.tenure_months! - e.remaining_months!}/{e.tenure_months} mo)</span>
                    </div>
                  )}
                </div>

                <button onClick={() => onDelete(e.id)} className="text-xs" style={{ color: "var(--text-dim)" }}>
                  Remove
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add EMI or loan" onClose={() => setShowAdd(false)}>
          <form onSubmit={onSubmit}>
            <Input label="Loan / EMI name" required value={form.loan_name} onChange={(e) => setForm({ ...form, loan_name: e.target.value })} placeholder="Car loan" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Bank" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="SBI" />
              <Select label="Type" value={form.loan_type} onChange={(e) => setForm({ ...form, loan_type: e.target.value as "emi" | "loan" })}>
                <option value="emi">EMI</option>
                <option value="loan">Loan</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="EMI amount (₹)" type="number" required value={form.emi_amount} onChange={(e) => setForm({ ...form, emi_amount: e.target.value })} />
              <Input label="EMI day of month" type="number" min={1} max={31} required value={form.emi_day} onChange={(e) => setForm({ ...form, emi_day: e.target.value })} />
            </div>
            <Input label="Outstanding principal (₹)" type="number" value={form.outstanding_principal} onChange={(e) => setForm({ ...form, outstanding_principal: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Tenure (months)" type="number" value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} />
              <Input label="Remaining (months)" type="number" value={form.remaining_months} onChange={(e) => setForm({ ...form, remaining_months: e.target.value })} />
            </div>
            <Input label="Interest rate (% p.a.)" type="number" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />

            {error && <p className="text-sm mb-3" style={{ color: "var(--rose)" }}>{error}</p>}
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
