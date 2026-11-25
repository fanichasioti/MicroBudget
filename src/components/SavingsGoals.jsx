import { useState } from "react";
import { formatCurrency } from "../utils/currency.js";

export default function SavingsGoals({ goals, onAddGoal, onDeleteGoal, onContribute, onError }) {
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState({ name: "", target: "" });
  const [errors, setErrors] = useState({});
  const [customAmounts, setCustomAmounts] = useState({});

  function submitGoal(event) {
    event.preventDefault();
    const name = values.name.trim();
    const target = Number(values.target);
    const nextErrors = {};
    if (!name) nextErrors.name = "Συμπλήρωσε όνομα στόχου.";
    if (!Number.isFinite(target) || target <= 0) nextErrors.target = "Ο στόχος πρέπει να είναι πάνω από 0€.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Έλεγξε τα στοιχεία του στόχου.");
      return;
    }
    onAddGoal({ id: crypto.randomUUID(), name, target, saved: 0 });
    setValues({ name: "", target: "" });
    setFormOpen(false);
  }

  function contribute(goal, amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      onError("Η κατάθεση πρέπει να είναι μεγαλύτερη από 0€.");
      return;
    }
    onContribute(goal, value);
    setCustomAmounts((current) => ({ ...current, [goal.id]: "" }));
  }

  return (
    <section className="goals-section card" aria-labelledby="goals-title">
      <div className="goals-heading">
        <div>
          <span className="eyebrow">Βήμα βήμα πιο κοντά</span>
          <h2 id="goals-title">Στόχοι Αποταμίευσης</h2>
        </div>
        <span className="goals-icon" aria-hidden="true">◉</span>
      </div>

      {goals.length === 0 ? (
        <div className="goals-empty">
          <p>Δημιούργησε έναν στόχο, όπως ένα ταξίδι ή ένα καινούριο laptop.</p>
        </div>
      ) : (
        <div className="goals-list">
          {goals.map((goal) => {
            const percentage = Math.min((goal.saved / goal.target) * 100, 100);
            return (
              <article className="goal-item" key={goal.id}>
                <div className="goal-title-row">
                  <strong>{goal.name}</strong>
                  <button type="button" className="goal-delete" onClick={() => onDeleteGoal(goal)} aria-label={`Διαγραφή στόχου ${goal.name}`}>×</button>
                </div>
                <div className="goal-amounts">
                  <span>{formatCurrency(goal.saved)} αποταμιεύτηκαν</span>
                  <strong>{formatCurrency(goal.target)}</strong>
                </div>
                <div
                  className="goal-progress-track"
                  role="progressbar"
                  aria-label={`Πρόοδος στόχου ${goal.name}`}
                  aria-valuemin="0"
                  aria-valuemax={goal.target}
                  aria-valuenow={Math.min(goal.saved, goal.target)}
                >
                  <span style={{ width: `${percentage}%` }} />
                </div>
                <div className="goal-contribute-actions">
                  <button type="button" onClick={() => contribute(goal, 5)}>+5€</button>
                  <button type="button" onClick={() => contribute(goal, 10)}>+10€</button>
                  <form
                    className="custom-contribution"
                    onSubmit={(event) => {
                      event.preventDefault();
                      contribute(goal, customAmounts[goal.id]);
                    }}
                  >
                    <label className="sr-only" htmlFor={`goal-custom-${goal.id}`}>Προσαρμοσμένο ποσό για {goal.name}</label>
                    <input
                      id={`goal-custom-${goal.id}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Ποσό €"
                      value={customAmounts[goal.id] ?? ""}
                      onChange={(event) => setCustomAmounts((current) => ({ ...current, [goal.id]: event.target.value }))}
                    />
                    <button type="submit" aria-label={`Προσθήκη ποσού στον στόχο ${goal.name}`}>+</button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formOpen ? (
        <form className="goal-form" onSubmit={submitGoal} noValidate>
          <label className="field">
            Όνομα στόχου
            <input
              value={values.name}
              onChange={(event) => {
                setValues((current) => ({ ...current, name: event.target.value }));
                setErrors((current) => ({ ...current, name: "" }));
              }}
              placeholder="π.χ. Ταξίδι"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label className="field">
            Στόχος ποσού (€)
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={values.target}
              onChange={(event) => {
                setValues((current) => ({ ...current, target: event.target.value }));
                setErrors((current) => ({ ...current, target: "" }));
              }}
              placeholder="π.χ. 800"
              aria-invalid={Boolean(errors.target)}
            />
            {errors.target && <span className="field-error">{errors.target}</span>}
          </label>
          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>Ακύρωση</button>
            <button type="submit" className="button button-primary">Δημιουργία στόχου</button>
          </div>
        </form>
      ) : (
        <button className="add-goal-button" type="button" onClick={() => setFormOpen(true)}>
          <span aria-hidden="true">+</span> Νέος στόχος
        </button>
      )}
    </section>
  );
}
