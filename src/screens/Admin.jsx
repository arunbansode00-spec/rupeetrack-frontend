import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import * as api from "../api";

const CAT_COLORS = {
  Food:"#F59E0B", Travel:"#3B82F6", Shopping:"#EC4899",
  Education:"#8B5CF6", Entertainment:"#10B981", Income:"#22C55E", Others:"#94A3B8"
};

export default function Admin({ user, onNavigate, onLogout }) {
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tab,      setTab]      = useState("overview");
  const [selUser,  setSelUser]  = useState(null);
  const [userExps, setUserExps] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.adminGetStats().catch(() => ({ totalUsers:0, totalTransactions:0, totalExpenses:0 })),
      api.adminGetUsers().catch(() => []),
      api.adminGetExpenses().catch(() => []),
    ]).then(([s, u, e]) => { setStats(s); setUsers(u); setExpenses(e); })
      .finally(() => setLoading(false));
  }, []);

  const viewUser = async (u) => {
    setSelUser(u);
    const exps = await api.adminGetUserExp(u.id).catch(() => []);
    setUserExps(exps);
    setTab("userDetail");
  };

  // Chart data — spending by category across all users
  const catMap = {};
  expenses.filter(e => e.type === "expense").forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });
  const categoryData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Chart data — spending per user
  const userSpendMap = {};
  expenses.filter(e => e.type === "expense").forEach(e => {
    const u = users.find(u => u.id === e.user_id);
    const name = u?.name || "Unknown";
    userSpendMap[name] = (userSpendMap[name] || 0) + Number(e.amount);
  });
  const userSpendData = Object.entries(userSpendMap)
    .map(([name, amount]) => ({ name: name.split(" ")[0], amount }))
    .sort((a, b) => b.amount - a.amount);

  // Chart data — daily spending trend (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { weekday:"short" });
    const total = expenses
      .filter(e => e.type === "expense" && e.date === key)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { day: label, amount: total };
  });

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:32, marginBottom:12 }}>⚙️</p>
        <p style={{ fontSize:14, color:"#64748B" }}>Loading admin data...</p>
      </div>
    </div>
  );

  const totalSpent = expenses.filter(e => e.type==="expense").reduce((s,e)=>s+Number(e.amount),0);

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0F172A,#1E293B)", padding:"52px 24px 28px", borderRadius:"0 0 28px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Admin Panel</p>
            <h1 style={{ color:"#fff", fontSize:22, fontWeight:700 }}>RupeeTrack HQ 🛡️</h1>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginTop:2 }}>Welcome, {user?.name}</p>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:10, color:"#fff", padding:"8px 14px", fontSize:12, fontFamily:"'Poppins',sans-serif" }}>Logout</button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {[
              { label:"Users",        value: stats.totalUsers,        color:"#818CF8" },
              { label:"Transactions", value: stats.totalTransactions, color:"#34D399" },
              { label:"Total Spent",  value:`₹${Number(stats.totalExpenses).toLocaleString("en-IN")}`, color:"#F87171" },
            ].map(s => (
              <div key={s.label} style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 10px", border:"1px solid rgba(255,255,255,0.1)", textAlign:"center" }}>
                <p style={{ color:s.color, fontSize:s.label==="Total Spent"?12:18, fontWeight:700 }}>{s.value}</p>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.08)", borderRadius:14, padding:4, gap:4, overflowX:"auto" }}>
          {[
            { id:"overview",     label:"👥 Users"    },
            { id:"charts",       label:"📊 Charts"   },
            { id:"transactions", label:"💸 Txns"     },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:"9px 4px", minWidth:70,
              background: tab===t.id ? "#fff" : "transparent",
              border:"none", borderRadius:10,
              color: tab===t.id ? "#0F172A" : "rgba(255,255,255,0.7)",
              fontSize:11, fontWeight:700, transition:"all 0.2s",
              fontFamily:"'Poppins',sans-serif", whiteSpace:"nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>

        {/* ── USERS TAB ── */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>{users.length} registered users</p>
            {users.map(u => {
              const userExp = expenses.filter(e => e.user_id === u.id);
              const spent   = userExp.filter(e => e.type==="expense").reduce((s,e)=>s+Number(e.amount),0);
              const pct     = totalSpent > 0 ? Math.round((spent/totalSpent)*100) : 0;
              return (
                <div key={u.id} onClick={() => viewUser(u)} style={{ background:"#fff", borderRadius:18, padding:"14px 16px", border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:44, height:44, background:"linear-gradient(135deg,#4F46E5,#6366F1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:700, flexShrink:0 }}>
                      {(u.name||u.email||"?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <p style={{ fontSize:13, fontWeight:700 }}>{u.name || "No name"}</p>
                        {u.is_admin && <span style={{ background:"#EEF2FF", color:"#4F46E5", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6 }}>ADMIN</span>}
                      </div>
                      <p style={{ fontSize:11, color:"#94A3B8", marginTop:1 }}>{u.email}</p>
                      {/* Mini progress bar */}
                      <div style={{ height:4, background:"#F1F5F9", borderRadius:2, marginTop:6, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#4F46E5,#6366F1)", borderRadius:2 }} />
                      </div>
                      <p style={{ fontSize:10, color:"#94A3B8", marginTop:3 }}>{pct}% of total platform spending</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#EF4444" }}>₹{spent.toLocaleString("en-IN")}</p>
                      <p style={{ fontSize:10, color:"#94A3B8" }}>{userExp.length} txns</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CHARTS TAB ── */}
        {tab === "charts" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:20 }}>

            {/* Daily trend */}
            <div style={{ background:"#fff", borderRadius:20, padding:"18px", border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Platform Spending — Last 7 Days</h3>
              <p style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>Total across all users</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Spent"]} contentStyle={{ borderRadius:10, border:"1px solid #E2E8F0", fontSize:12 }} />
                  <Bar dataKey="amount" radius={[8,8,0,0]} fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Spending by user */}
            {userSpendData.length > 0 && (
              <div style={{ background:"#fff", borderRadius:20, padding:"18px", border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Spending by User</h3>
                <p style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>Who's spending the most</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={userSpendData} barSize={28} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Spent"]} contentStyle={{ borderRadius:10, border:"1px solid #E2E8F0", fontSize:12 }} />
                    <Bar dataKey="amount" radius={[0,8,8,0]} fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category pie */}
            {categoryData.length > 0 && (
              <div style={{ background:"#fff", borderRadius:20, padding:"18px", border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Spending by Category</h3>
                <p style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>Platform-wide breakdown</p>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                        {categoryData.map(entry => <Cell key={entry.name} fill={CAT_COLORS[entry.name]||"#94A3B8"} />)}
                      </Pie>
                      <Tooltip formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                    {categoryData.map(item => (
                      <div key={item.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:CAT_COLORS[item.name]||"#94A3B8", flexShrink:0 }} />
                        <span style={{ fontSize:11, color:"#374151", flex:1 }}>{item.name}</span>
                        <span style={{ fontSize:11, fontWeight:600 }}>₹{Number(item.value).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div style={{ display:"flex", gap:12 }}>
              {[
                { label:"Avg per user",  value:`₹${users.length > 0 ? Math.round(totalSpent/users.length).toLocaleString("en-IN") : 0}`, color:"#4F46E5", bg:"#EEF2FF" },
                { label:"Top category",  value: categoryData[0]?.name || "—",  color:"#F59E0B", bg:"#FEF3C7" },
              ].map(s => (
                <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:16, padding:"14px", textAlign:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</p>
                  <p style={{ fontSize:11, color:"#64748B", marginTop:4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {tab === "transactions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>{expenses.length} total transactions</p>
            {expenses.slice(0, 50).map(tx => (
              <div key={tx.id} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, border:"1px solid #F1F5F9" }}>
                <div style={{ width:40, height:40, background:`${CAT_COLORS[tx.category]||"#94A3B8"}20`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{tx.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.label}</p>
                  <p style={{ fontSize:11, color:"#94A3B8", marginTop:1 }}>{tx.profiles?.name || "Unknown"} · {tx.date}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:700, color: tx.type==="income"?"#22C55E":"#EF4444", flexShrink:0 }}>
                  {tx.type==="income"?"+":"−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── USER DETAIL TAB ── */}
        {tab === "userDetail" && selUser && (
          <div>
            <button onClick={() => setTab("overview")} style={{ background:"#EEF2FF", border:"none", borderRadius:10, color:"#4F46E5", padding:"8px 14px", fontSize:12, fontWeight:600, marginBottom:16, fontFamily:"'Poppins',sans-serif" }}>← Back to users</button>
            <div style={{ background:"#fff", borderRadius:18, padding:"16px", border:"1px solid #F1F5F9", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:52, height:52, background:"linear-gradient(135deg,#4F46E5,#6366F1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:22, fontWeight:700 }}>
                  {(selUser.name||selUser.email||"?")[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:700 }}>{selUser.name||"No name"}</p>
                  <p style={{ fontSize:12, color:"#94A3B8" }}>{selUser.email}</p>
                  <p style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Joined {new Date(selUser.created_at).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { label:"Spent",  value:`₹${userExps.filter(e=>e.type==="expense").reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}`, color:"#EF4444", bg:"#FEF2F2" },
                  { label:"Income", value:`₹${userExps.filter(e=>e.type==="income").reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}`,  color:"#22C55E", bg:"#F0FDF4" },
                  { label:"Txns",   value: userExps.length, color:"#4F46E5", bg:"#EEF2FF" },
                ].map(s => (
                  <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.value}</p>
                    <p style={{ fontSize:9, color:"#64748B", marginTop:2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* User category breakdown */}
            {userExps.filter(e=>e.type==="expense").length > 0 && (() => {
              const uCatMap = {};
              userExps.filter(e=>e.type==="expense").forEach(e => { uCatMap[e.category]=(uCatMap[e.category]||0)+Number(e.amount); });
              const uCatData = Object.entries(uCatMap).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
              const uTotal   = uCatData.reduce((s,e)=>s+e.value,0);
              return (
                <div style={{ background:"#fff", borderRadius:16, padding:"14px", border:"1px solid #F1F5F9", marginBottom:16 }}>
                  <h3 style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Category Breakdown</h3>
                  {uCatData.map(item => (
                    <div key={item.name} style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:12, color:"#374151" }}>{item.name}</span>
                        <span style={{ fontSize:12, fontWeight:600 }}>₹{item.value.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height:5, background:"#F1F5F9", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.round((item.value/uTotal)*100)}%`, background:CAT_COLORS[item.name]||"#94A3B8", borderRadius:3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Transactions</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10, paddingBottom:20 }}>
              {userExps.length === 0 ? (
                <p style={{ textAlign:"center", color:"#94A3B8", fontSize:13, padding:20 }}>No transactions yet</p>
              ) : userExps.map(tx => (
                <div key={tx.id} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, border:"1px solid #F1F5F9" }}>
                  <div style={{ width:40, height:40, background:`${CAT_COLORS[tx.category]||"#94A3B8"}20`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{tx.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.label}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", marginTop:1 }}>{tx.category} · {tx.date}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color: tx.type==="income"?"#22C55E":"#EF4444", flexShrink:0 }}>
                    {tx.type==="income"?"+":"−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}