import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const CAT_COLORS = {
  Food:"#F59E0B", Travel:"#3B82F6", Shopping:"#EC4899",
  Education:"#8B5CF6", Entertainment:"#10B981", Others:"#94A3B8",
};
const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function generateInsights(expenses, budget) {
  const expenseOnly = expenses.filter(e => e.type === "expense");
  const totalSpent  = expenseOnly.reduce((s, e) => s + e.amount, 0);
  const income      = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const insights    = [];

  const catMap = {};
  expenseOnly.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + e.amount; });
  const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]);

  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const pct = totalSpent > 0 ? Math.round((topAmt/totalSpent)*100) : 0;
    insights.push({ emoji:"🍽️", title:`${topCat} is your biggest spend`, desc:`${pct}% of your total spending goes to ${topCat.toLowerCase()}. Try setting a stricter limit.`, color:"#FEF3C7", border:"#FCD34D" });
  }

  const budgetPct = budget > 0 ? Math.round((totalSpent/budget)*100) : 0;
  if (budgetPct >= 80) {
    insights.push({ emoji:"⚠️", title:"Budget running low", desc:`You've used ${budgetPct}% of your monthly budget. Only ₹${(budget-totalSpent).toLocaleString("en-IN")} left.`, color:"#FEF2F2", border:"#FECACA" });
  } else {
    insights.push({ emoji:"✅", title:"Budget on track", desc:`Great job! You've used ${budgetPct}% of your budget with ₹${(budget-totalSpent).toLocaleString("en-IN")} remaining.`, color:"#F0FDF4", border:"#86EFAC" });
  }

  const dailyAvg = Math.round(totalSpent/30);
  insights.push({ emoji:"📅", title:`You spend ₹${dailyAvg.toLocaleString("en-IN")} per day`, desc: dailyAvg > 500 ? "That's above the ₹500/day student average. Small cuts add up fast!" : "That's within the healthy ₹500/day student average. Keep it up!", color:"#EFF6FF", border:"#BFDBFE" });

  if (income > 0) {
    const savingsRate = Math.round(((income-totalSpent)/income)*100);
    insights.push({ emoji: savingsRate >= 20 ? "🌟" : "💡", title: savingsRate >= 20 ? `Great savings rate — ${savingsRate}%!` : `Low savings rate — ${savingsRate}%`, desc: savingsRate >= 20 ? "You're saving over 20% of your income. Financial experts would approve!" : "Try to save at least 20% of your income. Cut back on discretionary spending.", color: savingsRate >= 20 ? "#F0FDF4" : "#FFF7ED", border: savingsRate >= 20 ? "#86EFAC" : "#FED7AA" });
  }

  if (expenseOnly.length > 0) {
    const biggest = expenseOnly.reduce((a,b) => a.amount>b.amount ? a : b);
    insights.push({ emoji:"💸", title:`Biggest purchase: ₹${biggest.amount.toLocaleString("en-IN")}`, desc:`"${biggest.label}" was your largest single expense. Was it necessary?`, color:"#FDF4FF", border:"#E879F9" });
  }

  insights.push({ emoji:"📌", title:"50/30/20 Rule", desc:"Spend 50% on needs, 30% on wants, and save 20%. Even small consistent savings grow fast on a student budget!", color:"#EEF2FF", border:"#C7D2FE" });

  return insights;
}

export default function Analytics({ expenses, budget }) {
  const [tab, setTab] = useState("overview");

  const expenseOnly = expenses.filter(e => e.type==="expense");
  const totalSpent  = expenseOnly.reduce((s,e) => s+e.amount, 0);
  const income      = expenses.filter(e => e.type==="income").reduce((s,e) => s+e.amount, 0);

  const catMap = {};
  expenseOnly.forEach(e => { catMap[e.category] = (catMap[e.category]||0)+e.amount; });
  const pieData = Object.entries(catMap).map(([name,value]) => ({name,value})).sort((a,b)=>b.value-a.value);

  const barData = WEEK_DAYS.map((day,i) => ({ day, amount:[120,350,450,80,250,680,199][i] }));
  const topCat  = pieData[0];
  const insights = generateInsights(expenses, budget);

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <div className="animate-fadeInDown" style={{
        background:"linear-gradient(135deg,#4338CA,#6366F1)",
        padding:"52px 24px 28px", borderRadius:"0 0 28px 28px",
      }}>
        <h1 style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:4 }}>Analytics</h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>June 2025 overview</p>
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          {[
            { label:"Total Spent", value:`₹${totalSpent.toLocaleString("en-IN")}`,                                        color:"#fff"     },
            { label:"Budget Left", value:`₹${Math.max(0,budget-totalSpent).toLocaleString("en-IN")}`,                      color: budget-totalSpent<0?"#FCA5A5":"#86EFAC" },
            { label:"Saved",       value:`₹${Math.max(0,income-totalSpent).toLocaleString("en-IN")}`,                      color:"#86EFAC"  },
          ].map(s => (
            <div key={s.label} style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:16, padding:"14px 10px", border:"1px solid rgba(255,255,255,0.2)", textAlign:"center" }}>
              <p style={{ color:s.color, fontSize:15, fontWeight:700 }}>{s.value}</p>
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:10, marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.15)", borderRadius:14, padding:4, gap:4, marginTop:20 }}>
          {["overview","insights"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"10px",
              background: tab===t ? "#fff" : "transparent", border:"none", borderRadius:10,
              color: tab===t ? "#4F46E5" : "rgba(255,255,255,0.8)",
              fontSize:13, fontWeight:700, transition:"all 0.2s", fontFamily:"'Poppins',sans-serif",
            }}>
              {t==="overview" ? "📊 Overview" : "🧠 Insights"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        {tab === "overview" && (
          <>
            <div className="animate-fadeInUp card-hover" style={{ background:"#fff", borderRadius:20, padding:"18px", marginBottom:16, border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700 }}>This Week</h3>
                <span style={{ fontSize:11, color:"#94A3B8" }}>Daily spending</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={barData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [`₹${v}`,"Spent"]} contentStyle={{ borderRadius:10, border:"1px solid #E2E8F0", fontSize:12 }} />
                  <Bar dataKey="amount" radius={[8,8,0,0]}>
                    {barData.map((_,i) => <Cell key={i} fill={i===5?"#4F46E5":"#EEF2FF"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {pieData.length > 0 && (
              <div className="animate-fadeInUp card-hover" style={{ background:"#fff", borderRadius:20, padding:"18px", marginBottom:16, border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>By Category</h3>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                        {pieData.map(entry => <Cell key={entry.name} fill={CAT_COLORS[entry.name]||"#94A3B8"} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`,""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                    {pieData.map(item => (
                      <div key={item.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:CAT_COLORS[item.name]||"#94A3B8", flexShrink:0 }} />
                        <span style={{ fontSize:12, color:"#374151", flex:1 }}>{item.name}</span>
                        <span style={{ fontSize:12, fontWeight:600 }}>{totalSpent>0?Math.round((item.value/totalSpent)*100):0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {topCat && (
              <div className="animate-fadeInUp" style={{ background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)", borderRadius:20, padding:"16px 18px", marginBottom:16, border:"1px solid #C7D2FE", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, background:"#fff", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 2px 8px rgba(79,70,229,0.15)" }}>🏆</div>
                <div>
                  <p style={{ fontSize:12, color:"#6366F1", fontWeight:600, marginBottom:2 }}>Top Spending Category</p>
                  <p style={{ fontSize:16, fontWeight:700, color:"#4F46E5" }}>{topCat.name}</p>
                  <p style={{ fontSize:12, color:"#6366F1" }}>₹{topCat.value.toLocaleString("en-IN")} · {totalSpent>0?Math.round((topCat.value/totalSpent)*100):0}% of total</p>
                </div>
              </div>
            )}

            <div className="animate-fadeInUp card-hover" style={{ background:"#fff", borderRadius:20, padding:"18px", marginBottom:20, border:"1px solid #F1F5F9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Budget Progress</h3>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#64748B" }}>₹{totalSpent.toLocaleString("en-IN")} spent</span>
                <span style={{ fontSize:12, color:"#64748B" }}>₹{budget.toLocaleString("en-IN")} budget</span>
              </div>
              <div style={{ height:12, background:"#F1F5F9", borderRadius:6, overflow:"hidden" }}>
                <div className="progress-bar" style={{
                  height:"100%", width:`${Math.min((totalSpent/budget)*100,100)}%`,
                  background: totalSpent>budget?"linear-gradient(90deg,#EF4444,#F87171)":totalSpent>budget*0.8?"linear-gradient(90deg,#F59E0B,#FCD34D)":"linear-gradient(90deg,#4F46E5,#818CF8)",
                  borderRadius:6,
                }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <span style={{ fontSize:11, color:"#94A3B8" }}>{budget>0?Math.round((totalSpent/budget)*100):0}% used</span>
                <span style={{ fontSize:11, fontWeight:600, color: totalSpent>budget?"#EF4444":"#22C55E" }}>
                  {totalSpent>budget ? `Over by ₹${(totalSpent-budget).toLocaleString("en-IN")}` : `₹${(budget-totalSpent).toLocaleString("en-IN")} remaining`}
                </span>
              </div>
            </div>
          </>
        )}

        {tab === "insights" && (
          <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:20 }}>
            <p className="animate-fadeIn" style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>
              Based on your spending patterns this month 👇
            </p>
            {insights.map((insight, i) => (
              <div key={i} className="animate-fadeInUp card-hover" style={{
                background:insight.color, border:`1.5px solid ${insight.border}`,
                borderRadius:18, padding:"16px", display:"flex", gap:14, alignItems:"flex-start",
              }}>
                <div style={{ width:44, height:44, background:"#fff", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  {insight.emoji}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#0F172A", marginBottom:4 }}>{insight.title}</p>
                  <p style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{insight.desc}</p>
                </div>
              </div>
            ))}
            <div className="animate-fadeInUp" style={{ background:"linear-gradient(135deg,#4338CA,#6366F1)", borderRadius:18, padding:"18px", marginTop:4 }}>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:600, marginBottom:6 }}>💡 TIP OF THE DAY</p>
              <p style={{ color:"#fff", fontSize:13, fontWeight:600, lineHeight:1.6 }}>
                Try the 50/30/20 rule — 50% on needs, 30% on wants, and 20% on savings. Even on a student budget, small savings grow fast!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
