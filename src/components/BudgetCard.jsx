import { useState } from "react";
import { formatCurrency } from "../utils/currency.js";
import { validateBudget } from "../utils/validation.js";

export default function BudgetCard({ budget, spent, month, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(budget));
  const [error, setError] = useState("");
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const [selectedYear, selectedMonth] = month.split("-").map(Number);
  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const remainingDays = isCurrentMonth ? daysInMonth - now.getDate() + 1 : daysInMonth;
  const dailySafeToSpend = Math.max(remaining, 0) / remainingDays;

  function submit(event) {
    event.preventDefault();
    const validationError = validateBudget(amount);
    setError(validationError);
    if (validationError) {
      onError(validationError);
      return;
    }
    onSave(Number(amount));
    setEditing(false);
  }

  return (
    <section className="budget-card card" aria-labelledby="budget-title">
      <div className="budget-heading">
        <div>
          <span className="eyebrow">Μηνιαία εικόνα</span>
          <h2 id="budget-title">Ο προϋπολογισμός σου</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setAmount(String(budget));
            setError("");
            setEditing((current) => !current);
          }}
        >
          {editing ? "Κλείσιμο" : "Αλλαγή ορίου"}
        </button>
      </div>
      <div className="budget-amounts">
        <div><strong>{formatCurrency(spent)}</strong><span>Έξοδα αυτόν τον μήνα</span></div>
        <div className="budget-limit"><strong>{formatCurrency(budget)}</strong><span>Μηνιαίο όριο</span></div>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Χρήση μηνιαίου προϋπολογισμού"
        aria-valuemin="0"
        aria-valuemax={budget}
        aria-valuenow={Math.min(spent, budget)}
      >
        <div className={`progress-fill ${percentage >= 90 ? "progress-warning" : ""}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className={`budget-note ${remaining < 0 ? "over-budget" : ""}`}>
        {remaining >= 0
          ? `Απομένουν ${formatCurrency(remaining)} για αυτόν τον μήνα.`
          : `Έχεις ξεπεράσει το όριο κατά ${formatCurrency(Math.abs(remaining))}.`}
      </p>
      <div className={`daily-safe ${remaining < 0 ? "daily-safe-warning" : ""}`}>
        <span className="daily-safe-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3.5 20 7v5.1c0 4.5-3.1 7.4-8 9.4-4.9-2-8-4.9-8-9.4V7z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>
        </span>
        <span>
          <small>Ημερήσιο Όριο</small>
          <strong>{formatCurrency(dailySafeToSpend)} <em>/ ημέρα</em></strong>
        </span>
        <span className="daily-safe-caption">
          {remaining < 0
            ? "Έχει εξαντληθεί το όριο"
            : isCurrentMonth
              ? `Για τις επόμενες ${remainingDays} ημέρες`
              : `Μέσος όρος για ${daysInMonth} ημέρες`}
        </span>
      </div>
      {editing && (
        <form className="budget-editor" onSubmit={submit} noValidate>
          <label className="field">
            Νέο μηνιαίο όριο (€)
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
            />
            {error && <span className="field-error">{error}</span>}
          </label>
          <button className="button button-primary" type="submit">Αποθήκευση ορίου</button>
        </form>
      )}
    </section>
  );
}
