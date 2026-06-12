import { useState } from "react";

const CAT_BUDGETS_DEFAULT = { Food:2000, Travel:2000, Shopping:2000, Education:3000, Entertainment:1000 };
const CAT_EMOJIS  = { Food:"🍔", Travel:"🚌", Shopping:"🛍️", Education:"📚", Entertainment:"🎮" };
const CAT_COLORS  = { Food:"#F59E0B", Travel:"#3B82F6", Shopping:"#EC4899", Education:"#8B5CF6", Entertainment:"#10B981" };

export default function Budget({ expenses, budget, setBudget }) {
  const [editing,    setEditing]    = useState(false);
  const [newBudget,  setNewBudget]  = useState(String(budget));
  const [catBudgets, setCatBudgets] = useState(CAT_BUDGETS_DEFAULT);
  const [editingCat, setEditingCat] = useState(null);
  const [catInput,   setCatInput]   = useState("");

  const expenseOnly = expenses.filter(e => e.type==="expense");
  const totalSpent  = expenseOnly.reduce((s,e) => s+e.amount, 0);
  const remaining   = budget - totalSpent;
  const pct         = budget > 0 ? Math.min((totalSpent/budget)*100, 100) : 0;
  const isOver      = totalSpent > budget;

  const catSpending = {};
  expenseOnly.forEach(e => { catSpending[e.category] = (catSpending[e.category]||0)+e.amount; });

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <div className="animate-fadeInDown" style={{
        background: isOver ? "linear-gradient(135deg,#DC2626,#EF4444)" : "linear-gradient(135deg,#4338CA,#6366F1)",
        padding:"52px 24px 28px", borderRadius:"0 0 28px 28px", transition:"background 0.4s",
      }}>
        <h1 style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:4 }}>Budget</h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>June 2025</p>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"18px 20px", marginTop:20, border:"1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginBottom:4 }}>Monthly Budget</p>
              {editing ? (
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ color:"#fff", fontSize:20, fontWeight:700 }}>₹</span>
                  <input type="number" value={newBudget} onChange={e => setNewBudget(e.target.value)}
                    style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", borderRadius:8, color:"#fff", fontSize:22, fontWeight:700, width:120, padding:"4px 8px", outline:"none", fontFamily:"'Poppins',sans-serif" }}
                    autoFocus />
                </div>
              ) : (
                <p style={{ color:"#fff", fontSize:28, fontWeight:700 }}>₹{budget.toLocaleString("en-IN")}</p>
              )}
            </div>
            {editing ? (
              <button onClick={() => { if(Number(newBudget)>0) setBudget(Number(newBudget)); setEditing(false); }} style={{ background:"#22C55E", border:"none", borderRadius:10, color:"#fff", padding:"8px 14px", fontSize:12, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>Save ✓</button>
            ) : (
              <button onClick={() => { setEditing(true); setNewBudget(String(budget)); }} style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, color:"#fff", padding:"8px 14px", fontSize:12, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>Edit ✏️</button>
            )}
          </div>
          <div style={{ height:10, background:"rgba(255,255,255,0.2)", borderRadius:5, overflow:"hidden", marginBottom:8 }}>
            <div className="progress-bar" style={{ height:"100%", width:`${pct}%`, background: isOver?"#FCA5A5":"#fff", borderRadius:5 }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>₹{totalSpent.toLocaleString("en-IN")} spent</p>
            <p style={{ color: isOver?"#FCA5A5":"#86EFAC", fontSize:12, fontWeight:600 }}>
              {isOver ? `⚠️ Over by ₹${(totalSpent-budget).toLocaleString("en-IN")}` : `₹${remaining.toLocaleString("en-IN")} left`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        {isOver && (
          <div className="animate-scaleIn" style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:16, padding:"14px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:24 }}>🚨</span>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#DC2626", marginBottom:2 }}>Budget Exceeded!</p>
              <p style={{ fontSize:12, color:"#EF4444" }}>You've spent ₹{(totalSpent-budget).toLocaleString("en-IN")} more than your budget.</p>
            </div>
          </div>
        )}
        {pct >= 80 && !isOver && (
          <div className="animate-scaleIn" style={{ background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:16, padding:"14px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:24 }}>⚠️</span>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#D97706", marginBottom:2 }}>Almost at limit!</p>
              <p style={{ fontSize:12, color:"#F59E0B" }}>{Math.round(100-pct)}% of budget remaining. Spend carefully!</p>
            </div>
          </div>
        )}

        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Category Budgets</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {Object.entries(catBudgets).map(([cat, catBudget]) => {
            const spent   = catSpending[cat] || 0;
            const catPct  = catBudget > 0 ? Math.min((spent/catBudget)*100, 100) : 0;
            const catOver = spent > catBudget;
            const color   = CAT_COLORS[cat] || "#94A3B8";
            const isEditingThis = editingCat === cat;
            return (
              <div key={cat} className="card-hover" style={{ background:"#fff", borderRadius:18, padding:"14px 16px", border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:40, height:40, background:`${color}20`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                    {CAT_EMOJIS[cat]}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{cat}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", marginTop:1 }}>₹{spent.toLocaleString("en-IN")} spent</p>
                  </div>
                  {isEditingThis ? (
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ fontSize:12, color:"#64748B" }}>₹</span>
                      <input type="number" value={catInput} onChange={e => setCatInput(e.target.value)}
                        style={{ width:80, padding:"4px 8px", border:"1.5px solid #4F46E5", borderRadius:8, fontSize:12, outline:"none", fontFamily:"'Poppins',sans-serif" }} autoFocus />
                      <button onClick={() => { if(Number(catInput)>0) setCatBudgets(prev=>({...prev,[cat]:Number(catInput)})); setEditingCat(null); }}
                        style={{ background:"#22C55E", border:"none", borderRadius:7, color:"#fff", padding:"4px 8px", fontSize:11, fontWeight:600 }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <p style={{ fontSize:13, fontWeight:700, color: catOver?"#EF4444":"#0F172A" }}>₹{catBudget.toLocaleString("en-IN")}</p>
                      <button onClick={() => { setEditingCat(cat); setCatInput(String(catBudget)); }}
                        style={{ background:"#F1F5F9", border:"none", borderRadius:7, color:"#64748B", padding:"4px 8px", fontSize:11 }}>✏️</button>
                    </div>
                  )}
                </div>
                <div style={{ height:6, background:"#F1F5F9", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${catPct}%`, background: catOver?"#EF4444":catPct>=80?"#F59E0B":color, borderRadius:3, transition:"width 0.4s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <span style={{ fontSize:10, color:"#94A3B8" }}>{Math.round(catPct)}% used</span>
                  <span style={{ fontSize:10, fontWeight:600, color: catOver?"#EF4444":"#22C55E" }}>
                    {catOver ? `Over ₹${(spent-catBudget).toLocaleString("en-IN")}` : `₹${(catBudget-spent).toLocaleString("en-IN")} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
