import { useEffect, useState } from "react";
import BudgetCard from "./BudgetCard.jsx";
import CategoryDonut from "./CategoryDonut.jsx";
import EmptyState from "./EmptyState.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseList from "./ExpenseList.jsx";
import IncomeTracker from "./IncomeTracker.jsx";
import MonthSwitcher from "./MonthSwitcher.jsx";
import SavingsGoals from "./SavingsGoals.jsx";
import SavingsSimulator from "./SavingsSimulator.jsx";
import SplitBillModal from "./SplitBillModal.jsx";

export default function Dashboard({
  expenses,
  budget,
  onSaveBudget,
  onSaveExpense,
  onDeleteExpense,
  onError,
  goals,
  onAddGoal,
  onDeleteGoal,
  onContribute,
  onNavigate,
  month,
  onMonthChange,
  incomes,
  onSaveIncome,
  onDeleteIncome,
  simulatorSettings,
  onSimulatorChange,
}) {
  const [formState, setFormState] = useState(null);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  useEffect(() => setCategoryFilter("all"), [month]);
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(month));
  const monthIncomes = incomes.filter((income) => income.date.startsWith(month));
  const spent = monthExpenses.reduce((total, expense) => total + expense.amount, 0);
  const budgetUsage = budget > 0 ? spent / budget : 0;
  const status = budgetUsage >= 0.85
    ? "warning"
    : budgetUsage >= 0.7
      ? "steady"
      : "good";
  const sortedExpenses = [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date));
  const categories = [...new Set(monthExpenses.map((expense) => expense.category))].sort((a, b) => a.localeCompare(b, "el"));
  const visibleExpenses = categoryFilter === "all"
    ? sortedExpenses
    : sortedExpenses.filter((expense) => expense.category === categoryFilter);
  const categoryTotals = Object.values(monthExpenses.reduce((totals, expense) => {
    totals[expense.category] ??= { category: expense.category, amount: 0 };
    totals[expense.category].amount += expense.amount;
    return totals;
  }, {})).sort((a, b) => b.amount - a.amount);
  const monthlyExportExpenses = monthExpenses
    .filter((expense) => categoryFilter === "all" || expense.category === categoryFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  function exportCsv() {
    if (monthlyExportExpenses.length === 0) {
      onError("Δεν υπάρχουν έξοδα αυτού του μήνα για εξαγωγή με το επιλεγμένο φίλτρο.");
      return;
    }
    const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["Ημερομηνία", "Περιγραφή", "Κατηγορία", "Ποσό (€)"],
      ...monthlyExportExpenses.map((expense) => [
        expense.date,
        expense.description,
        expense.category,
        Number(expense.amount).toFixed(2),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `microbudget-exoda-${month}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function saveExpense(values) {
    onSaveExpense(values, formState?.expense?.id);
    setFormState(null);
  }

  return (
    <div className="dashboard">
      <MonthSwitcher
        month={month}
        onChange={onMonthChange}
        expenses={expenses}
        income={incomes}
      />
      <section className={`status-banner status-${status}`} aria-live="polite">
        <span className="status-icon" aria-hidden="true">
          {status === "good" ? "✦" : status === "warning" ? "!" : "◷"}
        </span>
        <div className="status-copy">
          <strong>
            {status === "good"
              ? "Πας πολύ καλά!"
              : status === "warning"
                ? "Πλησιάζεις το μηνιαίο σου όριο"
                : "Κράτα τον ρυθμό σου"}
          </strong>
          <span>
            {status === "good"
              ? "Έχεις χώρο στον προϋπολογισμό σου. Συνέχισε έτσι."
              : status === "warning"
                ? "Μικρές επιλογές τώρα κάνουν διαφορά μέχρι το τέλος του μήνα."
                : "Έχεις ήδη χρησιμοποιήσει αρκετό από το μηνιαίο σου budget."}
          </span>
        </div>
        {status === "warning" && (
          <button type="button" onClick={() => onNavigate("deals")}>
            Δες προσφορές <span aria-hidden="true">↗</span>
          </button>
        )}
      </section>
      <BudgetCard budget={budget} spent={spent} month={month} onSave={onSaveBudget} onError={onError} />
      <CategoryDonut
        entries={categoryTotals}
        onSelectCategory={(category) => setCategoryFilter(category ?? "all")}
      />
      <SavingsGoals
        goals={goals}
        onAddGoal={onAddGoal}
        onDeleteGoal={onDeleteGoal}
        onContribute={onContribute}
        onError={onError}
      />
      <SavingsSimulator settings={simulatorSettings} onChange={onSimulatorChange} />
      <IncomeTracker
        key={month}
        entries={monthIncomes}
        expensesTotal={spent}
        month={month}
        onSave={onSaveIncome}
        onDelete={onDeleteIncome}
        onError={onError}
      />
      <section className="section-block" aria-labelledby="expenses-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Οι κινήσεις σου</span>
            <h2 id="expenses-title">Έξοδα</h2>
          </div>
          <div className="expense-heading-actions">
            <button className="button button-secondary split-bill-button" type="button" onClick={() => setSplitBillOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" /></svg>
              <span>Μοίρασμα Λογαριασμού</span>
            </button>
            <button className="button button-primary" type="button" onClick={() => setFormState({ expense: null })}>
              <span aria-hidden="true">+</span> Προσθήκη
            </button>
          </div>
        </div>
        <div className="expense-toolbar">
          <label className="expense-filter">
            <span>Κατηγορία</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Όλες οι κατηγορίες</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <button className="button button-secondary csv-button" type="button" onClick={exportCsv}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" /></svg>
            Εξαγωγή CSV
          </button>
        </div>
        {formState ? (
          <div className="form-card card">
            <div className="form-card-heading">
              <h3>{formState.expense ? "Επεξεργασία εξόδου" : "Νέο έξοδο"}</h3>
              <button className="icon-button" type="button" onClick={() => setFormState(null)} aria-label="Κλείσιμο φόρμας">×</button>
            </div>
            <ExpenseForm
              key={formState.expense?.id ?? `new-expense-${month}`}
              expense={formState.expense}
              month={month}
              onSave={saveExpense}
              onCancel={() => setFormState(null)}
              onError={onError}
            />
          </div>
        ) : null}
        {visibleExpenses.length === 0 ? !formState && (
          <EmptyState
            title={categoryFilter === "all" ? "Δεν υπάρχουν έξοδα αυτόν τον μήνα" : "Δεν υπάρχουν έξοδα σε αυτή την κατηγορία"}
            description={categoryFilter === "all"
              ? "Πρόσθεσε ένα έξοδο ή διάλεξε άλλον μήνα για να δεις τις κινήσεις σου."
              : "Δοκίμασε άλλη κατηγορία ή πρόσθεσε ένα νέο έξοδο."}
            action={categoryFilter === "all"
              ? <button className="button button-primary" type="button" onClick={() => setFormState({ expense: null })}>Προσθήκη εξόδου</button>
              : undefined}
          />
        ) : (
          <ExpenseList
            expenses={visibleExpenses}
            onEdit={(expense) => setFormState({ expense })}
            onDelete={onDeleteExpense}
            onAdd={() => setFormState({ expense: null })}
            emptyTitle={categoryFilter !== "all" ? "Δεν υπάρχουν έξοδα σε αυτή την κατηγορία" : undefined}
          />
        )}
      </section>
      {visibleExpenses.length === 0 && (
        <div className="tip-card">
          <span aria-hidden="true">✦</span>
          <p>Μικρές καταγραφές σήμερα, καλύτερη εικόνα του μήνα αύριο.</p>
        </div>
      )}
      {splitBillOpen && (
        <SplitBillModal
          month={month}
          onClose={() => setSplitBillOpen(false)}
          onAddShare={(expense) => {
            onSaveExpense(expense);
            setSplitBillOpen(false);
          }}
          onError={onError}
        />
      )}
    </div>
  );
}
