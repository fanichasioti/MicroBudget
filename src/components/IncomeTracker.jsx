import { useState } from "react";
import { formatCurrency } from "../utils/currency.js";

const sources = ["Χαρτζιλίκι", "Δουλειά", "Πρακτική", "Υποτροφία", "Άλλο"];

function firstDayOfMonth(month) {
  return `${month}-01`;
}

function validate(values) {
  const errors = {};
  if (!values.description.trim()) errors.description = "Συμπλήρωσε μια περιγραφή.";
  if (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0) {
    errors.amount = "Το ποσό πρέπει να είναι πάνω από 0€.";
  }
  if (!values.date || Number.isNaN(Date.parse(values.date))) errors.date = "Επίλεξε έγκυρη ημερομηνία.";
  if (!values.source) errors.source = "Επίλεξε πηγή εσόδου.";
  return errors;
}

export default function IncomeTracker({ entries, expensesTotal, month, onSave, onDelete, onError }) {
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState({
    description: "",
    amount: "",
    source: "",
    date: firstDayOfMonth(month),
  });
  const [errors, setErrors] = useState({});
  const income = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenses = expensesTotal;
  const difference = income - expenses;
  const formattedMonth = new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" })
    .format(new Date(`${month}-01T12:00:00`));

  function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Έλεγξε τα στοιχεία του εσόδου.");
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      description: values.description.trim(),
      amount: Number(values.amount),
      source: values.source,
      date: values.date,
    });
    setValues({ description: "", amount: "", source: "", date: firstDayOfMonth(month) });
    setFormOpen(false);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  return (
    <section className="income-card card" aria-labelledby="income-title">
      <div className="income-heading">
        <div>
          <span className="eyebrow">{formattedMonth}</span>
          <h2 id="income-title">Έσοδα &amp; Έξοδα</h2>
        </div>
        <button className="button button-secondary income-add-button" type="button" onClick={() => setFormOpen((open) => !open)}>
          <span aria-hidden="true">{formOpen ? "×" : "+"}</span>{formOpen ? "Κλείσιμο" : "Προσθήκη Εσόδου"}
        </button>
      </div>
      <div className="income-summary">
        <div className="income-total">
          <span>Συνολικά έσοδα</span>
          <strong>{formatCurrency(income)}</strong>
        </div>
        <div className="expense-total">
          <span>Συνολικά έξοδα</span>
          <strong>{formatCurrency(expenses)}</strong>
        </div>
        <div className={`balance-total ${difference < 0 ? "balance-negative" : ""}`}>
          <span>{difference < 0 ? "Υπέρβαση" : "Υπόλοιπο"}</span>
          <strong>{formatCurrency(difference)}</strong>
        </div>
      </div>

      {formOpen && (
        <form className="income-form" onSubmit={submit} noValidate>
          <label className="field">
            Πηγή εσόδου
            <select name="source" value={values.source} onChange={updateField} aria-invalid={Boolean(errors.source)}>
              <option value="">Επίλεξε</option>
              {sources.map((source) => <option key={source}>{source}</option>)}
            </select>
            {errors.source && <span className="field-error">{errors.source}</span>}
          </label>
          <label className="field">
            Περιγραφή
            <input name="description" value={values.description} onChange={updateField} placeholder="π.χ. Μηνιαίο χαρτζιλίκι" aria-invalid={Boolean(errors.description)} />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>
          <label className="field">
            Ποσό (€)
            <input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={values.amount} onChange={updateField} placeholder="0,00" aria-invalid={Boolean(errors.amount)} />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </label>
          <label className="field">
            Ημερομηνία
            <input name="date" type="date" value={values.date} onChange={updateField} aria-invalid={Boolean(errors.date)} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>
          <div className="income-form-actions">
            <button type="submit" className="button button-primary">Αποθήκευση εσόδου</button>
          </div>
        </form>
      )}

      {formOpen && entries.length > 0 && (
        <div className="income-entry-list">
          {entries.map((entry) => (
            <article className="income-entry" key={entry.id}>
              <span className="income-entry-icon" aria-hidden="true">↗</span>
              <span className="income-entry-description">
                <strong>{entry.description}</strong>
                <small>{entry.source} · {new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short" }).format(new Date(`${entry.date}T12:00:00`))}</small>
              </span>
              <strong className="income-entry-amount">+{formatCurrency(entry.amount)}</strong>
              <button type="button" className="income-delete" onClick={() => onDelete(entry)} aria-label={`Διαγραφή εσόδου ${entry.description}`}>×</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
