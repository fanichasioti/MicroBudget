import { useState } from "react";
import { formatCurrency } from "../utils/currency.js";

function defaultDate(month) {
  const date = new Date();
  const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return month && month !== currentMonth ? `${month}-01` : `${currentMonth}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function SplitBillModal({ month, onClose, onAddShare, onError }) {
  const [total, setTotal] = useState("");
  const [friends, setFriends] = useState("2");
  const [errors, setErrors] = useState({});
  const totalAmount = Number(total);
  const friendCount = Number(friends);
  const share = totalAmount > 0 && friendCount > 0
    ? Math.round((totalAmount / friendCount) * 100) / 100
    : 0;

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) nextErrors.total = "Το σύνολο πρέπει να είναι πάνω από 0€.";
    if (!Number.isInteger(friendCount) || friendCount < 2 || friendCount > 50) {
      nextErrors.friends = "Βάλε από 2 έως 50 άτομα συνολικά.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Έλεγξε το ποσό και τα άτομα στον λογαριασμό.");
      return;
    }
    onAddShare({
      description: `Το μερίδιό μου από λογαριασμό (${friendCount} άτομα)`,
      amount: share,
      category: "Φαγητό",
      date: defaultDate(month),
    });
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="split-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="split-modal-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" /></svg>
        </div>
        <button className="split-close icon-button" type="button" onClick={onClose} aria-label="Κλείσιμο">×</button>
        <span className="eyebrow">Μοιραστείτε το δίκαια</span>
        <h2 id="split-title">Μοίρασμα Λογαριασμού</h2>
        <p>Βάλε το σύνολο και πόσα άτομα μοιράζεστε τον λογαριασμό.</p>
        <form onSubmit={submit} noValidate>
          <label className="field">
            Σύνολο λογαριασμού (€)
            <input
              autoFocus
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={total}
              onChange={(event) => {
                setTotal(event.target.value);
                setErrors((current) => ({ ...current, total: "" }));
              }}
              placeholder="π.χ. 48,00"
              aria-invalid={Boolean(errors.total)}
            />
            {errors.total && <span className="field-error">{errors.total}</span>}
          </label>
          <label className="field">
            Άτομα συνολικά (μαζί κι εσύ)
            <input
              type="number"
              min="2"
              max="50"
              step="1"
              value={friends}
              onChange={(event) => {
                setFriends(event.target.value);
                setErrors((current) => ({ ...current, friends: "" }));
              }}
              aria-invalid={Boolean(errors.friends)}
            />
            {errors.friends && <span className="field-error">{errors.friends}</span>}
          </label>
          {share > 0 && (
            <div className="split-result" aria-live="polite">
              <span>Το δικό σου μερίδιο</span>
              <strong>{formatCurrency(share)}</strong>
              <small>{formatCurrency(totalAmount)} ÷ {friendCount} άτομα</small>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Ακύρωση</button>
            <button type="submit" className="button button-primary">Πρόσθεσε το μερίδιό μου στα Έξοδα</button>
          </div>
        </form>
      </section>
    </div>
  );
}
