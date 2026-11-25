function dateInCurrentMonth(day) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate()));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateInPreviousMonth(day) {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
  const date = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), Math.min(day, lastDay));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function createDemoExpenses() {
  return [
    { id: "demo-expense-rent", description: "Ενοίκιο", amount: 350, category: "Σπίτι", date: dateInCurrentMonth(1) },
    { id: "demo-expense-coffee", description: "Καφές στη σχολή", amount: 3.2, category: "Φαγητό", date: dateInCurrentMonth(2) },
    { id: "demo-expense-oasa", description: "Εισιτήρια ΟΑΣΑ", amount: 5.4, category: "Μεταφορά", date: dateInCurrentMonth(4) },
    { id: "demo-expense-groceries", description: "Ψώνια supermarket", amount: 28.75, category: "Σπίτι", date: dateInCurrentMonth(7) },
    { id: "demo-expense-lunch", description: "Μεσημεριανό", amount: 9.8, category: "Φαγητό", date: dateInCurrentMonth(10) },
    { id: "demo-expense-books", description: "Σημειώσεις και τετράδιο", amount: 12.5, category: "Σπουδές", date: dateInCurrentMonth(13) },
    { id: "demo-expense-movie", description: "Σινεμά με φίλους", amount: 8, category: "Ψυχαγωγία", date: dateInCurrentMonth(17) },
    { id: "demo-expense-wolt", description: "Βραδινό από Wolt", amount: 14.6, category: "Φαγητό", date: dateInCurrentMonth(21) },
    { id: "demo-expense-prev-groceries", description: "Ψώνια supermarket", amount: 34.8, category: "Σπίτι", date: dateInPreviousMonth(5) },
    { id: "demo-expense-prev-delivery", description: "Παραγγελία με φίλους", amount: 18.5, category: "Φαγητό", date: dateInPreviousMonth(12) },
    { id: "demo-expense-prev-transit", description: "Κάρτα μετακινήσεων", amount: 13.5, category: "Μεταφορά", date: dateInPreviousMonth(20) },
  ];
}

export function createDemoIncomes() {
  return [
    { id: "demo-income-allowance", description: "Χαρτζιλίκι", amount: 350, source: "Χαρτζιλίκι", date: dateInCurrentMonth(1) },
    { id: "demo-income-part-time", description: "Part-time εργασία", amount: 280, source: "Δουλειά", date: dateInCurrentMonth(15) },
  ];
}

export const demoGoals = [
  { id: "demo-goal-trip", name: "Ταξίδι", target: 300, saved: 120 },
  { id: "demo-goal-emergency", name: "Έκτακτα", target: 150, saved: 80 },
];

export const demoBills = [
  { id: "demo-bill-rent", name: "Ενοίκιο", amount: 350, dueDay: 1, category: "Σπίτι", paidMonth: null, paidExpenseId: null },
  { id: "demo-bill-spotify", name: "Spotify Student", amount: 5.49, dueDay: 15, category: "Συνδρομές", paidMonth: null, paidExpenseId: null },
  { id: "demo-bill-icloud", name: "iCloud+", amount: 0.99, dueDay: 20, category: "Συνδρομές", paidMonth: null, paidExpenseId: null },
  { id: "demo-bill-phone", name: "Κινητή/Internet", amount: 24.9, dueDay: 5, category: "Λογαριασμοί", paidMonth: null, paidExpenseId: null },
  { id: "demo-bill-gym", name: "Γυμναστήριο", amount: 29, dueDay: 10, category: "Υγεία", paidMonth: null, paidExpenseId: null },
];
