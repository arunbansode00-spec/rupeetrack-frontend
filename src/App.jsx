import { useState, useEffect } from "react";
import Onboarding from "./screens/Onboarding";
import Login      from "./screens/Login";
import Dashboard  from "./screens/Dashboard";
import AddExpense from "./screens/AddExpense";
import Analytics  from "./screens/Analytics";
import Transactions from "./screens/Transactions";
import Budget     from "./screens/Budget";
import Profile    from "./screens/Profile";
import Admin      from "./screens/Admin";
import BottomNav  from "./components/BottomNav";
import * as api   from "./api";
import {
  requestPermission,
  checkBudgetAlert,
  notifyExpenseAdded,
} from "./notifications";

export default function App() {
  const [screen,        setScreen]   = useState("onboarding");
  const [user,          setUser]     = useState(null);
  const [expenses,      setExpenses] = useState([]);
  const [budget,        setBudgetVal]= useState(10000);
  const [loading,       setLoading]  = useState(false);
  const [installPrompt, setInstall]  = useState(null);
  const [showInstall,   setShowInst] = useState(false);
  const [editingTx,     setEditingTx]= useState(null);

  useEffect(() => {
    const token = localStorage.getItem("rt_token");
    const saved = localStorage.getItem("rt_user");
    if (token && saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setScreen(parsedUser.is_admin ? "admin" : "dashboard");
      } catch {
        localStorage.removeItem("rt_token");
        localStorage.removeItem("rt_user");
        setScreen("onboarding");
      }
    }
  }, []);

  useEffect(() => {
    if (!user || user.is_admin) return;
    setLoading(true);
    Promise.all([api.getExpenses(), api.getBudget()])
      .then(([exps, bud]) => {
        setExpenses(exps);
        setBudgetVal(bud.monthly_budget);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Request notification permission after login
  useEffect(() => {
    if (user && !user.is_admin) {
      requestPermission();
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstall(e); setShowInst(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleLogin = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem("rt_token", data.token);
    localStorage.setItem("rt_user",  JSON.stringify(data.user));
    setUser(data.user);
    setScreen(data.user.is_admin ? "admin" : "dashboard");
  };

  const handleSignup = async (name, email, password) => {
    const data = await api.signup(name, email, password);
    localStorage.setItem("rt_token", data.token);
    localStorage.setItem("rt_user",  JSON.stringify(data.user));
    setUser(data.user);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("rt_token");
    localStorage.removeItem("rt_user");
    setUser(null);
    setExpenses([]);
    setScreen("onboarding");
  };

  const handleAddExpense = async (entry) => {
    const saved = await api.addExpense(entry);
    const newExpenses = [saved, ...expenses];
    setExpenses(newExpenses);

    // Notify expense added
    notifyExpenseAdded(entry.label || entry.category, entry.amount, entry.type);

    // Check budget after adding expense
    if (entry.type === "expense") {
      const newSpent = newExpenses
        .filter(e => e.type === "expense")
        .reduce((s, e) => s + Number(e.amount), 0);
      checkBudgetAlert(newSpent, budget);
    }
  };

  const handleEditExpense = async (entry) => {
    await api.deleteExpense(entry.id);
    const saved = await api.addExpense(entry);
    setExpenses((prev) => [saved, ...prev.filter(e => e.id !== entry.id)]);
  };

  const handleDeleteExpense = async (id) => {
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter(e => e.id !== id));
  };

  const handleSetBudget = async (amount) => {
    await api.setBudget(amount);
    setBudgetVal(amount);
  };

  const handleInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => { setInstall(null); setShowInst(false); });
  };

  const showNav = !["onboarding","login","admin"].includes(screen);

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <div style={{ flex:1, overflowY:"auto", paddingBottom: showNav ? 72 : 0 }}>
        {screen === "onboarding" && <Onboarding onNavigate={setScreen} />}
        {screen === "login"      && <Login      onLogin={handleLogin} onSignup={handleSignup} onNavigate={setScreen} />}
        {screen === "dashboard"  && (
          <Dashboard
            expenses={expenses}
            budget={budget}
            user={user}
            loading={loading}
            onNavigate={setScreen}
            onDelete={handleDeleteExpense}
            onEdit={(tx) => setEditingTx(tx)}
          />
        )}
        {screen === "add" && (
          <AddExpense
            onSave={editingTx ? handleEditExpense : handleAddExpense}
            onNavigate={setScreen}
            editingTx={editingTx}
            onClearEdit={() => setEditingTx(null)}
          />
        )}
       {screen === "transactions" && (
      <Transactions
        expenses={expenses}
        onNavigate={setScreen}
        onDelete={handleDeleteExpense}
        onEdit={(tx) => setEditingTx(tx)}
      />
        )}
        {screen === "analytics"  && <Analytics  expenses={expenses} budget={budget} />}
        {screen === "budget"     && <Budget      expenses={expenses} budget={budget} setBudget={handleSetBudget} />}
        {screen === "profile"    && <Profile     user={user} budget={budget} setBudget={handleSetBudget} onNavigate={setScreen} onLogout={handleLogout} />}
        {screen === "admin"      && <Admin       user={user} onNavigate={setScreen} onLogout={handleLogout} />}
      </div>

      {showNav && <BottomNav current={screen} onNavigate={setScreen} />}

      {showInstall && (
        <div style={{ position:"fixed", bottom:80, left:16, right:16, maxWidth:358, margin:"0 auto", background:"linear-gradient(135deg,#4338CA,#6366F1)", borderRadius:20, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(79,70,229,0.4)", zIndex:300 }}>
          <span style={{ fontSize:28 }}>📲</span>
          <div style={{ flex:1 }}>
            <p style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Install RupeeTrack</p>
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>Add to home screen</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <button onClick={handleInstall} style={{ background:"#fff", border:"none", borderRadius:10, color:"#4F46E5", fontSize:11, fontWeight:700, padding:"6px 12px", fontFamily:"'Poppins',sans-serif" }}>Install</button>
            <button onClick={() => setShowInst(false)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, color:"#fff", fontSize:11, padding:"6px 12px", fontFamily:"'Poppins',sans-serif" }}>Later</button>
          </div>
        </div>
      )}
    </div>
  );
}