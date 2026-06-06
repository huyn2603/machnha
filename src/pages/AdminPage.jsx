import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { getProducts, getOrders, getUsers, updateOrderStatus, createProduct, updateProduct, deleteProduct } from "../services/api";
import { Spinner } from "../components/UIStates";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Package, ShoppingBag, Users, TrendingUp, Plus, Pencil, Trash2, X, Check, ChevronLeft } from "lucide-react";

const BASE  = "http://localhost:3001";
const fmt   = n => n?.toLocaleString("vi-VN") + "₫";
const apiFn = (path, method="GET", body=null) =>
  fetch(`${BASE}${path}`, { method, headers:{"Content-Type":"application/json"}, body: body?JSON.stringify(body):undefined }).then(r=>r.json());

const TABS = [
  { id:"dash",     label:"Tổng Quan",   icon:<LayoutDashboard size={15}/> },
  { id:"products", label:"Sản Phẩm",    icon:<Package size={15}/> },
  { id:"orders",   label:"Đơn Hàng",    icon:<ShoppingBag size={15}/> },
  { id:"users",    label:"Người Dùng",  icon:<Users size={15}/> },
];

const CATS = ["da-quy","tuong-phat","vong-tay","tranh-phong-thuy","la-kinh","cay-phong-thuy","huong-thom"];
const ELEMS = ["Kim","Mộc","Thủy","Hỏa","Thổ"];
const EMPTY_PROD = { name:"", category:"da-quy", price:"", originalPrice:"", element:"Kim", stock:"", badge:"", badgeColor:"#c0392b", image:"", description:"", features:"", destiny:"" };

function Stat({ icon, label, value, sub, color }) {
  return (
    <div style={{ background:"var(--dark2)", border:`1px solid ${color}30`, padding:22, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:-10, top:-10, width:72, height:72, borderRadius:"50%", background:`${color}10` }}/>
      <div style={{ color, marginBottom:10 }}>{icon}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", fontWeight:600, color }}>{value}</div>
      <div style={{ fontWeight:700, fontSize:"0.8rem", letterSpacing:1, color:"var(--cream)", marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>{sub}</div>}
    </div>
  );
}

function ProdModal({ prod, onClose, onSave }) {
  const [f, setF] = useState(prod ? { ...prod, features: prod.features?.join("\n")||"", destiny: prod.destiny?.join(", ")||"" } : EMPTY_PROD);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const save = async () => {
    const body = {
      ...f,
      price: Number(f.price), originalPrice: Number(f.originalPrice), stock: Number(f.stock),
      features: typeof f.features==="string" ? f.features.split("\n").filter(Boolean) : f.features,
      destiny:  typeof f.destiny ==="string" ? f.destiny.split(",").map(x=>x.trim()).filter(Boolean) : f.destiny,
      badge: f.badge || null, badgeColor: f.badge ? f.badgeColor : null,
    };
    if (prod) await updateProduct(prod.id, { ...body, id:prod.id });
    else      await createProduct(body);
    onSave();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.3)", padding:28, maxWidth:660, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"var(--gold)" }}>{prod?"Sửa Sản Phẩm":"Thêm Sản Phẩm Mới"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-light)", cursor:"pointer" }}><X size={19}/></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[{ k:"name",label:"Tên sản phẩm",full:true },{ k:"price",label:"Giá bán (₫)",type:"number" },{ k:"originalPrice",label:"Giá gốc (₫)",type:"number" },{ k:"stock",label:"Tồn kho",type:"number" },{ k:"image",label:"URL ảnh",full:true },{ k:"badge",label:"Nhãn (badge)" },{ k:"badgeColor",label:"Màu nhãn",type:"color" }].map(fd => (
            <div key={fd.k} className="form-group" style={{ gridColumn:fd.full?"1/-1":"auto" }}>
              <label>{fd.label}</label>
              <input type={fd.type||"text"} value={f[fd.k]||""} onChange={e=>s(fd.k,e.target.value)}/>
            </div>
          ))}
          <div className="form-group">
            <label>Danh mục</label>
            <select value={f.category} onChange={e=>s("category",e.target.value)}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ngũ Hành</label>
            <select value={f.element} onChange={e=>s("element",e.target.value)}>
              {ELEMS.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn:"1/-1" }}>
            <label>Mệnh phù hợp (phân cách bằng dấu phẩy)</label>
            <input value={f.destiny} onChange={e=>s("destiny",e.target.value)} placeholder="Kim, Thủy, Mọi mệnh"/>
          </div>
          <div className="form-group" style={{ gridColumn:"1/-1" }}>
            <label>Đặc điểm (mỗi dòng 1 mục)</label>
            <textarea rows={3} value={f.features} onChange={e=>s("features",e.target.value)}
              style={{ resize:"vertical", background:"var(--dark)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"9px 12px", fontFamily:"Raleway,sans-serif", outline:"none" }}/>
          </div>
          <div className="form-group" style={{ gridColumn:"1/-1" }}>
            <label>Mô tả</label>
            <textarea rows={3} value={f.description} onChange={e=>s("description",e.target.value)}
              style={{ resize:"vertical", background:"var(--dark)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"9px 12px", fontFamily:"Raleway,sans-serif", outline:"none" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <button onClick={save} className="btn-gold" style={{ flex:1, padding:11, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Check size={15}/> Lưu Sản Phẩm
          </button>
          <button onClick={onClose} className="btn-outline" style={{ padding:"11px 18px" }}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dash");
  const [modal, setModal] = useState(null); // null | "new" | product object

  const { data: products = [], loading: pLoad, refetch: rP } = useFetch(getProducts, []);
  const { data: orders   = [], loading: oLoad, refetch: rO } = useFetch(getOrders,   []);
  const { data: users    = []                               } = useFetch(getUsers,    []);

  const totalRev = orders.reduce((s,o) => s + (o.total||0), 0);

  const handleDeleteProd = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    await deleteProduct(id); rP();
  };

  const handleStatusChange = async (id, status) => { await updateOrderStatus(id, status); rO(); };

  const toggleUser = async (u) => {
    await apiFn(`/users/${u.id}`, "PATCH", { active: !u.active });
    window.location.reload(); // simple refresh
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--black)" }}>
      {/* Sidebar */}
      <div style={{ width:215, flexShrink:0, background:"var(--dark2)", borderRight:"1px solid rgba(201,168,76,0.15)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"22px 18px 20px", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontWeight:600, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2, marginBottom:14 }}>☯ Mạch Nhà</div>
          <div style={{ fontSize:"0.62rem", color:"var(--gold)", letterSpacing:2, marginBottom:12 }}>ADMIN PANEL</div>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"var(--black)", fontSize:"0.85rem" }}>{user?.avatar}</div>
            <div>
              <div style={{ fontSize:"0.8rem", fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:"0.65rem", color:"var(--gold)" }}>Quản trị viên</div>
            </div>
          </div>
        </div>

        <div style={{ flex:1, paddingTop:14 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:"100%", padding:"11px 18px", display:"flex", alignItems:"center", gap:10, background: tab===t.id?"rgba(201,168,76,0.12)":"none", border:"none", borderLeft:`3px solid ${tab===t.id?"var(--gold)":"transparent"}`, color: tab===t.id?"var(--gold)":"var(--text-light)", cursor:"pointer", fontFamily:"Raleway,sans-serif", fontSize:"0.82rem", fontWeight: tab===t.id?700:400, transition:"all 0.2s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"18px" }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:7, color:"var(--text-light)", fontSize:"0.78rem" }}>
            <ChevronLeft size={13}/> Về Trang Chủ
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:"28px", overflowY:"auto" }}>

        {/* ── Dashboard ── */}
        {tab === "dash" && (
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", letterSpacing:4, marginBottom:6 }}>Tổng Quan</h1>
            <p style={{ color:"var(--text-light)", marginBottom:28 }}>Chào mừng trở lại, {user?.name}!</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:18, marginBottom:36 }}>
              <Stat icon={<Package size={26}/>}      label="Sản Phẩm"   value={products.length} sub="Đang kinh doanh"    color="var(--gold)"/>
              <Stat icon={<ShoppingBag size={26}/>}  label="Đơn Hàng"  value={orders.length}   sub={`${orders.filter(o=>o.status==="pending").length} chờ xử lý`} color="#2980b9"/>
              <Stat icon={<Users size={26}/>}        label="Người Dùng" value={users.filter(u=>u.role==="user").length} sub="Đã đăng ký" color="#27ae60"/>
              <Stat icon={<TrendingUp size={26}/>}   label="Doanh Thu"  value={totalRev>0?`${(totalRev/1000000).toFixed(1)}M₫`:"0₫"} sub="Tổng đơn hàng" color="#e67e22"/>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.35rem", letterSpacing:2, color:"var(--gold)", marginBottom:14 }}>Đơn Hàng Gần Đây</h2>
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
              {orders.length === 0 ? (
                <div style={{ padding:40, textAlign:"center", color:"var(--text-light)" }}>Chưa có đơn hàng nào</div>
              ) : orders.slice(-5).reverse().map(o => (
                <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:"0.87rem" }}>{o.orderId}</div>
                    <div style={{ fontSize:"0.74rem", color:"var(--text-light)" }}>{o.customer?.name} · {new Date(o.createdAt).toLocaleDateString("vi-VN")}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:"var(--gold)", fontWeight:700 }}>{fmt(o.total)}</div>
                    <span style={{ fontSize:"0.68rem", padding:"2px 7px", background: o.status==="pending"?"rgba(231,76,60,0.15)":"rgba(39,174,96,0.15)", color: o.status==="pending"?"#e74c3c":"#27ae60", borderRadius:2 }}>
                      {o.status==="pending"?"Chờ xử lý":"Hoàn thành"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === "products" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", letterSpacing:4 }}>Sản Phẩm</h1>
              <button onClick={()=>setModal("new")} className="btn-gold" style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px" }}>
                <Plus size={15}/> Thêm Mới
              </button>
            </div>
            {pLoad ? <Spinner/> : (
              <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 100px 75px 75px 80px", gap:0, padding:"10px 18px", fontSize:"0.65rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
                  <span/><span>Tên</span><span>Giá</span><span>Kho</span><span>Mệnh</span><span>Thao Tác</span>
                </div>
                {products.map(p => (
                  <div key={p.id} style={{ display:"grid", gridTemplateColumns:"56px 1fr 100px 75px 75px 80px", gap:0, padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
                    <img src={p.image} alt="" style={{ width:46, height:46, objectFit:"cover", border:"1px solid rgba(201,168,76,0.15)" }}/>
                    <div>
                      <div style={{ fontWeight:600, fontSize:"0.85rem" }}>{p.name}</div>
                      <div style={{ fontSize:"0.68rem", color:"var(--text-light)" }}>{p.category}</div>
                    </div>
                    <div style={{ color:"var(--gold)", fontWeight:700, fontSize:"0.85rem" }}>{(p.price/1000).toFixed(0)}K</div>
                    <div style={{ fontSize:"0.82rem", color: p.stock<10?"#e74c3c":"var(--cream2)" }}>{p.stock}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text-light)" }}>{p.element}</div>
                    <div style={{ display:"flex", gap:9 }}>
                      <button onClick={()=>setModal(p)} style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer" }}><Pencil size={14}/></button>
                      <button onClick={()=>handleDeleteProd(p.id)} style={{ background:"none", border:"none", color:"#e74c3c", cursor:"pointer" }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {modal && <ProdModal prod={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={()=>{ setModal(null); rP(); }}/>}
          </div>
        )}

        {/* ── Orders ── */}
        {tab === "orders" && (
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", letterSpacing:4, marginBottom:22 }}>Đơn Hàng</h1>
            {oLoad ? <Spinner/> : orders.length === 0 ? (
              <div style={{ textAlign:"center", padding:56, color:"var(--text-light)" }}>Chưa có đơn hàng</div>
            ) : (
              <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
                {orders.slice().reverse().map(o => (
                  <div key={o.id} style={{ padding:18, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, color:"var(--gold)", fontSize:"0.87rem" }}>#{o.orderId}</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--cream2)", marginTop:3 }}>{o.customer?.name} · {o.customer?.phone} · {o.customer?.city}</div>
                        <div style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>{new Date(o.createdAt).toLocaleString("vi-VN")}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"var(--gold)", fontWeight:600 }}>{fmt(o.total)}</div>
                        <div style={{ fontSize:"0.72rem", color:"var(--text-light)", marginBottom:6 }}>{o.paymentMethod?.toUpperCase()}</div>
                        <select value={o.status} onChange={e=>handleStatusChange(o.id, e.target.value)}
                          style={{ background:"var(--dark)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"4px 7px", fontSize:"0.72rem", fontFamily:"Raleway,sans-serif", cursor:"pointer" }}>
                          {[["pending","Chờ xử lý"],["confirmed","Đã xác nhận"],["shipping","Đang giao"],["completed","Hoàn thành"],["cancelled","Đã hủy"]].map(([v,l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                      {o.items?.map((it,i) => (
                        <span key={i} style={{ fontSize:"0.72rem", padding:"2px 9px", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.15)", color:"var(--cream2)" }}>
                          {it.name} ×{it.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {tab === "users" && (
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", letterSpacing:4, marginBottom:22 }}>Người Dùng</h1>
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 155px 95px 75px 80px 70px", gap:0, padding:"10px 18px", fontSize:"0.65rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
                <span>Người Dùng</span><span>Email</span><span>Vai Trò</span><span>Mệnh</span><span>Trạng Thái</span><span>Thao Tác</span>
              </div>
              {users.map(u => (
                <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1fr 155px 95px 75px 80px 70px", gap:0, padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:u.color||"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"var(--black)", flexShrink:0 }}>{u.avatar}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:"0.85rem" }}>{u.name}</div>
                      <div style={{ fontSize:"0.68rem", color:"var(--text-light)" }}>{u.phone}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-light)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
                  <span style={{ fontSize:"0.68rem", padding:"2px 7px", background: u.role==="admin"?"rgba(201,168,76,0.15)":"rgba(41,128,185,0.15)", color: u.role==="admin"?"var(--gold)":"#2980b9", borderRadius:2, display:"inline-block" }}>
                    {u.role==="admin"?"👑 Admin":"👤 User"}
                  </span>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-light)" }}>{u.element||"—"}</div>
                  <span style={{ fontSize:"0.68rem", padding:"2px 7px", background: u.active?"rgba(39,174,96,0.15)":"rgba(192,57,43,0.15)", color: u.active?"#27ae60":"#e74c3c", borderRadius:2, display:"inline-block" }}>
                    {u.active?"Hoạt động":"Bị khóa"}
                  </span>
                  <div>
                    {u.role !== "admin" && (
                      <button onClick={()=>toggleUser(u)} style={{ background:"none", border:`1px solid ${u.active?"rgba(192,57,43,0.4)":"rgba(39,174,96,0.4)"}`, color: u.active?"#e74c3c":"#27ae60", padding:"3px 9px", cursor:"pointer", fontSize:"0.68rem", fontFamily:"Raleway,sans-serif" }}>
                        {u.active?"Khóa":"Mở"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}