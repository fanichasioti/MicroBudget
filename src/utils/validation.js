export function validateExpense(values) {
  const errors = {};
  const description = values.description.trim();
  const category = values.category.trim();
  const amount = Number(values.amount);

  if (!description) errors.description = "Συμπλήρωσε μια περιγραφή.";
  if (!category) errors.category = "Επίλεξε κατηγορία.";
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Το ποσό πρέπει να είναι μεγαλύτερο από 0.";
  }
  if (!values.date || Number.isNaN(Date.parse(values.date))) {
    errors.date = "Επίλεξε έγκυρη ημερομηνία.";
  }

  return errors;
}

export function validateProfile(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Συμπλήρωσε το όνομά σου.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Συμπλήρωσε ένα έγκυρο email.";
  }
  return errors;
}

export function validateBudget(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? ""
    : "Ο προϋπολογισμός πρέπει να είναι μεγαλύτερος από 0.";
}

export function validateBill(values) {
  const errors = {};
  const name = values.name.trim();
  const category = values.category.trim();
  const amount = Number(values.amount);
  const dueDay = Number(values.dueDay);

  if (!name) errors.name = "Συμπλήρωσε ένα όνομα.";
  if (!category) errors.category = "Επίλεξε κατηγορία.";
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Το ποσό πρέπει να είναι μεγαλύτερο από 0.";
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    errors.dueDay = "Η ημέρα πρέπει να είναι από 1 έως 31.";
  }

  return errors;
}
