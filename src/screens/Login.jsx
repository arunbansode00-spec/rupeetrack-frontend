import { useState } from "react";

export default function Login({ onLogin, onSignup, onNavigate }) {
  const [isLogin,  setIsLogin]  = useState(true);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;
    if (!isLogin && !name) return;
    setLoading(true); setError("");
    try {
      if (isLogin) await onLogin(email, password);
      else         await onSignup(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width:"100%", padding:"14px 16px",
    background:"#F8FAFC",
    border:`1.5px solid ${focused === field ? "#4F46E5" : "#E2E8F0"}`,
    borderRadius:14, fontSize:14, color:"#0F172A", outline:"none",
    boxShadow: focused === field ? "0 0 0 3px rgba(79,70,229,0.1)" : "none",
    transition:"border-color 0.2s, box-shadow 0.2s",
    fontFamily:"'Poppins',sans-serif",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <div className="animate-fadeInDown" style={{ background:"linear-gradient(160deg,#3730A3,#6366F1)", padding:"56px 28px 44px", borderRadius:"0 0 36px 36px", marginBottom:28 }}>
        <button onClick={() => onNavigate("onboarding")} style={{ background:"rgba(255,255,255,0.18)", border:"none", borderRadius:10, color:"#fff", padding:"7px 14px", fontSize:13, marginBottom:22, display:"block", fontFamily:"'Poppins',sans-serif" }}>← Back</button>
        <h1 style={{ color:"#fff", fontSize:26, fontWeight:700, marginBottom:6 }}>{isLogin ? "Welcome back 👋" : "Join RupeeTrack 🚀"}</h1>
        <p style={{ color:"rgba(255,255,255,0.72)", fontSize:14 }}>{isLogin ? "Login to track your expenses" : "Start tracking every rupee"}</p>
      </div>

      <div style={{ padding:"0 24px" }}>
        <div className="animate-scaleIn" style={{ background:"#fff", borderRadius:24, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,0.07)", border:"1px solid #F1F5F9", display:"flex", flexDirection:"column", gap:16 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:7 }}>Full Name</label>
              <input style={inputStyle("name")} type="text" placeholder="Arun Kumar" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
            </div>
          )}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:7 }}>Email Address</label>
            <input style={inputStyle("email")} type="email" placeholder="arun@college.edu" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:7 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...inputStyle("password"), paddingRight:48 }} type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:18 }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>

          {error && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px" }}>
              <p style={{ fontSize:12, color:"#EF4444", fontWeight:500 }}>⚠️ {error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !email || !password || (!isLogin && !name)} className="btn-press"
            style={{ width:"100%", padding:"16px", background: loading ? "#A5B4FC" : !email || !password ? "#E2E8F0" : "linear-gradient(135deg,#4F46E5,#6366F1)", border:"none", borderRadius:14, color: !email || !password ? "#94A3B8" : "#fff", fontSize:15, fontWeight:700, marginTop:4, boxShadow: email && password ? "0 4px 16px rgba(79,70,229,0.35)" : "none", transition:"all 0.2s" }}>
            {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign:"center", fontSize:13, color:"#64748B", marginTop:22 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{ color:"#4F46E5", fontWeight:700, cursor:"pointer" }}>{isLogin ? "Sign Up" : "Login"}</span>
        </p>
        <div style={{ background:"#EEF2FF", borderRadius:14, padding:"12px 16px", marginTop:16, textAlign:"center" }}>
          <p style={{ fontSize:11, color:"#6366F1", fontWeight:500 }}>💡 Enter your email & password to continue</p>
        </div>
      </div>
    </div>
  );
}
