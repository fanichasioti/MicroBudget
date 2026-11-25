import { formatCurrency } from "../utils/currency.js";

export default function ExpenseItem({ expense, onEdit, onDelete }) {
  const date = new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${expense.date}T12:00:00`));

  return (
    <article className="expense-item">
      <div className="category-icon" aria-hidden="true">{expense.category.slice(0, 1)}</div>
      <div className="expense-details">
        <strong>{expense.description}</strong>
        <span>{expense.category} · {date}</span>
      </div>
      <strong className="expense-amount">−{formatCurrency(expense.amount)}</strong>
      <div className="expense-actions">
        <button type="button" onClick={() => onEdit(expense)} aria-label={`Επεξεργασία: ${expense.description}`}>Επεξεργασία</button>
        <button type="button" onClick={() => onDelete(expense)} aria-label={`Διαγραφή: ${expense.description}`}>Διαγραφή</button>
      </div>
    </article>
  );
}
