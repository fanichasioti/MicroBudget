import EmptyState from "./EmptyState.jsx";
import ExpenseItem from "./ExpenseItem.jsx";

export default function ExpenseList({ expenses, onEdit, onDelete, onAdd, emptyTitle }) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? "Δεν υπάρχουν έξοδα ακόμα"}
        description={emptyTitle
          ? "Δεν βρέθηκαν έξοδα για την επιλεγμένη κατηγορία."
          : "Πρόσθεσε το πρώτο σου έξοδο για να αρχίσεις να παρακολουθείς τον προϋπολογισμό σου."}
        action={<button className="button button-primary" type="button" onClick={onAdd}>Προσθήκη εξόδου</button>}
      />
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
