import { useState, useMemo } from "react";

const CAT_COLORS = {
  Food:          { bg:"#FEF3C7", text:"#D97706" },
  Travel:        { bg:"#DBEAFE", text:"#2563EB" },
  Shopping:      { bg:"#FCE7F3", text:"#DB2777" },
  Education:     { bg:"#EDE9FE", text:"#7C3AED" },
  Entertainment: { bg:"#D1FAE5", text:"#059669" },
  Income:        { bg:"#DCFCE7", text:"#16A34A" },
  Others:        { bg:"#F1F5F9", text:"#64748B" },
};

const CATEGORIES = ["All", "Food", "Travel", "Shopping", "Education", "Entertainment", "Income", "Others"];

function formatDate(ds) {
  const today = new Date(), yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const d = new Date(ds);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

export default function Transactions({ expenses = [], onNavigate, onDelete, onEdit }) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [type,     setType]     = useState("all");
  const [sortBy,   setSortBy]   = useState("date");
  const [toast,    setToast]    = useState("");

  const filtered = useMemo(() => {
    let result = [...expenses];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.label?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== "All") {
      result = result.filter(e => e.category === category);
    }

    // Type filter
    if (type !== "all") {
      result = result.filter(e => e.type === type);
    }

    // Sort
    if (sortBy === "date") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "amount_high") {
      result.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sortBy === "amount_low") {
      result.sort((a, b) => Number(a.amount) - Number(b.amount));
    }

    return result;
  }, [expenses, search, category, type, sortBy]);

  const totalFiltered = filtered
    .filter(e => e.type === "expense")
    .reduce((s, e) => s + Number(e.amount), 0);

  const handleDelete = async (id) => {
    await onDelete(id);
    setToast("Deleted ✓");
    setTimeout(() => setToast(""), 2000);
  };

  const handleEdit = (tx) => {
    onEdit(tx);
    onNavigate("add");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
          background:"#0F172A", color:"#fff", padding:"10px 20px",
          borderRadius:12, fontSize:13, fontWeight:500, zIndex:200,
          whiteSpace:"nowrap",
        }}>{toast}</div>
      )}

      {/* Header */}
      <div className="animate-fadeInDown" style={{
        background:"linear-gradient(135deg,#4338CA,#6366F1)",
        padding:"52px 24px 20px", borderRadius:"0 0 28px 28px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <button onClick={() => onNavigate("dashboard")} style={{
            background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10,
            color:"#fff", padding:"7px 14px", fontSize:13, fontFamily:"'Poppins',sans-serif",
          }}>← Back</button>
          <h1 style={{ color:"#fff", fontSize:20, fontWeight:700 }}>All Transactions</h1>
        </div>

        {/* Search bar */}
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%", padding:"12px 16px 12px 42px",
              background:"rgba(255,255,255,0.95)",
              border:"none", borderRadius:14,
              fontSize:14, color:"#0F172A",
              fontFamily:"'Poppins',sans-serif", outline:"none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#94A3B8",
            }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ padding:"16px 20px 0" }}>
        {/* Type filter */}
        <div style={{ display:"flex", background:"#fff", borderRadius:14, padding:4, gap:4, marginBottom:12, border:"1px solid #F1F5F9" }}>
          {[
            { id:"all",     label:"All" },
            { id:"expense", label:"💸 Expenses" },
            { id:"income",  label:"💰 Income" },
          ].map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              flex:1, padding:"8px",
              background: type===t.id ? "#4F46E5" : "transparent",
              border:"none", borderRadius:10,
              color: type===t.id ? "#fff" : "#64748B",
              fontSize:12, fontWeight:600, transition:"all 0.2s",
              fontFamily:"'Poppins',sans-serif",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Category chips */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:12, scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding:"6px 14px", whiteSpace:"nowrap",
              background: category===cat ? "#4F46E5" : "#fff",
              border: `1.5px solid ${category===cat ? "#4F46E5" : "#E2E8F0"}`,
              borderRadius:20, color: category===cat ? "#fff" : "#64748B",
              fontSize:12, fontWeight:600, flexShrink:0,
              fontFamily:"'Poppins',sans-serif", transition:"all 0.15s",
            }}>{cat}</button>
          ))}
        </div>

        {/* Sort + results count */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <p style={{ fontSize:12, color:"#64748B" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {category !== "All" || type !== "all" || search ? ` · ₹${totalFiltered.toLocaleString("en-IN")} spent` : ""}
          </p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding:"6px 10px", background:"#fff",
              border:"1.5px solid #E2E8F0", borderRadius:10,
              fontSize:12, color:"#374151",
              fontFamily:"'Poppins',sans-serif", outline:"none",
            }}
          >
            <option value="date">Latest first</option>
            <option value="amount_high">Highest amount</option>
            <option value="amount_low">Lowest amount</option>
          </select>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", borderRadius:20, border:"1px solid #F1F5F9" }}>
            <p style={{ fontSize:32, marginBottom:12 }}>🔍</p>
            <p style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:6 }}>No results found</p>
            <p style={{ fontSize:12, color:"#94A3B8" }}>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10, paddingBottom:20 }}>
            {filtered.map(tx => {
              const colors = CAT_COLORS[tx.category] || CAT_COLORS.Others;
              return (
                <div key={tx.id} className="card-hover" style={{
                  background:"#fff", borderRadius:16, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:12,
                  border:"1px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.03)",
                }}>
                  <div style={{ width:44, height:44, background:colors.bg, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {tx.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.label}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <p style={{ fontSize:14, fontWeight:700, color: tx.type==="income" ? "#22C55E" : "#EF4444" }}>
                      {tx.type==="income" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleEdit(tx)} style={{ background:"none", border:"none", fontSize:11, color:"#4F46E5", cursor:"pointer", padding:"2px 4px" }}>Edit</button>
                      <button onClick={() => handleDelete(tx.id)} style={{ background:"none", border:"none", fontSize:11, color:"#EF4444", cursor:"pointer", padding:"2px 4px" }}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}