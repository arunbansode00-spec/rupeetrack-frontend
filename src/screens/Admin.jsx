import { useState, useEffect } from "react";
import * as api from "../api";

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

  const CAT_COLORS = {
    Food:"#F59E0B", Travel:"#3B82F6", Shopping:"#EC4899",
    Education:"#8B5CF6", Entertainment:"#10B981", Income:"#22C55E", Others:"#94A3B8"
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:32, marginBottom:12 }}>⚙️</p>
        <p style={{ fontSize:14, color:"#64748B" }}>Loading admin data...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0F172A,#1E293B)", padding:"52px 24px 28px", borderRadius:"0 0 28px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Admin Panel</p>
            <h1 style={{ color:"#fff", fontSize:22, fontWeight:700 }}>RupeeTrack HQ 🛡️</h1>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>Welcome, {user?.name}</p>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:10, color:"#fff", padding:"8px 14px", fontSize:12, fontFamily:"'Poppins',sans-serif" }}>Logout</button>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display:"flex", gap:10 }}>
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

        {/* Tab bar */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.08)", borderRadius:14, padding:4, gap:4, marginTop:16 }}>
          {[{ id:"overview", label:"👥 Users" },{ id:"transactions", label:"💸 All Txns" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"9px", background: tab===t.id ? "#fff" : "transparent", border:"none", borderRadius:10, color: tab===t.id ? "#0F172A" : "rgba(255,255,255,0.7)", fontSize:12, fontWeight:700, transition:"all 0.2s", fontFamily:"'Poppins',sans-serif" }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"20px 20px 0" }}>

        {/* Users tab */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>{users.length} registered users</p>
            {users.map(u => {
              // FIX: this now works correctly because /stats returns user_id in expenses
              const userExp = expenses.filter(e => e.user_id === u.id);
              const spent   = userExp.filter(e => e.type==="expense").reduce((s,e)=>s+Number(e.amount),0);
              return (
                <div key={u.id} onClick={() => viewUser(u)}
                  style={{ background:"#fff", borderRadius:18, padding:"14px 16px", border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", cursor:"pointer", transition:"all 0.2s" }}
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

        {/* All transactions tab */}
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

        {/* User detail tab */}
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
                  { label:"Total Spent",  value:`₹${userExps.filter(e=>e.type==="expense").reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}`, color:"#EF4444", bg:"#FEF2F2" },
                  { label:"Income",       value:`₹${userExps.filter(e=>e.type==="income").reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}`,  color:"#22C55E", bg:"#F0FDF4" },
                  { label:"Transactions", value: userExps.length, color:"#4F46E5", bg:"#EEF2FF" },
                ].map(s => (
                  <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.value}</p>
                    <p style={{ fontSize:9, color:"#64748B", marginTop:2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
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