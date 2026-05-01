"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const categories = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "burgers", label: "Burgers", icon: "🍔" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "sushi", label: "Sushi", icon: "🍣" },
  { id: "tacos", label: "Tacos", icon: "🌮" },
  { id: "drinks", label: "Drinks", icon: "🥤" },
  { id: "desserts", label: "Desserts", icon: "🍰" },
];

const menuItems = [
  { id: 1,  cat: "burgers",  name: "Flame Stack Burger",    desc: "Double smash patty, aged cheddar, caramelized onions", price: 13.9, icon: "🍔", badge: "Best Seller", bg: "#FFF3E6" },
  { id: 2,  cat: "burgers",  name: "Crispy Chicken Burger", desc: "Buttermilk-fried thigh, slaw, sriracha mayo",           price: 12.5, icon: "🍗", bg: "#FFF3E6" },
  { id: 3,  cat: "pizza",    name: "Margherita Classica",   desc: "San Marzano tomatoes, fresh mozzarella, basil",        price: 14.0, icon: "🍕", bg: "#FFF0F0" },
  { id: 4,  cat: "pizza",    name: "Pepperoni Inferno",     desc: "Double pepperoni, chilli oil, smoked cheese",          price: 15.5, icon: "🔥", badge: "Spicy", bg: "#FFF0F0" },
  { id: 5,  cat: "sushi",    name: "Salmon Aburi Roll",     desc: "Flame-seared salmon, avocado, truffle mayo",           price: 16.9, icon: "🍣", bg: "#F0FBF4" },
  { id: 6,  cat: "sushi",    name: "Dragon Roll",           desc: "Shrimp tempura, cucumber, mango, eel sauce",           price: 18.0, icon: "🐉", badge: "Chef Pick", bg: "#F0FBF4" },
  { id: 7,  cat: "tacos",    name: "Al Pastor Tacos",       desc: "Marinated pork, pineapple, cilantro, onion ×3",        price: 10.5, icon: "🌮", bg: "#FFFBF0" },
  { id: 8,  cat: "tacos",    name: "Baja Fish Tacos",       desc: "Beer-battered cod, chipotle crema, pickled slaw ×3",   price: 11.5, icon: "🐟", bg: "#FFFBF0" },
  { id: 9,  cat: "drinks",   name: "Mango Lassi",           desc: "House-made yogurt, Alphonso mango, cardamom",          price: 5.5,  icon: "🥭", bg: "#FFF8E6" },
  { id: 10, cat: "drinks",   name: "Yuzu Lemonade",         desc: "Fresh pressed lemon, yuzu syrup, soda",                price: 4.9,  icon: "🍋", bg: "#FFFFF0" },
  { id: 11, cat: "desserts", name: "Churro Sundae",         desc: "Warm churros, vanilla ice cream, caramel drizzle",     price: 8.5,  icon: "🍮", badge: "New", bg: "#FFF5F0" },
  { id: 12, cat: "desserts", name: "Mochi Trio",            desc: "Strawberry, matcha, and black sesame mochi",           price: 7.9,  icon: "🍡", bg: "#F5F0FF" },
];

const ssSlides = [
  { tag: "Today's Special",  title: "Flame Stack Burger", sub: "Double smash patty stacked with aged cheddar and our secret sauce",             bg: "linear-gradient(135deg,#7C2D12,#EA580C)" },
  { tag: "Chef's Pick",      title: "Dragon Roll",        sub: "Flame-seared salmon and mango on a bed of seasoned sushi rice",                 bg: "linear-gradient(135deg,#134E4A,#0F766E)" },
  { tag: "Just Dropped",     title: "Churro Sundae",      sub: "Crispy warm churros with vanilla ice cream and housemade caramel",              bg: "linear-gradient(135deg,#78350F,#D97706)" },
  { tag: "Crowd Favourite",  title: "Al Pastor Tacos",    sub: "Slow-roasted pork marinated in achiote and pineapple, served three ways",       bg: "linear-gradient(135deg,#1E1B4B,#5B21B6)" },
];

const IDLE_SECONDS = 20;
const TAX_RATE = 0.08;

type MenuItem  = (typeof menuItems)[number];
type CartState = Record<number, { item: MenuItem; qty: number }>;
type OrderItem = MenuItem & { qty: number };
type OrderBatch = { batchId: number; time: string; items: OrderItem[] };
type TableData  = { orders: OrderBatch[] };
type TablesState = Record<string, TableData>;

const calcSubtotal = (orders: { items: { price: number; qty: number }[] }[]) =>
  orders.reduce((s, batch) => s + batch.items.reduce((bs: number, i: { price: number; qty: number }) => bs + i.price * i.qty, 0), 0);

// ─── KEY FIX: stable timestamp helper — always runs client-side only ─────────
const getTimestamp = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

function MenuPage() {
  const searchParams = useSearchParams();
  const tableNo     = searchParams.get("tableNo");
  const activeTable = tableNo ? `Table ${tableNo}` : null;

  // ── STEP 1: mounted guard prevents ANY dynamic content on SSR ────────────
  const [mounted, setMounted] = useState(false);

  const [tables, setTables]             = useState<TablesState>({});
  const [cart, setCart]                 = useState<CartState>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [screensaver, setScreensaver]   = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBillout, setShowBillout]   = useState(false);
  const [billPaid, setBillPaid]         = useState(false);

  const idleTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const slideTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { setMounted(true); }, []);

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setCurrentSlide(0);
      setScreensaver(true);
    }, IDLE_SECONDS * 1000);
  }, []);

  const stopScreensaver = () => {
    setScreensaver(false);
    clearInterval(slideTimer.current);
    resetIdle();
  };

  useEffect(() => {
    if (!mounted) return;
    resetIdle();
    const evts = ["mousemove", "keydown", "touchstart", "click"];
    evts.forEach((e) => document.addEventListener(e, resetIdle));
    return () => {
      clearTimeout(idleTimer.current);
      evts.forEach((e) => document.removeEventListener(e, resetIdle));
    };
  }, [mounted, resetIdle]);

  useEffect(() => {
    if (screensaver) {
      slideTimer.current = setInterval(() => setCurrentSlide((p) => (p + 1) % ssSlides.length), 4000);
    } else {
      clearInterval(slideTimer.current);
    }
    return () => clearInterval(slideTimer.current);
  }, [screensaver]);

  useEffect(() => { setCart({}); }, [activeTable]);

  const addToCart = (item: MenuItem) => {
    if (!activeTable) return;
    setCart((prev) => ({ ...prev, [item.id]: { item, qty: (prev[item.id]?.qty || 0) + 1 } }));
    resetIdle();
  };

  const changeCartQty = (id: number, delta: number) => {
    setCart((prev) => {
      const qty = (prev[id]?.qty || 0) + delta;
      if (qty <= 0) { const n = { ...prev }; delete n[id]; return n; }
      return { ...prev, [id]: { ...prev[id], qty } };
    });
    resetIdle();
  };

  const placeOrder = () => {
    if (!activeTable || Object.keys(cart).length === 0) return;
    const batchItems = Object.values(cart).map(({ item, qty }) => ({ ...item, qty }));
    setTables((prev) => {
      const existing = prev[activeTable] || { orders: [] };
      const updated: TablesState = {
        ...prev,
        [activeTable]: {
          orders: [
            ...existing.orders,
            {
              batchId: Date.now(),
              // ── FIX: fixed locale prevents server/client mismatch ──────
              time: getTimestamp(),
              items: batchItems,
            },
          ],
        },
      };
      // Sync to localStorage for the dashboard to read
      localStorage.setItem("zestbite_tables", JSON.stringify(updated));
      return updated;
    });
    setCart({});
    resetIdle();
  };

  const confirmBillout = () => {
    setBillPaid(true);
    setTimeout(() => {
      setTables((prev) => {
        const n = { ...prev };
        if (activeTable) {
          delete n[activeTable];
          localStorage.setItem("zestbite_tables", JSON.stringify(n));
        }
        return n;
      });
      setCart({});
      setBillPaid(false);
      setShowBillout(false);
    }, 2500);
  };

  const filteredItems  = activeCategory === "all" ? menuItems : menuItems.filter((m) => m.cat === activeCategory);
  const cartEntries    = Object.values(cart);
  const cartSubtotal   = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const tableData      = activeTable ? (tables[activeTable] || { orders: [] }) : null;
  const tableSubtotal  = tableData ? calcSubtotal(tableData.orders) : 0;
  const tableTax       = tableSubtotal * TAX_RATE;
  const tableGrand     = tableSubtotal + tableTax;
  const tableItemCount = tableData
    ? tableData.orders.reduce((s, b) => s + b.items.reduce((bs, i) => bs + i.qty, 0), 0)
    : 0;
  const canPlaceOrder = cartEntries.length > 0 && !!activeTable;
  const canBillOut    = !!activeTable && !!tableData && tableData.orders.length > 0;

  // ── STEP 2: render nothing until client is ready ──────────────────────────
  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFFBF5; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FED7AA; border-radius: 4px; }
        .menu-card { transition: transform .2s, box-shadow .2s !important; }
        .menu-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(249,115,22,0.14) !important; }
      `}</style>

      {/* SCREENSAVER */}
      {screensaver && (
        <div onClick={stopScreensaver} style={{ position: "fixed", inset: 0, zIndex: 1000, cursor: "pointer", overflow: "hidden" }}>
          {ssSlides.map((slide, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, background: slide.bg, opacity: i === currentSlide ? 1 : 0, transition: "opacity 1.2s ease", display: "flex", alignItems: "flex-end" }}>
              <div style={{ padding: "3rem 4rem", color: "#fff", maxWidth: 600 }}>
                <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#FED7AA", fontFamily: "Syne", marginBottom: 12 }}>{slide.tag}</div>
                <div style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 1.05, marginBottom: "1rem" }}>{slide.title}</div>
                <div style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)" }}>{slide.sub}</div>
              </div>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
            {ssSlides.map((_, i) => (
              <div key={i} style={{ width: i === currentSlide ? 24 : 8, height: 8, borderRadius: i === currentSlide ? 4 : "50%", background: i === currentSlide ? "#F97316" : "rgba(255,255,255,0.3)", transition: "all .4s" }} />
            ))}
          </div>
          <div style={{ position: "absolute", top: "2rem", right: "2rem", color: "rgba(255,255,255,0.5)", fontSize: 13, display: "flex", alignItems: "center", gap: 8, zIndex: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316", display: "inline-block" }} />
            Tap anywhere to continue
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "#fff", borderBottom: "1px solid #F3D5BE", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(249,115,22,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.3rem", color: "#EA580C" }}>
            Zest<span style={{ color: "#1C0A00" }}>Bite</span>
          </div>
          <a href="/dashboard" style={{ background: "#FFF7ED", border: "1px solid #FDE8D8", color: "#EA580C", padding: "5px 14px", borderRadius: 20, fontFamily: "Syne", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
            Dashboard →
          </a>
        </div>

        {activeTable ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF7ED", border: "1.5px solid #F97316", borderRadius: 20, padding: "6px 16px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316", display: "inline-block" }} />
              <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#EA580C" }}>{activeTable}</span>
              {canBillOut && (
                <span style={{ background: "#F97316", color: "#fff", borderRadius: 8, fontSize: 11, padding: "1px 8px", fontWeight: 700 }}>
                  {tableItemCount} item{tableItemCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() => canBillOut && setShowBillout(true)}
              disabled={!canBillOut}
              style={{ background: canBillOut ? "linear-gradient(135deg,#1C0A00,#3D1200)" : "#E5E7EB", color: canBillOut ? "#FED7AA" : "#9CA3AF", border: "none", padding: "7px 16px", borderRadius: 20, fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: canBillOut ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}
            >
              🧾 Bill Out
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#9A6046", background: "#FFF7ED", padding: "6px 14px", borderRadius: 20, border: "1px solid #FDE8D8" }}>
            ⚠️ No table — add <code style={{ fontSize: 12, color: "#EA580C" }}>?tableNo=1</code> to the URL
          </div>
        )}
      </header>

      {/* MAIN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 390px", gap: "1.5rem", maxWidth: 1320, margin: "0 auto", padding: "1.5rem 2rem" }}>

        {/* LEFT: Categories + Menu */}
        <div>
          {!activeTable && (
            <div style={{ background: "linear-gradient(135deg,#FFF7ED,#FED7AA)", border: "1.5px solid #F97316", borderRadius: 14, padding: "0.9rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.4rem" }}>👆</span>
              <div>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#EA580C" }}>No table assigned</div>
                <div style={{ fontSize: 12, color: "#9A6046", marginTop: 2 }}>
                  Add <code style={{ color: "#EA580C" }}>?tableNo=3</code> to the URL — e.g. <code style={{ color: "#EA580C" }}>localhost:3000/menu?tableNo=3</code>
                </div>
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 500, marginBottom: "0.6rem" }}>Browse by category</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {categories.map((c) => (
              <button key={c.id} onClick={() => { setActiveCategory(c.id); resetIdle(); }} style={{ padding: "6px 15px", borderRadius: 50, border: `1.5px solid ${activeCategory === c.id ? "#F97316" : "#F3D5BE"}`, background: activeCategory === c.id ? "#F97316" : "#fff", color: activeCategory === c.id ? "#fff" : "#9A6046", fontFamily: "DM Sans", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}>
                <span style={{ fontSize: 14 }}>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 500, marginBottom: "0.6rem" }}>
            {activeCategory === "all" ? "All Items" : categories.find((c) => c.id === activeCategory)?.label}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
            {filteredItems.map((item) => {
              const qty = cart[item.id]?.qty || 0;
              return (
                <div key={item.id} className="menu-card" onClick={() => addToCart(item)} style={{ background: "#fff", borderRadius: 14, border: "1px solid #F3D5BE", overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ height: 136, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: "3rem" }}>{item.icon}</span>
                    {item.badge && (
                      <div style={{ position: "absolute", top: 8, left: 8, background: "#F97316", color: "#fff", fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{item.badge}</div>
                    )}
                  </div>
                  <div style={{ padding: "11px 13px" }}>
                    <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, marginBottom: 3, color: "#1C0A00" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#9A6046", marginBottom: 10, lineHeight: 1.5 }}>{item.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#EA580C" }}>${item.price.toFixed(2)}</span>
                      {qty > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFF7ED", borderRadius: 20, padding: "2px 7px" }}>
                          <button onClick={(e) => { e.stopPropagation(); changeCartQty(item.id, -1); }} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #F97316", background: "#fff", cursor: "pointer", fontSize: 12, color: "#F97316", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 14, textAlign: "center", color: "#1C0A00" }}>{qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); changeCartQty(item.id, 1); }} style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: "#F97316", cursor: "pointer", fontSize: 12, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{ background: "#F97316", color: "#fff", border: "none", width: 28, height: 28, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Order Panel */}
        <div style={{ paddingTop: "0.5rem" }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F3D5BE", overflow: "hidden", position: "sticky", top: 72, boxShadow: "0 8px 32px rgba(249,115,22,0.09)" }}>

            <div style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", padding: "1rem 1.5rem", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.05rem" }}>{activeTable || "No Table Selected"}</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 1 }}>
                  {activeTable ? (tableItemCount > 0 ? `${tableItemCount} item${tableItemCount !== 1 ? "s" : ""} across ${tableData?.orders.length ?? 0} batch${(tableData?.orders.length ?? 0) !== 1 ? "es" : ""}` : "No orders yet — add items below") : "Visit URL with ?tableNo=X"}
                </div>
              </div>
              {canBillOut && (
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>🟢 Open</div>
              )}
            </div>

            <div style={{ padding: "0 1.5rem", maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>

              {tableData && tableData.orders.length > 0 && (
                <div style={{ paddingTop: "1rem" }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 600, marginBottom: "0.5rem" }}>Previous Orders</div>
                  {tableData.orders.map((batch, bi) => (
                    <div key={batch.batchId} style={{ marginBottom: "0.6rem", background: "#FFFBF5", borderRadius: 12, padding: "9px 11px", border: "1px solid #FDE8D8" }}>
                      <div style={{ fontSize: 11, color: "#9A6046", marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#EA580C", fontSize: 12 }}>Batch #{bi + 1}</span>
                        <span>{batch.time}</span>
                      </div>
                      {batch.items.map((bItem) => (
                        <div key={bItem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: "0.95rem" }}>{bItem.icon}</span>
                            <span style={{ fontSize: 12, color: "#1C0A00", fontWeight: 500 }}>{bItem.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: "#9A6046" }}>×{bItem.qty}</span>
                            <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 12, color: "#EA580C" }}>${(bItem.price * bItem.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "8px 12px", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9A6046", fontWeight: 500 }}>Running Total</span>
                    <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "#EA580C" }}>${tableSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 1, background: "#FDE8D8", margin: "0.5rem 0 0.75rem" }} />
                </div>
              )}

              <div style={{ paddingTop: tableData && tableData.orders.length > 0 ? 0 : "1rem", paddingBottom: "0.5rem" }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 600, marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Add to Order</span>
                  {cartEntries.length > 0 && (
                    <button onClick={() => setCart({})} style={{ fontSize: 11, color: "#9A6046", background: "#FFF7ED", border: "none", cursor: "pointer", fontFamily: "DM Sans", padding: "2px 9px", borderRadius: 20 }}>Clear</button>
                  )}
                </div>

                {cartEntries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.25rem 0", color: "#C4A18A" }}>
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem", opacity: 0.4 }}>🛒</div>
                    <div style={{ fontSize: 13 }}>{activeTable ? "Tap menu items to add" : "No table — add ?tableNo=X to URL"}</div>
                  </div>
                ) : (
                  <>
                    {cartEntries.map(({ item, qty }) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #FDE8D8" }}>
                        <div style={{ fontSize: "1.4rem", width: 42, height: 42, background: "linear-gradient(135deg,#FFF7ED,#FED7AA)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1C0A00" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#EA580C", fontWeight: 600, marginTop: 1 }}>${item.price.toFixed(2)} each</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 12, color: "#EA580C" }}>${(item.price * qty).toFixed(2)}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFF7ED", borderRadius: 20, padding: "2px 6px" }}>
                            <button onClick={() => changeCartQty(item.id, -1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #F97316", background: "#fff", cursor: "pointer", fontSize: 11, color: "#F97316", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ fontSize: 12, fontWeight: 700, minWidth: 14, textAlign: "center", color: "#1C0A00" }}>{qty}</span>
                            <button onClick={() => changeCartQty(item.id, 1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: "#F97316", cursor: "pointer", fontSize: 11, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "#9A6046" }}>
                      <span>This batch</span>
                      <span style={{ fontWeight: 700, color: "#1C0A00" }}>${cartSubtotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: "0.9rem 1.5rem 1.4rem", borderTop: "1px solid #FDE8D8", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={placeOrder} disabled={!canPlaceOrder} style={{ width: "100%", background: canPlaceOrder ? "linear-gradient(135deg,#F97316,#EA580C)" : "#E5E7EB", color: canPlaceOrder ? "#fff" : "#9CA3AF", border: "none", padding: "12px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: canPlaceOrder ? "pointer" : "default", letterSpacing: "0.4px" }}>
                ✅ Place Order → Add to {activeTable || "Table"}
              </button>
              <button onClick={() => { if (canBillOut) setShowBillout(true); }} disabled={!canBillOut} style={{ width: "100%", background: canBillOut ? "#fff" : "#F9FAFB", color: canBillOut ? "#EA580C" : "#9CA3AF", border: canBillOut ? "2px solid #F97316" : "2px solid #E5E7EB", padding: "11px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: canBillOut ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                🧾 Bill Out — Close {activeTable || "Table"}
                {canBillOut && <span style={{ background: "#FFF7ED", color: "#EA580C", borderRadius: 8, fontSize: 12, padding: "1px 8px", fontWeight: 700 }}>${tableGrand.toFixed(2)}</span>}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* BILL OUT MODAL */}
      {showBillout && activeTable && tableData && (
        <div onClick={() => { if (!billPaid) setShowBillout(false); }} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(28,10,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: "0 24px 64px rgba(249,115,22,0.25)" }}>
            {billPaid ? (
              <div style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.5rem", color: "#EA580C", marginBottom: 8 }}>Bill Settled!</div>
                <div style={{ color: "#9A6046", fontSize: 14 }}>{activeTable} is now closed. Thank you!</div>
              </div>
            ) : (
              <>
                <div style={{ background: "linear-gradient(135deg,#1C0A00,#3D1200)", padding: "1.3rem 2rem", color: "#FED7AA" }}>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.3rem", marginBottom: 3 }}>🧾 Final Bill — {activeTable}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{tableData.orders.length} batch{tableData.orders.length !== 1 ? "es" : ""} · {tableItemCount} item{tableItemCount !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ padding: "1.25rem 2rem", maxHeight: 340, overflowY: "auto" }}>
                  {tableData.orders.map((batch, bi) => (
                    <div key={batch.batchId} style={{ marginBottom: "1rem" }}>
                      <div style={{ fontSize: 11, color: "#9A6046", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Batch #{bi + 1} · {batch.time}</div>
                      {batch.items.map((bItem) => (
                        <div key={bItem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px dashed #FDE8D8" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <span style={{ fontSize: "1.2rem" }}>{bItem.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#1C0A00" }}>{bItem.name}</div>
                              <div style={{ fontSize: 11, color: "#9A6046" }}>×{bItem.qty} × ${bItem.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <div style={{ fontFamily: "Syne", fontWeight: 700, color: "#EA580C", fontSize: 14 }}>${(bItem.price * bItem.qty).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ margin: "0 2rem", background: "#FFFBF5", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 7 }}>
                    <span>Subtotal</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>${tableSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 12 }}>
                    <span>Tax (8%)</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>${tableTax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Syne", fontWeight: 800, fontSize: "1.2rem", paddingTop: 10, borderTop: "2px dashed #F97316" }}>
                    <span>Grand Total</span><span style={{ color: "#EA580C" }}>${tableGrand.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ padding: "1.1rem 2rem 1.6rem", display: "flex", gap: 10 }}>
                  <button onClick={() => setShowBillout(false)} style={{ flex: 1, background: "#fff", color: "#9A6046", border: "1.5px solid #F3D5BE", padding: "12px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
                  <button onClick={confirmBillout} style={{ flex: 2, background: "linear-gradient(135deg,#1C0A00,#3D1200)", color: "#FED7AA", border: "none", padding: "12px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.4px" }}>
                    ✅ Confirm & Pay ${tableGrand.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#9A6046" }}>Loading...</div>}>
      <MenuPage />
    </Suspense>
  );
}