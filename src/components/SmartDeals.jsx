import { useMemo, useState } from "react";
import { connectedApps, deals } from "../data/deals.js";
import BrandIcon from "./BrandIcon.jsx";

const filters = ["Όλα", "Φαγητό/Καφές", "Συνδρομές", "Μετακίνηση", "Ψώνια", "Ψυχαγωγία"];

function expiryLabel(date) {
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function SmartDeals({
  linkedApps,
  expenses,
  totalSaved,
  onToggleApp,
  onNotify,
  onUseDeal,
}) {
  const [activeFilter, setActiveFilter] = useState("Όλα");
  const topCategories = useMemo(() => {
    const now = new Date();
    const categoryTotals = expenses.reduce((totals, expense) => {
      const date = new Date(`${expense.date}T12:00:00`);
      if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return totals;
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
      return totals;
    }, {});
    return new Set(Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category));
  }, [expenses]);
  const availableDeals = useMemo(() => deals
    .filter((deal) => activeFilter === "Όλα" || deal.category === activeFilter)
    .map((deal) => ({
      ...deal,
      recommended: deal.expenseCategories.some((category) => topCategories.has(category)),
      connected: linkedApps.includes(deal.connectedApp),
    }))
    .sort((a, b) => Number(b.connected) - Number(a.connected)),
  [activeFilter, linkedApps, topCategories]);

  async function copyCode(code) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Η αντιγραφή δεν υποστηρίζεται σε αυτόν τον browser.");
      }
      await navigator.clipboard.writeText(code);
      onNotify(`Ο κωδικός ${code} αντιγράφηκε.`);
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Δεν ήταν δυνατή η αντιγραφή του κωδικού.", "error");
    }
  }

  return (
    <section className="deals-page">
      <div className="page-intro">
        <span className="eyebrow">Προνόμια για φοιτητές</span>
        <h1>Smart Deals</h1>
        <p>Σύνδεσε τις αγαπημένες σου εφαρμογές για να φέρεις τις σχετικές προτάσεις πιο ψηλά.</p>
      </div>

      <section className="total-saved-card card" aria-label="Συνολική εξοικονόμηση">
        <span className="saved-coins" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M15.5 9.5c0-1.1-1.2-2-3.3-2-1.8 0-3 .8-3 2s1.2 1.8 3 2c2 .2 3.3.8 3.3 2s-1.3 2-3.3 2c-2.1 0-3.5-.9-3.5-2M12 5.5v13" /></svg>
        </span>
        <span className="saved-copy">
          <small>Συνολική Εξοικονόμηση</small>
          <strong>{new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(totalSaved)}</strong>
        </span>
        <span className="saved-caption">από τις προσφορές που χρησιμοποίησες</span>
      </section>

      <section className="connected-section card" aria-labelledby="connected-title">
        <div className="connected-heading">
          <div>
            <span className="eyebrow">Προσωποποίηση</span>
            <h2 id="connected-title">Συνδεδεμένες Εφαρμογές</h2>
          </div>
          <span className="connected-count">{linkedApps.length} συνδεδεμένες</span>
        </div>
        <div className="connected-apps">
          {connectedApps.map((app) => {
            const isConnected = linkedApps.includes(app.id);
            return (
              <button
                type="button"
                key={app.id}
                className={`connected-app ${isConnected ? "is-connected" : ""}`}
                aria-pressed={isConnected}
                onClick={() => onToggleApp(app.id)}
              >
                <BrandIcon brand={app.id} />
                <span className="app-name">{app.name}</span>
                <span className="app-status">{isConnected ? "Συνδεδεμένο" : "Σύνδεση"}</span>
              </button>
            );
          })}
        </div>
        <p className="connected-note">Η επιλογή αποθηκεύεται σε αυτή τη συσκευή. Δεν γίνεται είσοδος ή σύνδεση λογαριασμού.</p>
      </section>

      <div className="deals-toolbar">
        <div>
          <span className="eyebrow">Επιλεγμένες για εσένα</span>
          <h2>Προσφορές</h2>
        </div>
        <div className="deal-filters" role="group" aria-label="Φίλτρο κατηγορίας προσφορών">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {availableDeals.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">✦</span>
          <h3>{activeFilter === "Όλα" ? "Σύνδεσε μια εφαρμογή" : "Δεν υπάρχουν προτάσεις σε αυτή την κατηγορία"}</h3>
          <p>
            {activeFilter === "Όλα"
              ? "Οι προσφορές που σχετίζονται με τις εφαρμογές σου θα εμφανιστούν εδώ."
              : "Δοκίμασε κατηγορία «Όλα» ή σύνδεσε σχετική εφαρμογή."}
          </p>
        </div>
      ) : (
        <div className="deals-grid">
          {availableDeals.map((deal) => {
            const isExpired = new Date(`${deal.expiryDate}T23:59:59`) < new Date();
            return (
              <article className={`deal-card card ${isExpired ? "deal-expired" : ""}`} key={deal.id}>
                <div className="deal-card-top">
                  <span className="deal-brand"><BrandIcon brand={deal.brand} />{deal.brand}</span>
                  <span className="deal-badge">{deal.badge}</span>
                </div>
                {deal.recommended && (
                  <span className="recommended-badge">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 5.3L20 10l-4.3 3.6.4 5.8-4.1-3.1-5.3 2 1.8-5.5L4 9l5.8-.2z" /></svg>
                    Προτείνεται για σένα
                  </span>
                )}
                <div className="deal-copy">
                  <h3>{deal.title}</h3>
                  <p>{deal.description}</p>
                </div>
                <div className="deal-meta">
                  <span>{deal.category}</span>
                  <span>{isExpired ? "Η προσφορά έληξε" : `Έως ${expiryLabel(deal.expiryDate)}`}</span>
                </div>
                <div className="deal-actions">
                  <button
                    className="button button-secondary copy-code-button"
                    type="button"
                    disabled={isExpired || !deal.promoCode}
                    onClick={() => copyCode(deal.promoCode)}
                  >
                    <span aria-hidden="true">▢</span> Αντιγραφή Κωδικού
                  </button>
                  <button
                    className="button button-saved"
                    type="button"
                    disabled={isExpired}
                    onClick={() => onUseDeal(deal)}
                  >
                    <span aria-hidden="true">✓</span> Το χρησιμοποίησα · +{new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(deal.savingsAmount)}
                  </button>
                  <a
                    className={`button button-primary deal-link ${isExpired ? "disabled-link" : ""}`}
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${deal.linkLabel} (ανοίγει σε νέα καρτέλα)`}
                    onClick={(event) => {
                      if (isExpired) event.preventDefault();
                    }}
                  >
                    {deal.linkLabel} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="deals-disclaimer">
        Οι προσφορές, οι κωδικοί, οι εκτιμήσεις εξοικονόμησης και οι ημερομηνίες είναι ενδεικτικά παραδείγματα και μπορεί να μην ισχύουν. Έλεγξε τους όρους στον επίσημο ιστότοπο του καταστήματος. Οι σύνδεσμοι οδηγούν σε εξωτερικούς ιστότοπους.
      </p>
    </section>
  );
}
