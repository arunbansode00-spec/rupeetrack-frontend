const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() { return localStorage.getItem("rt_token"); }

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const signup  = (name, email, password) => request("/auth/signup", { method:"POST", body: JSON.stringify({ name, email, password }) });
export const login   = (email, password)        => request("/auth/login",  { method:"POST", body: JSON.stringify({ email, password }) });

// FIX: added getProfile so App.jsx can refresh is_admin on every load
// This prevents stale localStorage cache causing admin to be locked out
export const getProfile = () => request("/auth/profile");

export const getExpenses   = ()     => request("/expenses");
export const addExpense    = (data) => request("/expenses", { method:"POST", body: JSON.stringify(data) });
export const deleteExpense = (id)   => request(`/expenses/${id}`, { method:"DELETE" });

export const getBudget = ()       => request("/budget");
export const setBudget = (amount) => request("/budget", { method:"POST", body: JSON.stringify({ monthly_budget: amount }) });

export const adminGetStats    = ()       => request("/admin/stats");
export const adminGetUsers    = ()       => request("/admin/users");
export const adminGetExpenses = ()       => request("/admin/expenses");
export const adminGetUserExp  = (userId) => request(`/admin/users/${userId}/expenses`);