import React from "react";

export function Spinner({ text = "Đang tải..." }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid rgba(201,168,76,0.2)", borderTop:"3px solid var(--gold)", borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
      <p style={{ color:"var(--text-light)", fontSize:"0.88rem", letterSpacing:1 }}>{text}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ErrBox({ msg, onRetry }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 24px", border:"1px solid rgba(192,57,43,0.3)", background:"rgba(192,57,43,0.04)", maxWidth:480, margin:"40px auto" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⚠️</div>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"#e74c3c", marginBottom:8 }}>Không kết nối được</h3>
      <p style={{ color:"var(--text-light)", fontSize:"0.86rem", lineHeight:1.7, marginBottom:18 }}>
        {msg || "Hay chac chan backend dang chay."}
      </p>
      <code style={{ display:"block", background:"var(--dark)", padding:"8px 14px", fontSize:"0.78rem", color:"var(--gold)", marginBottom:18, border:"1px solid rgba(201,168,76,0.2)" }}>npm run server</code>
      {onRetry && <button onClick={onRetry} className="btn-outline" style={{ fontSize:"0.8rem" }}>Thử Lại</button>}
    </div>
  );
}
