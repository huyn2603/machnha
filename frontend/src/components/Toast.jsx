import React, { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

export function Toasts({ list }) {
  return (
    <div className="toast-wrap">
      {list.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
}