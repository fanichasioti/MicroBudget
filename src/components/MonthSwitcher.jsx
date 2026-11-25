function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthSwitcher({ month, onChange, expenses, income }) {
  const selectedDate = new Date(`${month}-01T12:00:00`);
  const previousDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  const previousMonth = monthKey(previousDate);
  const currentExpenseTotal = expenses
    .filter((entry) => entry.date.startsWith(month))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const previousExpenseTotal = expenses
    .filter((entry) => entry.date.startsWith(previousMonth))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const currentIncomeTotal = income
    .filter((entry) => entry.date.startsWith(month))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const previousIncomeTotal = income
    .filter((entry) => entry.date.startsWith(previousMonth))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const difference = currentExpenseTotal - previousExpenseTotal;
  const percentage = previousExpenseTotal > 0
    ? Math.round((Math.abs(difference) / previousExpenseTotal) * 100)
    : null;
  const isCurrentMonth = month === monthKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" }).format(selectedDate);

  return (
    <section className="month-overview">
      <div className="month-switcher" aria-label="Επιλογή μήνα">
        <button type="button" onClick={() => onChange(previousMonth)} aria-label="Προηγούμενος μήνας">‹</button>
        <strong>{monthLabel}</strong>
        <button type="button" onClick={() => onChange(monthKey(nextDate))} aria-label="Επόμενος μήνας" disabled={isCurrentMonth}>›</button>
      </div>
      <div className={`month-comparison ${difference < 0 ? "comparison-good" : difference > 0 ? "comparison-up" : ""}`}>
        {percentage === null
          ? "Χωρίς σύγκριση με προηγούμενο μήνα"
          : difference < 0
            ? `↓ ${percentage}% λιγότερα έξοδα από τον προηγούμενο μήνα`
            : difference > 0
              ? `↑ ${percentage}% περισσότερα έξοδα από τον προηγούμενο μήνα`
              : "Ίδια έξοδα με τον προηγούμενο μήνα"}
        {previousIncomeTotal > 0 && (
          <span> · Έσοδα προηγ. μήνα: {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(previousIncomeTotal)}</span>
        )}
        {currentIncomeTotal > 0 && (
          <span className="month-current-income"> · Έσοδα: {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(currentIncomeTotal)}</span>
        )}
      </div>
    </section>
  );
}
