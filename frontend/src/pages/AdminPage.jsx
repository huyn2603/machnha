import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, ChevronLeft, Coins, LayoutDashboard, Package, Pencil, Plus,
  ShieldCheck, ShoppingBag, Trash2, TrendingUp, Users, X,
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import {
  API_BASE,
  cancelAnalysisPayment,
  confirmAnalysisPayment,
  createProduct,
  deleteProduct,
  getAnalysisPayments,
  getOrders,
  getProducts,
  getUsers,
  updateOrderStatus,
  updateProduct,
} from "../services/api";
import { Spinner } from "../components/UIStates";
import { useAuth } from "../context/AuthContext";

const fmt = (n = 0) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const CATS = ["da-quy", "tuong-phat", "vong-tay", "tranh-phong-thuy", "la-kinh", "cay-phong-thuy", "huong-thom"];
const ELEMS = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
const EMPTY_PROD = { name: "", category: "da-quy", price: "", originalPrice: "", element: "Kim", stock: "", badge: "", badgeColor: "#c0392b", image: "", description: "", features: "", destiny: "" };

const TABS = [
  { id: "dash", label: "Tổng quan", icon: LayoutDashboard },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "payments", label: "Thanh toán lượt", icon: Coins },
  { id: "users", label: "Người dùng", icon: Users },
];

function Card({ icon: Icon, label, value, sub, tone = "#D4AF5A" }) {
  return (
    <div className="admin-stat" style={{ borderColor: `${tone}45` }}>
      <Icon size={23} color={tone}/>
      <strong style={{ color: tone }}>{value}</strong>
      <span>{label}</span>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: ["Chờ xử lý", "#f59e0b"],
    confirmed: ["Đã xác nhận", "#38bdf8"],
    shipping: ["Đang giao", "#818cf8"],
    completed: ["Hoàn thành", "#22c55e"],
    cancelled: ["Đã hủy", "#ef4444"],
    paid: ["Đã thanh toán", "#22c55e"],
  };
  const [text, color] = map[status] || [status || "Không rõ", "#94a3b8"];
  return <span className="admin-pill" style={{ color, borderColor: `${color}55`, background: `${color}16` }}>{text}</span>;
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    ...product,
    features: product.features?.join("\n") || "",
    destiny: product.destiny?.join(", ") || "",
  } : EMPTY_PROD);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const body = {
      ...form,
      price: Number(form.price || 0),
      originalPrice: Number(form.originalPrice || 0),
      stock: Number(form.stock || 0),
      features: String(form.features || "").split("\n").map((x) => x.trim()).filter(Boolean),
      destiny: String(form.destiny || "").split(",").map((x) => x.trim()).filter(Boolean),
      badge: form.badge || null,
      badgeColor: form.badge ? form.badgeColor : null,
    };
    if (product) await updateProduct(product.id, { ...body, id: product.id });
    else await createProduct(body);
    onSave();
  };

  return (
    <div className="admin-modal">
      <div className="admin-modal-box">
        <button className="admin-icon-btn close" onClick={onClose}><X size={17}/></button>
        <h2>{product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
        <div className="admin-form-grid">
          {[
            ["name", "Tên sản phẩm", "text", true],
            ["price", "Giá bán", "number"],
            ["originalPrice", "Giá gốc", "number"],
            ["stock", "Tồn kho", "number"],
            ["image", "URL ảnh", "text", true],
            ["badge", "Nhãn", "text"],
            ["badgeColor", "Màu nhãn", "color"],
          ].map(([key, label, type, full]) => (
            <label key={key} className={full ? "full" : ""}>
              {label}
              <input type={type} value={form[key] || ""} onChange={(e) => set(key, e.target.value)}/>
            </label>
          ))}
          <label>Danh mục<select value={form.category} onChange={(e) => set("category", e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Ngũ hành<select value={form.element} onChange={(e) => set("element", e.target.value)}>{ELEMS.map((e) => <option key={e}>{e}</option>)}</select></label>
          <label className="full">Mệnh phù hợp<input value={form.destiny || ""} onChange={(e) => set("destiny", e.target.value)} placeholder="Kim, Thủy, Mọi mệnh"/></label>
          <label className="full">Đặc điểm<textarea rows={3} value={form.features || ""} onChange={(e) => set("features", e.target.value)}/></label>
          <label className="full">Mô tả<textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)}/></label>
        </div>
        <div className="admin-actions">
          <button className="btn-gold" onClick={save}><Check size={15}/> Lưu</button>
          <button className="btn-outline" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dash");
  const [modal, setModal] = useState(null);
  const { data: products = [], loading: pLoad, refetch: refetchProducts } = useFetch(getProducts, []);
  const { data: orders = [], loading: oLoad, refetch: refetchOrders } = useFetch(getOrders, []);
  const { data: users = [], refetch: refetchUsers } = useFetch(getUsers, []);
  const { data: payments = [], refetch: refetchPayments } = useFetch(getAnalysisPayments, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidSlots = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.slots || 0), 0);
    return { revenue, paidSlots, pendingPayments: payments.filter((p) => p.status === "pending").length };
  }, [orders, payments]);

  const toggleUser = async (target) => {
    await fetch(`${API_BASE}/users/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !target.active }),
    });
    refetchUsers();
  };

  const confirmPayment = async (payment) => {
    await confirmAnalysisPayment(payment.id, user?.id);
    refetchPayments();
    refetchUsers();
  };

  const cancelPayment = async (payment) => {
    await cancelAnalysisPayment(payment.id);
    refetchPayments();
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    await deleteProduct(id);
    refetchProducts();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>Mạch Nhà</strong>
          <span>Admin Panel</span>
        </div>
        <div className="admin-profile">
          <div>{user?.avatar || "A"}</div>
          <section><b>{user?.name}</b><span>Quản trị viên</span></section>
        </div>
        <nav>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
              <Icon size={17}/>{label}
              {id === "payments" && stats.pendingPayments > 0 && <em>{stats.pendingPayments}</em>}
            </button>
          ))}
        </nav>
        <Link to="/" className="admin-back"><ChevronLeft size={15}/> Về trang chủ</Link>
      </aside>

      <main className="admin-main">
        {tab === "dash" && (
          <>
            <header className="admin-header"><h1>Tổng quan</h1><p>Xin chào {user?.name}, đây là tình hình vận hành hiện tại.</p></header>
            <div className="admin-stats">
              <Card icon={Package} label="Sản phẩm" value={products.length} sub="Đang kinh doanh"/>
              <Card icon={ShoppingBag} label="Đơn hàng" value={orders.length} sub={`${orders.filter((o) => o.status === "pending").length} đơn chờ xử lý`} tone="#38bdf8"/>
              <Card icon={Users} label="Người dùng" value={users.filter((u) => u.role === "user").length} sub="Tài khoản khách hàng" tone="#22c55e"/>
              <Card icon={TrendingUp} label="Doanh thu" value={fmt(stats.revenue)} sub={`${stats.paidSlots} lượt đã kích hoạt`} tone="#f59e0b"/>
            </div>
            <section className="admin-panel">
              <h2>Thanh toán lượt đang chờ</h2>
              <PaymentList payments={payments.filter((p) => p.status === "pending").slice(0, 5)} onConfirm={confirmPayment} onCancel={cancelPayment}/>
            </section>
          </>
        )}

        {tab === "products" && (
          <section className="admin-panel">
            <div className="admin-section-title"><h1>Sản phẩm</h1><button className="btn-gold" onClick={() => setModal("new")}><Plus size={15}/> Thêm mới</button></div>
            {pLoad ? <Spinner/> : <ProductTable products={products} onEdit={setModal} onDelete={removeProduct}/>}
          </section>
        )}

        {tab === "orders" && (
          <section className="admin-panel">
            <h1>Đơn hàng</h1>
            {oLoad ? <Spinner/> : <OrderList orders={orders} onStatus={async (id, status) => { await updateOrderStatus(id, status); refetchOrders(); }}/>}
          </section>
        )}

        {tab === "payments" && (
          <section className="admin-panel">
            <div className="admin-section-title"><h1>Thanh toán mua lượt</h1><p>{stats.pendingPayments} giao dịch cần xác nhận</p></div>
            <PaymentList payments={payments.slice().reverse()} onConfirm={confirmPayment} onCancel={cancelPayment}/>
          </section>
        )}

        {tab === "users" && (
          <section className="admin-panel">
            <h1>Người dùng và vai trò</h1>
            <UserTable users={users} onToggle={toggleUser}/>
          </section>
        )}
      </main>

      {modal && <ProductModal product={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); refetchProducts(); }}/>}
    </div>
  );
}

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="admin-table product-table">
      <div className="head"><span>Ảnh</span><span>Tên sản phẩm</span><span>Giá</span><span>Kho</span><span>Mệnh</span><span></span></div>
      {products.map((p) => (
        <div className="row" key={p.id}>
          <img src={p.image} alt={p.name}/>
          <span><b>{p.name}</b><small>{p.category}</small></span>
          <span className="price-num">{fmt(p.price)}</span>
          <span>{p.stock}</span>
          <span>{p.element}</span>
          <span className="admin-row-actions"><button onClick={() => onEdit(p)}><Pencil size={15}/></button><button onClick={() => onDelete(p.id)}><Trash2 size={15}/></button></span>
        </div>
      ))}
    </div>
  );
}

function OrderList({ orders, onStatus }) {
  if (!orders.length) return <div className="admin-empty">Chưa có đơn hàng.</div>;
  return orders.slice().reverse().map((order) => (
    <article className="admin-order" key={order.id}>
      <div>
        <b>#{order.orderId}</b>
        <span>{order.customer?.name} · {order.customer?.phone} · {order.customer?.city}</span>
        <small>{new Date(order.createdAt).toLocaleString("vi-VN")}</small>
      </div>
      <section>
        <strong>{fmt(order.total)}</strong>
        <select value={order.status} onChange={(e) => onStatus(order.id, e.target.value)}>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </section>
    </article>
  ));
}

function PaymentList({ payments, onConfirm, onCancel }) {
  if (!payments.length) return <div className="admin-empty">Không có thanh toán nào cần hiển thị.</div>;
  return payments.map((p) => (
    <article className="admin-payment" key={p.id}>
      <div>
        <div className="admin-payment-top"><b>{p.packageName || p.packageId}</b><StatusPill status={p.status}/></div>
        <p>{p.userName || "Khách"} {p.userEmail ? `· ${p.userEmail}` : ""}</p>
        <small>Nội dung CK: {p.desc} · {new Date(p.createdAt).toLocaleString("vi-VN")}</small>
      </div>
      <section>
        <strong>{fmt(p.amount)}</strong>
        <span>{p.slots} lượt</span>
        {p.status === "pending" && (
          <div>
            <button className="admin-confirm" onClick={() => onConfirm(p)}><ShieldCheck size={14}/> Xác nhận</button>
            <button className="admin-cancel" onClick={() => onCancel(p)}>Hủy</button>
          </div>
        )}
      </section>
    </article>
  ));
}

function UserTable({ users, onToggle }) {
  return (
    <div className="admin-table user-table">
      <div className="head"><span>Người dùng</span><span>Email</span><span>Vai trò</span><span>Lượt</span><span>Trạng thái</span><span></span></div>
      {users.map((u) => (
        <div className="row" key={u.id}>
          <span className="admin-user-cell"><i style={{ background: u.color || "var(--gold)" }}>{u.avatar}</i><b>{u.name}</b><small>{u.phone || "Chưa có SĐT"}</small></span>
          <span>{u.email}</span>
          <span><span className={`role-badge ${u.role}`}>{u.role === "admin" ? "Admin" : "User"}</span></span>
          <span>{Number(u.analysisSlots || 0)}</span>
          <span><StatusPill status={u.active ? "completed" : "cancelled"}/></span>
          <span>{u.role !== "admin" && <button className="admin-toggle" onClick={() => onToggle(u)}>{u.active ? "Khóa" : "Mở"}</button>}</span>
        </div>
      ))}
    </div>
  );
}
