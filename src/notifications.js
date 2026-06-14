// Request notification permission
export async function requestPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Send a local browser notification
export function sendNotification(title, body, icon = "/icon-192.png") {
  if (Notification.permission !== "granted") return;
  const n = new Notification(title, { body, icon, badge: icon, tag: "rupeetrack" });
  n.onclick = () => { window.focus(); n.close(); };
}

// Check budget and notify if needed
export function checkBudgetAlert(spent, budget, category = null) {
  if (Notification.permission !== "granted") return;
  const pct = (spent / budget) * 100;

  if (pct >= 100) {
    sendNotification(
      "🚨 Budget Exceeded!",
      `You've spent ₹${spent.toLocaleString("en-IN")} — ₹${(spent - budget).toLocaleString("en-IN")} over your ₹${budget.toLocaleString("en-IN")} budget!`
    );
  } else if (pct >= 90) {
    sendNotification(
      "⚠️ Almost at Budget Limit!",
      `You've used ${Math.round(pct)}% of your budget. Only ₹${(budget - spent).toLocaleString("en-IN")} left!`
    );
  } else if (pct >= 80) {
    sendNotification(
      "💸 Budget Warning",
      `You've used ${Math.round(pct)}% of your ₹${budget.toLocaleString("en-IN")} budget. Slow down!`
    );
  }
}

// Notify when a new expense is added
export function notifyExpenseAdded(label, amount, type) {
  if (Notification.permission !== "granted") return;
  if (type === "income") {
    sendNotification(
      "💰 Income Added!",
      `+₹${Number(amount).toLocaleString("en-IN")} — ${label}`
    );
  } else {
    sendNotification(
      "📝 Expense Logged",
      `-₹${Number(amount).toLocaleString("en-IN")} — ${label}`
    );
  }
}

export function getPermissionStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}