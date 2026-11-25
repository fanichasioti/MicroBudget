import { useState } from "react";
import { validateBill } from "../utils/validation.js";
import { formatCurrency } from "../utils/currency.js";
import BrandIcon from "./BrandIcon.jsx";

const templates = [
  { name: "Ενοίκιο", amount: "350", dueDay: "1", category: "Σπίτι" },
  { name: "Spotify Student", amount: "5.49", dueDay: "15", category: "Συνδρομές" },
  { name: "iCloud+", amount: "0.99", dueDay: "20", category: "Συνδρομές" },
  { name: "efood pro", amount: "3.99", dueDay: "15", category: "Συνδρομές" },
  { name: "Wolt+", amount: "5.99", dueDay: "15", category: "Συνδρομές" },
  { name: "Κινητή/Internet", amount: "25", dueDay: "5", category: "Λογαριασμοί" },
  { name: "Γυμναστήριο", amount: "30", dueDay: "10", category: "Υγεία" },
];
const categories = ["Σπίτι", "Συνδρομές", "Λογαριασμοί", "Υγεία", "Μεταφορά", "Άλλο"];

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysUntilDue(dueDay) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
  if (dueDate < today) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(dueDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
  }
  return Math.round((dueDate - today) / 86_400_000);
}

function upcomingDueKey(dueDay) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
  if (dueDate < today) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(dueDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
  }
  return `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
}

function dueLabel(day) {
  const days = daysUntilDue(day);
  if (days === 0) return "Λήγει σήμερα";
  if (days === 1) return "Λήγει αύριο";
  if (days <= 3) return `Σε ${days} ημέρες`;
  return `Κάθε μήνα, στις ${day}`;
}

function freshForm(template = {}) {
  return {
    name: template.name ?? "",
    amount: template.amount ?? "",
    dueDay: template.dueDay ?? "1",
    category: template.category ?? "",
  };
}

export default function Bills({
  bills,
  notifications,
  browserPermission,
  onSaveBill,
  onDeleteBill,
  onTogglePaid,
  onEnableNotifications,
  onTestNotification,
  onError,
}) {
  const [form, setForm] = useState(null);
  const [values, setValues] = useState(freshForm());
  const [errors, setErrors] = useState({});
  const paidMonth = monthKey();

  function startForm(template = {}, bill = null) {
    setForm(bill ? { id: bill.id } : {});
    setValues(bill
      ? { name: bill.name, amount: String(bill.amount), dueDay: String(bill.dueDay), category: bill.category }
      : freshForm(template));
    setErrors({});
  }

  function submit(event) {
    event.preventDefault();
    const validationErrors = validateBill(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      onError("Έλεγξε τα στοιχεία του πάγιου.");
      return;
    }
    onSaveBill({
      ...(form.id ? { id: form.id } : {}),
      name: values.name.trim(),
      amount: Number(values.amount),
      dueDay: Number(values.dueDay),
      category: values.category,
    });
    setForm(null);
  }

  function changeField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  return (
    <section className="bills-page">
      <div className="page-intro">
        <span className="eyebrow">Μηνιαίες πληρωμές</span>
        <h1>Συνδρομές &amp; Πάγια</h1>
        <p>Κράτησε τις επαναλαμβανόμενες πληρωμές σου οργανωμένες και σημείωσε όσα εξόφλησες.</p>
      </div>

      <section className="notification-settings card" aria-labelledby="notification-settings-title">
        <div className="notification-settings-copy">
          <span className="notification-symbol" aria-hidden="true">♧</span>
          <div>
            <h2 id="notification-settings-title">Υπενθυμίσεις πληρωμών</h2>
            <p>
              {browserPermission === "granted"
                ? "Οι ειδοποιήσεις του προγράμματος περιήγησης είναι ενεργές."
                : "Λάβε υπενθύμιση εδώ και, αν το επιτρέψεις, στον browser σου."}
            </p>
          </div>
        </div>
        <div className="notification-actions">
          <button className="button button-secondary" type="button" onClick={onEnableNotifications}>
            {browserPermission === "granted" ? "Ειδοποιήσεις ενεργές" : "Ενεργοποίηση Ειδοποιήσεων"}
          </button>
          <button className="button button-primary" type="button" onClick={onTestNotification}>Δοκιμή Ειδοποίησης</button>
        </div>
        {browserPermission === "denied" && (
          <p className="permission-note">Η άδεια απορρίφθηκε. Μπορείς να την αλλάξεις στις ρυθμίσεις του browser.</p>
        )}
      </section>

      <section className="templates-section" aria-labelledby="templates-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Γρήγορη προσθήκη</span>
            <h2 id="templates-title">Φοιτητικά πάγια</h2>
          </div>
        </div>
        <div className="template-list">
          {templates.map((template) => (
            <button
              className="template-chip"
              type="button"
              key={template.name}
              onClick={() => startForm(template)}
            >
              <BrandIcon brand={template.name} />
              {template.name}
              <b>+</b>
            </button>
          ))}
        </div>
        <p className="template-note">Τα ποσά είναι ενδεικτικά. Έλεγξε και άλλαξέ τα πριν την αποθήκευση.</p>
      </section>

      <div className="bills-heading">
        <div>
          <span className="eyebrow">Οι πληρωμές σου</span>
          <h2>Τα πάγια μου</h2>
        </div>
        <button className="button button-primary" type="button" onClick={() => startForm()}>
          <span aria-hidden="true">+</span> Προσθήκη παγίου
        </button>
      </div>

      {form && (
        <form className="bill-form card" onSubmit={submit} noValidate>
          <div className="form-card-heading">
            <h3>{form.id ? "Επεξεργασία παγίου" : "Νέο πάγιο ή συνδρομή"}</h3>
            <button className="icon-button" type="button" onClick={() => setForm(null)} aria-label="Κλείσιμο φόρμας">×</button>
          </div>
          <div className="form-grid">
            <label className="field field-wide">
              Όνομα
              <input name="name" value={values.name} onChange={changeField} placeholder="π.χ. Ενοίκιο" aria-invalid={Boolean(errors.name)} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>
            <label className="field">
              Ποσό (€)
              <input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={values.amount} onChange={changeField} placeholder="0,00" aria-invalid={Boolean(errors.amount)} />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </label>
            <label className="field">
              Ημέρα πληρωμής
              <input name="dueDay" type="number" min="1" max="31" step="1" value={values.dueDay} onChange={changeField} aria-invalid={Boolean(errors.dueDay)} />
              {errors.dueDay && <span className="field-error">{errors.dueDay}</span>}
            </label>
            <label className="field field-wide">
              Κατηγορία
              <select name="category" value={values.category} onChange={changeField} aria-invalid={Boolean(errors.category)}>
                <option value="">Επίλεξε κατηγορία</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </label>
          </div>
          <div className="form-actions">
            <button className="button button-secondary" type="button" onClick={() => setForm(null)}>Ακύρωση</button>
            <button className="button button-primary" type="submit">{form.id ? "Αποθήκευση" : "Προσθήκη παγίου"}</button>
          </div>
        </form>
      )}

      {bills.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">◷</span>
          <h3>Δεν έχεις προσθέσει πάγια ακόμα</h3>
          <p>Διάλεξε ένα από τα παραπάνω πρότυπα ή πρόσθεσε τη δική σου μηνιαία πληρωμή.</p>
          <button className="button button-primary" type="button" onClick={() => startForm()}>Προσθήκη παγίου</button>
        </div>
      ) : (
        <div className="bills-list">
          {bills.map((bill) => {
            const isPaid = bill.paidMonth === paidMonth;
            const dueIn = daysUntilDue(bill.dueDay);
            const reminder = notifications.some((item) => (
              item.billId === bill.id && item.dueDate === upcomingDueKey(bill.dueDay) && !item.read
            ));
            return (
              <article className={`bill-item card ${isPaid ? "bill-paid" : ""}`} key={bill.id}>
                <div className="bill-main">
                  <BrandIcon brand={bill.name} />
                  <div className="bill-info">
                    <strong>{bill.name}</strong>
                    <span>{bill.category} · {dueLabel(bill.dueDay)}</span>
                  </div>
                  <strong className="bill-amount">{formatCurrency(bill.amount)}</strong>
                </div>
                {!isPaid && dueIn <= 3 && (
                  <span className={`due-badge ${dueIn === 0 ? "due-today" : ""}`}>
                    {reminder ? "Υπενθύμιση" : dueLabel(bill.dueDay)}
                  </span>
                )}
                <label className="paid-toggle">
                  <input type="checkbox" checked={isPaid} onChange={() => onTogglePaid(bill, isPaid)} />
                  <span className="toggle-track" aria-hidden="true" />
                  <span>Πληρώθηκε αυτόν τον μήνα</span>
                </label>
                <div className="bill-actions">
                  <button type="button" onClick={() => startForm({}, bill)} aria-label={`Επεξεργασία ${bill.name}`}>Επεξεργασία</button>
                  <button type="button" onClick={() => onDeleteBill(bill)} aria-label={`Διαγραφή ${bill.name}`}>Διαγραφή</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="reminder-disclaimer">Οι υπενθυμίσεις εμφανίζονται όσο η εφαρμογή είναι ανοιχτή. Οι ειδοποιήσεις browser απαιτούν άδεια και συμβατό browser.</p>
    </section>
  );
}
