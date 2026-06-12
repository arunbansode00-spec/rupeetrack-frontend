export default function Onboarding({ onNavigate }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#3730A3 0%,#4F46E5 45%,#7C3AED 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: "64px 28px 48px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, background:"rgba(255,255,255,0.06)", borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:120, left:-80, width:280, height:280, background:"rgba(255,255,255,0.04)", borderRadius:"50%" }} />

      <div className="animate-scaleInBounce" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{
          width:80, height:80, background:"rgba(255,255,255,0.15)", borderRadius:26,
          display:"flex", alignItems:"center", justifyContent:"center",
          backdropFilter:"blur(10px)", border:"1.5px solid rgba(255,255,255,0.3)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.2)", fontSize:42,
        }}>₹</div>
        <h1 style={{ color:"#fff", fontSize:30, fontWeight:700, letterSpacing:"-0.5px", marginTop:4 }}>RupeeTrack</h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15 }}>Track every rupee.</p>
      </div>

      <div className="animate-fadeInUp" style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { emoji:"🍔", label:"Canteen Lunch",    amount:"−₹120",    color:"#FEF3C7", amtColor:"#EF4444" },
          { emoji:"📚", label:"Reference Books",  amount:"−₹350",    color:"#EDE9FE", amtColor:"#EF4444" },
          { emoji:"💰", label:"Stipend Received", amount:"+₹18,000", color:"#DCFCE7", amtColor:"#22C55E" },
        ].map((item, i) => (
          <div key={i} className="animate-slideInRight" style={{
            background:"rgba(255,255,255,0.92)", borderRadius:18, padding:"12px 16px",
            display:"flex", alignItems:"center", gap:14,
            boxShadow:"0 4px 20px rgba(0,0,0,0.1)", animationDelay:`${i * 0.1}s`,
          }}>
            <div style={{ width:42, height:42, background:item.color, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {item.emoji}
            </div>
            <span style={{ flex:1, fontSize:13, fontWeight:600, color:"#0F172A" }}>{item.label}</span>
            <span style={{ fontSize:14, fontWeight:700, color:item.amtColor }}>{item.amount}</span>
          </div>
        ))}
        <div style={{ background:"rgba(255,255,255,0.92)", borderRadius:18, padding:"14px 16px", boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Monthly Budget</span>
            <span style={{ fontSize:12, color:"#4F46E5", fontWeight:700 }}>55% used</span>
          </div>
          <div style={{ height:8, background:"#F1F5F9", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:"55%", background:"linear-gradient(90deg,#4F46E5,#818CF8)", borderRadius:4 }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:10, color:"#94A3B8" }}>₹5,500 spent</span>
            <span style={{ fontSize:10, color:"#94A3B8" }}>₹10,000 budget</span>
          </div>
        </div>
      </div>

      <div className="animate-fadeInUp" style={{ width:"100%", display:"flex", flexDirection:"column", gap:12, animationDelay:"0.3s" }}>
        <button onClick={() => onNavigate("login")} className="btn-press" style={{
          width:"100%", padding:"17px", background:"#fff", border:"none", borderRadius:18,
          color:"#4F46E5", fontSize:15, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", letterSpacing:"-0.2px",
        }}>Get Started — Sign Up 🚀</button>
        <button onClick={() => onNavigate("login")} className="btn-press" style={{
          width:"100%", padding:"17px", background:"rgba(255,255,255,0.12)",
          border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:18, color:"#fff", fontSize:15, fontWeight:600,
        }}>I already have an account</button>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:11, textAlign:"center", marginTop:4 }}>
          Free forever · No credit card needed
        </p>
      </div>
    </div>
  );
}
