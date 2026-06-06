import React, { createContext, useContext, useReducer, useEffect } from "react";

const Ctx = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const ex = state.items.find(i => i.id === action.p.id);
      if (ex) return { ...state, items: state.items.map(i => i.id === action.p.id ? { ...i, qty: Math.min(i.qty+1, action.p.stock) } : i) };
      return { ...state, items: [...state.items, { ...action.p, qty: 1 }] };
    }
    case "REMOVE":  return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case "SET_QTY":
      if (action.qty < 1) return { ...state, items: state.items.filter(i => i.id !== action.id) };
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) };
    case "CLEAR":   return { ...state, items: [] };
    case "WISH_TOGGLE": {
      const inW = state.wish.find(i => i.id === action.p.id);
      return { ...state, wish: inW ? state.wish.filter(i => i.id !== action.p.id) : [...state.wish, action.p] };
    }
    default: return state;
  }
}

const init = {
  items: JSON.parse(localStorage.getItem("mn_cart") || "[]"),
  wish:  JSON.parse(localStorage.getItem("mn_wish")  || "[]"),
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  useEffect(() => { localStorage.setItem("mn_cart", JSON.stringify(state.items)); }, [state.items]);
  useEffect(() => { localStorage.setItem("mn_wish",  JSON.stringify(state.wish));  }, [state.wish]);

  const totalQty   = state.items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ ...state, totalQty, totalPrice, dispatch }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);