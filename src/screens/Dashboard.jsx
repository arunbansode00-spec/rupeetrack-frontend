import { useState, useEffect } from "react";

const CAT_COLORS = {
  Food:          { bg:"#FEF3C7", text:"#D97706" },
  Travel:        { bg:"#DBEAFE", text:"#2563EB" },
  Shopping:      { bg:"#FCE7F3", text:"#DB2777" },
  Education:     { bg:"#EDE9FE", text:"#7C3AED" },
  Entertainment: { bg:"#D1FAE5", text:"#059669" },
  Income:        { bg:"#DCFCE7", text:"#16A34A" },
  Others:        { bg:"#F1F5F9", text:"#64748B" },
};

function formatDate(ds) {
  const today = new Date(), yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const d = new Date(ds);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function SkeletonCard() {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:"12px 14px", border:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:12 }}>
      <div className="skeleton" style={{ width:44, height:44, borderRadius:14 }} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div className="skeleton" style={{ height:12, width:"60%", borderRadius:6 }} />
        <div className="skeleton" style={{ height:10, width:"40%", borderRadius:6 }} />
      </div>
      <div className="skeleton" style={{ height:14, width:60, borderRadius:6 }} />
    </div>
  );
}

export default function Dashboard({ expenses = [], budget = 10000, user, onNavigate }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const income  = expenses.filter(e => e.type === "income") .reduce((s, e) => s + Number(e.amount), 0);
  const spent   = expenses.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const balance = income - spent;
  const pct     = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const animBal   = useCountUp(loading ? 0 : Math.abs(balance), 1000);
  const animInc   = useCountUp(loading ? 0 : income,  900);
  const animSpent = useCountUp(loading ? 0 : spent,   900);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ paddingBottom:16 }}>
      <div className="animate-fadeInDown" style={{ background:"linear-gradient(135deg,#4338CA 0%,#6366F1 100%)", padding:"52px 24px 28px", borderRadius:"0 0 28px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>{getGreeting()}</p>
            <h2 style={{ color:"#fff", fontSize:22, fontWeight:700, marginTop:2 }}>Hi {user?.name} 👋</h2>
          </div>
          <div onClick={() => onNavigate("profile")} style={{ width:44, height:44, background:"rgba(255,255,255,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:700, border:"2px solid rgba(255,255,255,0.3)", cursor:"pointer" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
        <div className="animate-scaleIn" style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"18px 20px", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12, marginBottom:4 }}>Total Balance</p>
          <p style={{ color:"#fff", fontSize:32, fontWeight:700, letterSpacing:"-1px" }}>{balance < 0 ? "−" : ""}₹{animBal.toLocaleString("en-IN")}</p>
          <div style={{ display:"flex", gap:12, marginTop:16 }}>
            {[{ label:"Income", value:animInc, icon:"📈" },{ label:"Expenses", value:animSpent, icon:"📉" }].map(item => (
              <div key={item.label} style={{ flex:1, background:"rgba(255,255,255,0.12)", borderRadius:14, padding:"12px 14px", border:"1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  <span style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>{item.label}</span>
                </div>
                <p style={{ color:"#fff", fontSize:16, fontWeight:700 }}>₹{item.value.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        <div className="animate-fadeInUp card-hover" style={{ background:"#fff", borderRadius:16, padding:"14px 16px", marginBottom:20, border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:600 }}>Monthly Budget</span>
            <span style={{ fontSize:12, color: spent > budget ? "#EF4444" : "#4F46E5", fontWeight:600 }}>₹{spent.toLocaleString("en-IN")} / ₹{budget.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ height:8, background:"#F1F5F9", borderRadius:4, overflow:"hidden" }}>
            <div className="progress-bar" style={{ height:"100%", width:`${pct}%`, background: spent > budget ? "linear-gradient(90deg,#EF4444,#F87171)" : "linear-gradient(90deg,#4F46E5,#818CF8)", borderRadius:4 }} />
          </div>
          <p style={{ fontSize:11, color:"#94A3B8", marginTop:6 }}>
            {Math.round(pct)}% used this month
            {spent > budget * 0.8 && spent <= budget && " ⚠️ Almost at limit!"}
            {spent > budget && " 🚨 Over budget!"}
          </p>
        </div>

        <div className="stagger" style={{ display:"flex", gap:12, marginBottom:24 }}>
          {[
            { label:"Add Expense", emoji:"➕", screen:"add",       bg:"linear-gradient(135deg,#4F46E5,#6366F1)", color:"#fff",   shadow:"0 4px 16px rgba(79,70,229,0.35)" },
            { label:"Analytics",   emoji:"📊", screen:"analytics", bg:"#EEF2FF", color:"#4F46E5", shadow:"none" },
            { label:"Budget",      emoji:"🎯", screen:"budget",    bg:"#EEF2FF", color:"#4F46E5", shadow:"none" },
          ].map(item => (
            <button key={item.label} onClick={() => onNavigate(item.screen)} className="animate-fadeInUp btn-press"
              style={{ flex:1, padding:"12px 8px", background:item.bg, border:"none", borderRadius:14, color:item.color, fontSize:11, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:6, boxShadow:item.shadow }}>
              <span style={{ fontSize:22 }}>{item.emoji}</span>{item.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:16, fontWeight:700 }}>Recent Transactions</h3>
          <span style={{ fontSize:12, color:"#4F46E5", fontWeight:600, cursor:"pointer" }}>See all</span>
        </div>

        {expenses.length === 0 && !loading ? (
          <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", borderRadius:20, border:"1px solid #F1F5F9" }}>
            <p style={{ fontSize:36, marginBottom:12 }}>💸</p>
            <p style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:6 }}>No transactions yet</p>
            <p style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>Tap + to add your first expense</p>
            <button onClick={() => onNavigate("add")} style={{ background:"linear-gradient(135deg,#4F46E5,#6366F1)", border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", fontSize:13, fontWeight:600 }}>Add Expense</button>
          </div>
        ) : (
          <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {loading ? [1,2,3].map(i => <SkeletonCard key={i} />) : expenses.slice(0, 8).map((tx) => {
              const colors = CAT_COLORS[tx.category] || CAT_COLORS.Others;
              return (
                <div key={tx.id} className="animate-fadeInUp card-hover" style={{ background:"#fff", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ width:44, height:44, background:colors.bg, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{tx.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.label}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color: tx.type==="income" ? "#22C55E" : "#EF4444", flexShrink:0 }}>
                    {tx.type==="income" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={() => onNavigate("add")} className="fab" style={{ position:"fixed", bottom:84, right:"max(20px, calc(50vw - 195px + 20px))", width:56, height:56, background:"linear-gradient(135deg,#4F46E5,#6366F1)", border:"none", borderRadius:"50%", color:"#fff", fontSize:28, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(79,70,229,0.45)", zIndex:50 }}>+</button>
    </div>
  );
}
