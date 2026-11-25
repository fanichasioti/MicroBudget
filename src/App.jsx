import { useEffect, useRef, useState } from "react";
import AppLayout from "./components/AppLayout.jsx";
import Bills from "./components/Bills.jsx";
import Dashboard from "./components/Dashboard.jsx";
import SignupForm from "./components/SignupForm.jsx";
import SmartDeals from "./components/SmartDeals.jsx";
import { createDemoExpenses, createDemoIncomes, demoBills, demoGoals } from "./data/demoData.js";
import useLocalStorage from "./hooks/useLocalStorage.js";

const defaultBudget = 250;

function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function upcomingBillDate(bill, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const dueDate = new Date(month.getFullYear(), month.getMonth(), Math.min(bill.dueDay, lastDay));
    if (dueDate < today || bill.paidMonth === currentMonth(dueDate)) continue;
    const daysUntil = Math.round((dueDate - today) / 86_400_000);
    return daysUntil <= 3 ? { dueDate, daysUntil } : null;
  }
  return null;
}

export default function App() {
  const [expenses, setExpenses, expensesError] = useLocalStorage("microbudget.expenses", []);
  const [budget, setBudget, budgetError] = useLocalStorage("microbudget.budget", defaultBudget);
  const [profile, setProfile, profileError] = useLocalStorage("microbudget.profile", null);
  const [bills, setBills, billsError] = useLocalStorage("microbudget.bills", []);
  const [notifications, setNotifications, notificationsError] = useLocalStorage("microbudget.notifications", []);
  const [linkedApps, setLinkedApps, linkedAppsError] = useLocalStorage("microbudget.connectedApps", []);
  const [goals, setGoals, goalsError] = useLocalStorage("microbudget.savingsGoals", []);
  const [theme, setTheme, themeError] = useLocalStorage("microbudget.theme", "light");
  const [totalSaved, setTotalSaved, totalSavedError] = useLocalStorage("microbudget.dealSavings", 0);
  const [incomes, setIncomes, incomesError] = useLocalStorage("microbudget.incomes", []);
  const [selectedMonth, setSelectedMonth, selectedMonthError] = useLocalStorage("microbudget.selectedMonth", currentMonthKey());
  const [simulatorSettings, setSimulatorSettings, simulatorError] = useLocalStorage(
    "microbudget.savingsSimulator",
    { deliveries: 1, coffees: 2 },
  );
  const [activePage, setActivePage] = useState("dashboard");
  const [editingProfile, setEditingProfile] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [browserPermission, setBrowserPermission] = useState(() => (
    "Notification" in window ? Notification.permission : "unsupported"
  ));
  const notifiedRef = useRef(new Set());

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    const storageError = expensesError || budgetError || profileError || billsError || notificationsError || linkedAppsError || goalsError || themeError || totalSavedError || incomesError || selectedMonthError || simulatorError;
    if (storageError) notify(storageError, "error");
  }, [expensesError, budgetError, profileError, billsError, notificationsError, linkedAppsError, goalsError, themeError, totalSavedError, incomesError, selectedMonthError, simulatorError]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = window.setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const safeBills = Array.isArray(bills) ? bills : [];
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    function checkDueBills() {
      const now = new Date();
      const knownIds = new Set(safeNotifications.map((item) => item.id));
      const newNotifications = [];

      safeBills.forEach((bill) => {
        const upcoming = upcomingBillDate(bill, now);
        if (!upcoming) return;
        const dueKey = localDateKey(upcoming.dueDate);
        const id = `bill:${bill.id}:${dueKey}`;
        if (knownIds.has(id) || notifiedRef.current.has(id)) return;

        const when = upcoming.daysUntil === 0
          ? "scade oggi"
          : upcoming.daysUntil === 1
            ? "λήγει αύριο"
            : `λήγει σε ${upcoming.daysUntil} ημέρες`;
        const item = {
          id,
          billId: bill.id,
          dueDate: dueKey,
          title: `Πλησιάζει η πληρωμή: ${bill.name}`,
          body: `${bill.name} ${when} (${bill.amount.toFixed(2)} €).`,
          createdAt: now.toISOString(),
          read: false,
        };
        newNotifications.push(item);
        knownIds.add(id);
        notifiedRef.current.add(id);

        if (browserPermission === "granted") {
          try {
            const browserNotification = new Notification(item.title, {
              body: item.body,
              tag: id,
            });
            browserNotification.onclick = () => window.focus();
          } catch {
            notify("Δεν ήταν δυνατή η εμφάνιση ειδοποίησης browser.", "error");
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications((current) => {
          const currentIds = new Set((Array.isArray(current) ? current : []).map((item) => item.id));
          return [
            ...newNotifications.filter((item) => !currentIds.has(item.id)),
            ...(Array.isArray(current) ? current : []),
          ];
        });
      }
    }

    checkDueBills();
    const intervalId = window.setInterval(checkDueBills, 60_000);
    return () => window.clearInterval(intervalId);
  }, [bills, notifications, browserPermission, setNotifications]);

  function saveExpense(values, id) {
    if (id) {
      setExpenses((current) => current.map((expense) => (
        expense.id === id ? { ...expense, ...values } : expense
      )));
      notify("Το έξοδο ενημερώθηκε.");
      return;
    }

    setExpenses((current) => [{ ...values, id: crypto.randomUUID() }, ...current]);
    notify("Το έξοδο προστέθηκε.");
  }

  function deleteExpense(expense) {
    if (!window.confirm(`Να διαγραφεί το έξοδο «${expense.description}»;`)) return;
    setExpenses((current) => current.filter((item) => item.id !== expense.id));
    notify("Το έξοδο διαγράφηκε.");
  }

  function saveIncome(income) {
    setIncomes((current) => [income, ...(Array.isArray(current) ? current : [])]);
    notify("Το έσοδο προστέθηκε.");
  }

  function deleteIncome(income) {
    if (!window.confirm(`Να διαγραφεί το έσοδο «${income.description}»;`)) return;
    setIncomes((current) => (Array.isArray(current)
      ? current.filter((entry) => entry.id !== income.id)
      : []));
    notify("Το έσοδο διαγράφηκε.");
  }

  function saveBudget(value) {
    setBudget(value);
    notify("Ο προϋπολογισμός ενημερώθηκε.");
  }

  function addGoal(goal) {
    setGoals((current) => [...(Array.isArray(current) ? current : []), goal]);
    notify(`Ο στόχος «${goal.name}» δημιουργήθηκε.`);
  }

  function deleteGoal(goal) {
    if (!window.confirm(`Να διαγραφεί ο στόχος «${goal.name}»;`)) return;
    setGoals((current) => (Array.isArray(current) ? current.filter((item) => item.id !== goal.id) : []));
    notify("Ο στόχος αποταμίευσης διαγράφηκε.");
  }

  function contributeToGoal(goal, amount) {
    setGoals((current) => (Array.isArray(current)
      ? current.map((item) => item.id === goal.id ? { ...item, saved: item.saved + amount } : item)
      : []));
    notify(`Προστέθηκαν ${amount.toFixed(2)} € στον στόχο «${goal.name}».`);
  }

  function recordDealSavings(deal) {
    setTotalSaved((current) => Number(current || 0) + deal.savingsAmount);
    notify(`Μπράβο! Προστέθηκαν ${deal.savingsAmount.toFixed(2)} € στην εξοικονόμησή σου.`);
  }

  function loadDemoData() {
    const sampleExpenses = createDemoExpenses();
    const sampleIncomes = createDemoIncomes();
    setExpenses((current) => {
      const byId = new Map((Array.isArray(current) ? current : []).map((expense) => [expense.id, expense]));
      sampleExpenses.forEach((expense) => byId.set(expense.id, expense));
      return [...byId.values()];
    });
    setIncomes((current) => {
      const byId = new Map((Array.isArray(current) ? current : []).map((income) => [income.id, income]));
      sampleIncomes.forEach((income) => byId.set(income.id, income));
      return [...byId.values()];
    });
    setGoals((current) => {
      const byId = new Map((Array.isArray(current) ? current : []).map((goal) => [goal.id, goal]));
      demoGoals.forEach((goal) => {
        if (!byId.has(goal.id)) byId.set(goal.id, goal);
      });
      return [...byId.values()];
    });
    setBills((current) => {
      const byId = new Map((Array.isArray(current) ? current : []).map((bill) => [bill.id, bill]));
      demoBills.forEach((bill) => {
        if (!byId.has(bill.id)) byId.set(bill.id, bill);
      });
      return [...byId.values()];
    });
    setSelectedMonth(currentMonthKey());
    notify("Τα demo έξοδα, έσοδα, πάγια και οι στόχοι προστέθηκαν χωρίς να αλλάξουν τα δικά σου δεδομένα.");
  }

  function saveBill(values) {
    if (values.id) {
      setBills((current) => current.map((bill) => (
        bill.id === values.id ? { ...bill, ...values } : bill
      )));
      const existingBill = bills.find((bill) => bill.id === values.id);
      if (existingBill?.paidMonth === currentMonth() && existingBill.paidExpenseId) {
        setExpenses((current) => current.map((expense) => (
          expense.id === existingBill.paidExpenseId
            ? { ...expense, description: values.name, amount: values.amount, category: values.category }
            : expense
        )));
      }
      notify("Το πάγιο ενημερώθηκε.");
      return;
    }
    setBills((current) => [...current, { ...values, id: crypto.randomUUID(), paidMonth: null, paidExpenseId: null }]);
    notify("Το πάγιο προστέθηκε.");
  }

  function deleteBill(bill) {
    if (!window.confirm(`Να διαγραφεί το πάγιο «${bill.name}»;`)) return;
    setBills((current) => current.filter((item) => item.id !== bill.id));
    notify("Το πάγιο διαγράφηκε.");
  }

  function toggleBillPaid(bill, isPaid) {
    const month = currentMonth();
    if (!isPaid) {
      if (bill.paidMonth === month) return;
      const expense = {
        id: crypto.randomUUID(),
        description: bill.name,
        amount: bill.amount,
        category: bill.category,
        date: localDateKey(new Date()),
        recurringBillId: bill.id,
        paidMonth: month,
      };
      setExpenses((current) => [expense, ...current]);
      setBills((current) => current.map((item) => (
        item.id === bill.id ? { ...item, paidMonth: month, paidExpenseId: expense.id } : item
      )));
      setNotifications((current) => (Array.isArray(current)
        ? current.map((item) => item.billId === bill.id ? { ...item, read: true } : item)
        : []));
      notify(`${bill.name} σημειώθηκε ως πληρωμένο και προστέθηκε στα έξοδα.`);
      return;
    }

    setBills((current) => current.map((item) => (
      item.id === bill.id ? { ...item, paidMonth: null, paidExpenseId: null } : item
    )));
    setExpenses((current) => current.filter((expense) => (
      expense.id !== bill.paidExpenseId
      && !(expense.recurringBillId === bill.id && expense.paidMonth === month)
    )));
    notify(`Η πληρωμή του ${bill.name} ακυρώθηκε.`);
  }

  function markAllNotificationsRead() {
    setNotifications((current) => (Array.isArray(current)
      ? current.map((item) => ({ ...item, read: true }))
      : []));
  }

  function markNotificationRead(id) {
    setNotifications((current) => (Array.isArray(current)
      ? current.map((item) => item.id === id ? { ...item, read: true } : item)
      : []));
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
      notify("Ο browser σου δεν υποστηρίζει ειδοποιήσεις.", "error");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      notify(
        permission === "granted"
          ? "Οι ειδοποιήσεις ενεργοποιήθηκαν."
          : "Δεν δόθηκε άδεια για ειδοποιήσεις.",
        permission === "granted" ? "success" : "error",
      );
    } catch {
      notify("Δεν ήταν δυνατή η ενεργοποίηση ειδοποιήσεων.", "error");
    }
  }

  async function testBrowserNotification() {
    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
      notify("Ο browser σου δεν υποστηρίζει ειδοποιήσεις.", "error");
      return;
    }
    try {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      setBrowserPermission(permission);
      if (permission !== "granted") {
        notify("Ενεργοποίησε πρώτα τις ειδοποιήσεις από τις ρυθμίσεις του browser.", "error");
        return;
      }
      const browserNotification = new Notification("MicroBudget — δοκιμή ειδοποίησης", {
        body: "Οι υπενθυμίσεις πληρωμών είναι έτοιμες.",
      });
      browserNotification.onclick = () => window.focus();
      notify("Η δοκιμαστική ειδοποίηση στάλθηκε.");
    } catch {
      notify("Δεν ήταν δυνατή η αποστολή δοκιμαστικής ειδοποίησης.", "error");
    }
  }

  function saveProfile(value) {
    setProfile(value);
    setEditingProfile(false);
    notify(profile ? "Το προφίλ ενημερώθηκε." : "Καλώς ήρθες στο MicroBudget!");
  }

  const firstRun = !profile?.name;
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeBills = Array.isArray(bills) ? bills : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeLinkedApps = Array.isArray(linkedApps) ? linkedApps : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeSelectedMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)
    ? selectedMonth
    : currentMonthKey();
  const safeSimulatorSettings = {
    deliveries: Number.isInteger(simulatorSettings?.deliveries)
      ? Math.min(Math.max(simulatorSettings.deliveries, 0), 5)
      : 1,
    coffees: Number.isInteger(simulatorSettings?.coffees)
      ? Math.min(Math.max(simulatorSettings.coffees, 0), 7)
      : 2,
  };
  const unreadCount = safeNotifications.filter((item) => !item.read).length;

  return (
    <>
      <AppLayout
        activePage={activePage}
        onNavigate={setActivePage}
        profile={profile ?? { name: "" }}
        onEditProfile={() => setEditingProfile(true)}
        toast={toast}
        notifications={safeNotifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllNotificationsRead}
        onMarkRead={markNotificationRead}
        theme={theme === "dark" ? "dark" : "light"}
        onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        onLoadDemo={loadDemoData}
      >
        {activePage === "dashboard" ? (
          <>
            <div className="page-intro dashboard-intro">
              <span className="eyebrow">Η μηνιαία σου εικόνα</span>
              <h1>Γεια σου, {profile?.name || "καλώς ήρθες"}</h1>
              <p>Μια πιο ξεκάθαρη εικόνα των χρημάτων σου, κάθε μέρα.</p>
            </div>
            <Dashboard
              expenses={safeExpenses}
              budget={Number.isFinite(Number(budget)) && Number(budget) > 0 ? Number(budget) : defaultBudget}
              onSaveBudget={saveBudget}
              onSaveExpense={saveExpense}
              onDeleteExpense={deleteExpense}
              onError={(message) => notify(message, "error")}
              goals={Array.isArray(goals) ? goals : []}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
              onContribute={contributeToGoal}
              onNavigate={setActivePage}
              month={safeSelectedMonth}
              onMonthChange={setSelectedMonth}
              incomes={safeIncomes}
              onSaveIncome={saveIncome}
              onDeleteIncome={deleteIncome}
              simulatorSettings={safeSimulatorSettings}
              onSimulatorChange={setSimulatorSettings}
            />
          </>
        ) : activePage === "bills" ? (
          <Bills
            bills={safeBills}
            notifications={safeNotifications}
            browserPermission={browserPermission}
            onSaveBill={saveBill}
            onDeleteBill={deleteBill}
            onTogglePaid={toggleBillPaid}
            onEnableNotifications={enableBrowserNotifications}
            onTestNotification={testBrowserNotification}
            onError={(message) => notify(message, "error")}
          />
        ) : (
          <SmartDeals
            linkedApps={safeLinkedApps}
            expenses={safeExpenses}
            totalSaved={Number.isFinite(Number(totalSaved)) ? Number(totalSaved) : 0}
            onUseDeal={recordDealSavings}
            onToggleApp={(appId) => {
              const isLinked = safeLinkedApps.includes(appId);
              setLinkedApps((current) => {
                const currentApps = Array.isArray(current) ? current : [];
                return isLinked
                  ? currentApps.filter((item) => item !== appId)
                  : [...currentApps, appId];
              });
              notify(isLinked ? "Η εφαρμογή αποσυνδέθηκε." : "Η εφαρμογή συνδέθηκε.");
            }}
            onNotify={notify}
          />
        )}
      </AppLayout>
      {(firstRun || editingProfile) && (
        <SignupForm
          key={firstRun ? "first-run" : "edit-profile"}
          profile={profile}
          firstRun={firstRun}
          onSave={saveProfile}
          onCancel={() => setEditingProfile(false)}
          onError={(message) => notify(message, "error")}
        />
      )}
    </>
  );
}
