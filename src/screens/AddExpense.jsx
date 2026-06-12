import { useState } from "react";

const CATEGORIES = [
  { id:"Food",          emoji:"🍔", label:"Food",          color:"#FEF3C7", active:"#F59E0B" },
  { id:"Travel",        emoji:"🚌", label:"Travel",        color:"#DBEAFE", active:"#3B82F6" },
  { id:"Shopping",      emoji:"🛍️", label:"Shopping",     color:"#FCE7F3", active:"#DB2777" },
  { id:"Education",     emoji:"📚", label:"Education",     color:"#EDE9FE", active:"#7C3AED" },
  { id:"Entertainment", emoji:"🎮", label:"Entertainment", color:"#D1FAE5", active:"#059669" },
  { id:"Others",        emoji:"✨", label:"Others",        color:"#F1F5F9", active:"#64748B" },
];

export default function AddExpense({ onSave, onNavigate }) {
  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("Food");
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [note,     setNote]     = useState("");
  const [type,     setType]     = useState("expense");
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const cat = CATEGORIES.find(c => c.id === category);
    onSave({
      category: type === "income" ? "Income" : category,
      emoji:    type === "income" ? "💰" : cat.emoji,
      label:    note || (type === "income" ? "Income" : category),
      amount:   Number(amount),
      date, type,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("dashboard"); }, 800);
  };

  const selectedCat = CATEGORIES.find(c => c.id === category);

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <div className="animate-fadeInDown" style={{
        background:"linear-gradient(135deg,#4338CA,#6366F1)",
        padding:"52px 24px 32px", borderRadius:"0 0 28px 28px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => onNavigate("dashboard")} style={{
            background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10,
            color:"#fff", padding:"7px 14px", fontSize:13, fontFamily:"'Poppins',sans-serif",
          }}>← Back</button>
          <h1 style={{ color:"#fff", fontSize:20, fontWeight:700 }}>Add Transaction</h1>
        </div>

        <div style={{ display:"flex", background:"rgba(255,255,255,0.15)", borderRadius:14, padding:4, gap:4 }}>
          {["expense","income"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex:1, padding:"10px",
              background: type===t ? "#fff" : "transparent", border:"none", borderRadius:10,
              color: type===t ? "#4F46E5" : "rgba(255,255,255,0.8)",
              fontSize:13, fontWeight:700, transition:"all 0.2s", fontFamily:"'Poppins',sans-serif",
            }}>
              {t === "expense" ? "📉 Expense" : "📈 Income"}
            </button>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:24 }}>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:8 }}>Enter Amount</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:28, fontWeight:600 }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{
                background:"transparent", border:"none", outline:"none",
                color:"#fff", fontSize:52, fontWeight:700,
                fontFamily:"'Poppins',sans-serif", width:"160px",
                textAlign:"center", letterSpacing:"-2px",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding:"24px 20px" }}>
        {type === "expense" && (
          <div style={{ marginBottom:22 }}>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Category</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {CATEGORIES.map(cat => {
                const sel = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} className="btn-press" style={{
                    display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
                    background: sel ? cat.active : cat.color,
                    border:`2px solid ${sel ? cat.active : "transparent"}`,
                    borderRadius:14, color: sel ? "#fff" : "#374151",
                    fontSize:13, fontWeight:600,
                    boxShadow: sel ? `0 4px 12px ${cat.active}40` : "none",
                    transition:"all 0.15s",
                  }}>
                    <span style={{ fontSize:17 }}>{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:8 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
            width:"100%", padding:"14px 16px", background:"#fff",
            border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14,
            color:"#0F172A", fontFamily:"'Poppins',sans-serif", outline:"none",
          }} />
        </div>

        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:8 }}>
            Note <span style={{ color:"#94A3B8", fontWeight:400 }}>(optional)</span>
          </label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder={type==="income" ? "e.g. Monthly stipend" : "e.g. Lunch at canteen"}
            style={{
              width:"100%", padding:"14px 16px", background:"#fff",
              border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14,
              color:"#0F172A", fontFamily:"'Poppins',sans-serif", outline:"none",
              transition:"border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor="#4F46E5"}
            onBlur={e => e.target.style.borderColor="#E2E8F0"}
          />
        </div>

        {Number(amount) > 0 && (
          <div className="animate-scaleIn" style={{
            background:"#EEF2FF", borderRadius:16, padding:"14px 16px", marginBottom:20,
            display:"flex", alignItems:"center", gap:12, border:"1px solid #C7D2FE",
          }}>
            <span style={{ fontSize:28 }}>{type==="income" ? "💰" : selectedCat?.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#4F46E5" }}>
                {note || (type==="income" ? "Income" : category)}
              </p>
              <p style={{ fontSize:11, color:"#6366F1" }}>{date}</p>
            </div>
            <p style={{ fontSize:18, fontWeight:700, color: type==="income" ? "#22C55E" : "#EF4444" }}>
              {type==="income" ? "+" : "−"}₹{Number(amount).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        <button onClick={handleSave} disabled={!amount || saved} className="btn-press" style={{
          width:"100%", padding:"17px",
          background: saved ? "#22C55E" : !amount ? "#E2E8F0" : "linear-gradient(135deg,#4F46E5,#6366F1)",
          border:"none", borderRadius:16,
          color: !amount ? "#94A3B8" : "#fff",
          fontSize:15, fontWeight:700,
          boxShadow: amount && !saved ? "0 4px 16px rgba(79,70,229,0.35)" : "none",
          transition:"all 0.25s", letterSpacing:"-0.2px",
        }}>
          {saved ? "✓ Saved!" : "Save Transaction"}
        </button>
      </div>
    </div>
  );
}
