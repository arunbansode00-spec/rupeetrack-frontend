import { useState } from "react";

const tabs = [
  { id: "dashboard", label: "Home",      icon: "🏠" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "budget",    label: "Budget",    icon: "🎯" },
  { id: "profile",   label: "Profile",   icon: "👤" },
];

export default function BottomNav({ current, onNavigate }) {
  const [pressed, setPressed] = useState(null);

  return (
    <nav style={{
      position: "fixed", bottom: 0,
      left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 390,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid #F1F5F9",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 68, zIndex: 100,
      boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
    }}>
      {tabs.map((tab) => {
        const active = current === tab.id;
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            onMouseDown={() => setPressed(tab.id)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(tab.id)}
            onTouchEnd={() => setPressed(null)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px", borderRadius: 14,
              transform: pressed === tab.id ? "scale(0.88)" : "scale(1)",
              transition: "transform 0.1s ease",
            }}
          >
            <div style={{
              width: 40, height: 32,
              background: active ? "#EEF2FF" : "transparent",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <span style={{ fontSize: active ? 22 : 20, transition: "font-size 0.2s" }}>
                {tab.icon}
              </span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              color: active ? "#4F46E5" : "#94A3B8",
              fontFamily: "'Poppins', sans-serif",
              transition: "color 0.2s",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
