import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Spinner, ErrBox } from "../components/UIStates";
import { useFetch } from "../hooks/useFetch";
import { getProducts, getCategories } from "../services/api";
import { useToast, Toasts } from "../components/Toast";

export default function Shop() {
  const { toasts, show } = useToast();
  const [sp] = useSearchParams();
  const [cat,    setCat]    = useState(sp.get("cat") || "all");
  const [sort,   setSort]   = useState("popular");
  const [price,  setPrice]  = useState([0, 10000000]);
  const [elems,  setElems]  = useState([]);
  const [mobFilter, setMob] = useState(false);
  const query = sp.get("q") || "";

  const { data: products   = [], loading: pLoad, error: pErr, refetch: rP } = useFetch(getProducts,   []);
  const { data: categories = []                                             } = useFetch(getCategories, []);

  useEffect(() => { const c = sp.get("cat"); if (c) setCat(c); }, [sp]);

  const allElements = [...new Set(products.map(p => p.element))];

  const filtered = products
    .filter(p => {
      if (cat !== "all" && p.category !== cat) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (elems.length > 0 && !elems.includes(p.element)) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.description?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a,b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating")     return b.rating - a.rating;
      if (sort === "newest")     return b.id - a.id;
      return b.sold - a.sold;
    });

  const toggleElem = (el) => setElems(p => p.includes(el) ? p.filter(e=>e!==el) : [...p,el]);
  const clearAll   = ()    => { setCat("all"); setPrice([0,10000000]); setElems([]); };

  const Sidebar = () => (
    <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:22 }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", letterSpacing:2, color:"var(--gold)", marginBottom:18 }}>Lọc Sản Phẩm</h3>

      {/* Categories */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:"0.68rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", marginBottom:10 }}>Danh Mục</div>
        {categories.map(c => (
          <button key={c.id} onClick={()=>setCat(c.id)} style={{ width:"100%", textAlign:"left", padding:"7px 0", background:"none", border:"none", cursor:"pointer", fontFamily:"Raleway,sans-serif", fontSize:"0.85rem", color: cat===c.id?"var(--gold)":"var(--text-light)", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", gap:8 }}>
            {c.name}
            {cat===c.id && <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"var(--gold)" }}/>}
          </button>
        ))}
      </div>

      {/* Price */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:"0.68rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", marginBottom:10 }}>Khoảng Giá</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[[0,500000],[500000,2000000],[2000000,5000000],[5000000,10000000]].map(([mn,mx]) => (
            <button key={mn} onClick={()=>setPrice([mn,mx])} style={{ padding:"4px 8px", fontSize:"0.68rem", background: price[0]===mn&&price[1]===mx?"var(--gold)":"transparent", border:"1px solid var(--medium)", color: price[0]===mn&&price[1]===mx?"var(--black)":"var(--text-light)", cursor:"pointer", fontFamily:"Raleway,sans-serif", borderRadius:2 }}>
              {mn===0?"<500K":`${mn/1000}K+`}
            </button>
          ))}
        </div>
      </div>

      {/* Elements */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:"0.68rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", marginBottom:10 }}>Ngũ Hành</div>
        {allElements.map(el => (
          <label key={el} style={{ display:"flex", alignItems:"center", gap:9, padding:"5px 0", cursor:"pointer" }}>
            <input type="checkbox" checked={elems.includes(el)} onChange={()=>toggleElem(el)} style={{ accentColor:"var(--gold)" }}/>
            <span style={{ fontSize:"0.85rem", color:"var(--text-light)" }}>Mệnh {el}</span>
          </label>
        ))}
      </div>

      <button onClick={clearAll} style={{ width:"100%", padding:9, background:"none", border:"1px solid var(--medium)", color:"var(--text-light)", cursor:"pointer", fontSize:"0.78rem", letterSpacing:1, fontFamily:"Raleway,sans-serif" }}>
        Xóa Bộ Lọc
      </button>
    </div>
  );

  return (
    <div style={{ paddingTop:130, minHeight:"100vh" }}>
      <Toasts list={toasts}/>

      {/* Page header */}
      <div style={{ background:"var(--dark2)", borderBottom:"1px solid rgba(201,168,76,0.2)", padding:"38px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"0.68rem", letterSpacing:4, color:"var(--gold)", textTransform:"uppercase", marginBottom:7 }}>✦ Phong Thủy Mạch Nhà ✦</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:300, letterSpacing:6 }}>
          {query ? `Kết Quả: "${query}"` : "Cửa Hàng Phong Thủy"}
        </h1>
        <p style={{ color:"var(--text-light)", marginTop:7 }}>{filtered.length} sản phẩm</p>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"36px 24px", display:"flex", gap:28 }}>
        {/* Sidebar desktop */}
        <aside style={{ width:245, flexShrink:0 }} className="sidebar-desk">
          <Sidebar/>
        </aside>

        {/* Main */}
        <div style={{ flex:1 }}>
          {/* Toolbar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <button onClick={()=>setMob(p=>!p)} className="sidebar-mob-btn" style={{ display:"none", alignItems:"center", gap:7, background:"var(--dark2)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"9px 14px", cursor:"pointer", fontFamily:"Raleway,sans-serif", fontSize:"0.82rem" }}>
              <SlidersHorizontal size={15}/> Bộ Lọc
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:"auto" }}>
              <span style={{ fontSize:"0.82rem", color:"var(--text-light)" }}>Sắp xếp:</span>
              <div style={{ position:"relative" }}>
                <select value={sort} onChange={e=>setSort(e.target.value)} style={{ background:"var(--dark2)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"9px 34px 9px 13px", fontFamily:"Raleway,sans-serif", fontSize:"0.82rem", outline:"none", cursor:"pointer", appearance:"none" }}>
                  <option value="popular">Phổ Biến Nhất</option>
                  <option value="newest">Mới Nhất</option>
                  <option value="rating">Đánh Giá Cao</option>
                  <option value="price-asc">Giá Tăng Dần</option>
                  <option value="price-desc">Giá Giảm Dần</option>
                </select>
                <ChevronDown size={13} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"var(--gold)", pointerEvents:"none" }}/>
              </div>
            </div>
          </div>

          {/* Mobile sidebar */}
          {mobFilter && (
            <div style={{ marginBottom:20 }}>
              <Sidebar/>
            </div>
          )}

          {pErr ? <ErrBox msg={pErr} onRetry={rP}/> :
            pLoad ? <Spinner/> :
            filtered.length > 0 ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(235px,1fr))", gap:22 }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} onToast={show}/>)}
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"80px 0" }}>
                <div style={{ fontSize:"3rem", marginBottom:14 }}>☯</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"var(--text-light)", marginBottom:8 }}>Không tìm thấy sản phẩm</h3>
                <p style={{ color:"var(--text-light)", fontSize:"0.87rem" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
        </div>
      </div>

      <style>{`
        @media(max-width:900px){ .sidebar-desk{display:none!important} .sidebar-mob-btn{display:flex!important} }
      `}</style>
    </div>
  );
}