import { formatCurrency } from "../utils/currency.js";

const weeksPerMonth = 4.33;
const semesterMonths = 5;

export default function SavingsSimulator({ settings, onChange }) {
  const monthlySavings = (settings.deliveries * 8 + settings.coffees * 3.5) * weeksPerMonth;

  function update(name, value) {
    onChange({ ...settings, [name]: Number(value) });
  }

  return (
    <section className="simulator-card card" aria-labelledby="simulator-title">
      <div className="simulator-heading">
        <div>
          <span className="eyebrow">Μικρές αλλαγές, μεγάλο αποτέλεσμα</span>
          <h2 id="simulator-title">Κι αν άλλαζες λίγο τη συνήθεια;</h2>
        </div>
        <span className="simulator-spark" aria-hidden="true">✦</span>
      </div>
      <label className="simulator-slider">
        <span>
          <span>Μία λιγότερη παραγγελία την εβδομάδα</span>
          <strong>{settings.deliveries}</strong>
        </span>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={settings.deliveries}
          onChange={(event) => update("deliveries", event.target.value)}
        />
      </label>
      <label className="simulator-slider">
        <span>
          <span>Ένας λιγότερος καφές απ' έξω την εβδομάδα</span>
          <strong>{settings.coffees}</strong>
        </span>
        <input
          type="range"
          min="0"
          max="7"
          step="1"
          value={settings.coffees}
          onChange={(event) => update("coffees", event.target.value)}
        />
      </label>
      <div className="simulator-result">
        <div>
          <span>Πιθανή εξοικονόμηση / μήνα</span>
          <strong>{formatCurrency(monthlySavings)}</strong>
        </div>
        <div>
          <span>Σε ένα εξάμηνο</span>
          <strong>{formatCurrency(monthlySavings * semesterMonths)}</strong>
        </div>
      </div>
      <p className="simulator-note">Ενδεικτικός υπολογισμός με μέσο κόστος 8€ ανά παραγγελία και 3,50€ ανά καφέ.</p>
    </section>
  );
}
