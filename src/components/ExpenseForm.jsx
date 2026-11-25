import { useState } from "react";
import { validateExpense } from "../utils/validation.js";

const categories = [
  "Φαγητό",
  "Μεταφορά",
  "Σπίτι",
  "Λογαριασμοί",
  "Ψυχαγωγία",
  "Υγεία",
  "Σπουδές",
  "Άλλο",
];

function defaultDate(month) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (month && month !== currentMonth) return `${month}-01`;
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function ExpenseForm({ expense, month, onSave, onCancel, onError }) {
  const [values, setValues] = useState({
    description: expense?.description ?? "",
    category: expense?.category ?? "",
    amount: expense ? String(expense.amount) : "",
    date: expense?.date ?? defaultDate(month),
  });
  const [errors, setErrors] = useState({});

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateExpense(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Έλεγξε τα πεδία με τις επισημάνσεις.");
      return;
    }

    onSave({
      description: values.description.trim(),
      category: values.category,
      amount: Number(values.amount),
      date: values.date,
    });
  }

  return (
    <form className="expense-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label className="field field-wide">
          Περιγραφή
          <input
            autoFocus
            name="description"
            value={values.description}
            onChange={updateField}
            placeholder="π.χ. Καφές"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && <span className="field-error" id="description-error">{errors.description}</span>}
        </label>
        <label className="field">
          Κατηγορία
          <select
            name="category"
            value={values.category}
            onChange={updateField}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            <option value="">Επίλεξε</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          {errors.category && <span className="field-error" id="category-error">{errors.category}</span>}
        </label>
        <label className="field">
          Ποσό (€)
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={values.amount}
            onChange={updateField}
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
          {errors.amount && <span className="field-error" id="amount-error">{errors.amount}</span>}
        </label>
        <label className="field field-wide">
          Ημερομηνία
          <input
            name="date"
            type="date"
            value={values.date}
            onChange={updateField}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date && <span className="field-error" id="date-error">{errors.date}</span>}
        </label>
      </div>
      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}>Ακύρωση</button>
        <button className="button button-primary" type="submit">{expense ? "Αποθήκευση" : "Προσθήκη εξόδου"}</button>
      </div>
    </form>
  );
}
