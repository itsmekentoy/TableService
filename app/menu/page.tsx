"use client";
import { useState, useEffect, useRef, useCallback } from "react";

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
  { id: 1, cat: "burgers", name: "Flame Stack Burger", desc: "Double smash patty, aged cheddar, caramelized onions", price: 13.9, icon: "🍔", badge: "Best Seller", bg: "#FFF3E6" },
  { id: 2, cat: "burgers", name: "Crispy Chicken Burger", desc: "Buttermilk-fried thigh, slaw, sriracha mayo", price: 12.5, icon: "🍗", bg: "#FFF3E6" },
  { id: 3, cat: "pizza", name: "Margherita Classica", desc: "San Marzano tomatoes, fresh mozzarella, basil", price: 14.0, icon: "🍕", bg: "#FFF0F0" },
  { id: 4, cat: "pizza", name: "Pepperoni Inferno", desc: "Double pepperoni, chilli oil, smoked cheese", price: 15.5, icon: "🔥", badge: "Spicy", bg: "#FFF0F0" },
  { id: 5, cat: "sushi", name: "Salmon Aburi Roll", desc: "Flame-seared salmon, avocado, truffle mayo", price: 16.9, icon: "🍣", bg: "#F0FBF4" },
  { id: 6, cat: "sushi", name: "Dragon Roll", desc: "Shrimp tempura, cucumber, mango, eel sauce", price: 18.0, icon: "🐉", badge: "Chef Pick", bg: "#F0FBF4" },
  { id: 7, cat: "tacos", name: "Al Pastor Tacos", desc: "Marinated pork, pineapple, cilantro, onion ×3", price: 10.5, icon: "🌮", bg: "#FFFBF0" },
  { id: 8, cat: "tacos", name: "Baja Fish Tacos", desc: "Beer-battered cod, chipotle crema, pickled slaw ×3", price: 11.5, icon: "🐟", bg: "#FFFBF0" },
  { id: 9, cat: "drinks", name: "Mango Lassi", desc: "House-made yogurt, Alphonso mango, cardamom", price: 5.5, icon: "🥭", bg: "#FFF8E6" },
  { id: 10, cat: "drinks", name: "Yuzu Lemonade", desc: "Fresh pressed lemon, yuzu syrup, soda", price: 4.9, icon: "🍋", bg: "#FFFFF0" },
  { id: 11, cat: "desserts", name: "Churro Sundae", desc: "Warm churros, vanilla ice cream, caramel drizzle", price: 8.5, icon: "🍮", badge: "New", bg: "#FFF5F0" },
  { id: 12, cat: "desserts", name: "Mochi Trio", desc: "Strawberry, matcha, and black sesame mochi", price: 7.9, icon: "🍡", bg: "#F5F0FF" },
];

const ssSlides = [
  { tag: "Today's Special", title: "Flame Stack Burger", sub: "Double smash patty stacked with aged cheddar and our secret sauce", bg: "linear-gradient(135deg,#7C2D12,#EA580C)" },
  { tag: "Chef's Pick", title: "Dragon Roll", sub: "Flame-seared salmon and mango on a bed of seasoned sushi rice", bg: "linear-gradient(135deg,#134E4A,#0F766E)" },
  { tag: "Just Dropped", title: "Churro Sundae", sub: "Crispy warm churros with vanilla ice cream and housemade caramel", bg: "linear-gradient(135deg,#78350F,#D97706)" },
  { tag: "Crowd Favourite", title: "Al Pastor Tacos", sub: "Slow-roasted pork marinated in achiote and pineapple, served three ways", bg: "linear-gradient(135deg,#1E1B4B,#5B21B6)" },
];

const IDLE_SECONDS = 15;

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState({});
  const [screensaver, setScreensaver] = useState(false);
  const [showBillout, setShowBillout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const idleTimer = useRef<NodeJS.Timeout>();
  const slideTimer = useRef<NodeJS.Timeout>();

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setScreensaver(true), IDLE_SECONDS * 1000);
  }, []);

  const stopScreensaver = () => {
    setScreensaver(false);
    clearInterval(slideTimer.current);
    resetIdle();
  };

  useEffect(() => {
    resetIdle();
    const events = ["mousemove", "keydown", "touchstart", "click"];
    events.forEach((e) => document.addEventListener(e, resetIdle));
    return () => {
      clearTimeout(idleTimer.current);
      events.forEach((e) => document.removeEventListener(e, resetIdle));
    };
  }, [resetIdle]);

  useEffect(() => {
    if (screensaver) {
      setCurrentSlide(0);
      slideTimer.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ssSlides.length);
      }, 4000);
    } else {
      clearInterval(slideTimer.current);
    }
    return () => clearInterval(slideTimer.current);
  }, [screensaver]);

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
    resetIdle();
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const qty = (prev[id]?.qty || 0) + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], qty } };
    });
    resetIdle();
  };

  const clearCart = () => {
    setCart({});
    resetIdle();
  };

  const openBillout = () => { setShowBillout(true); resetIdle(); };
  const confirmOrder = () => { setOrderPlaced(true); setTimeout(() => { setOrderPlaced(false); setShowBillout(false); setCart({}); }, 2500); };
  const checkout = () => { openBillout(); };

  const filteredItems = activeCategory === "all" ? menuItems : menuItems.filter((m) => m.cat === activeCategory);
  const cartEntries = Object.values(cart);
  const subtotal = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const totalQty = cartEntries.reduce((s, e) => s + e.qty, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFFBF5; font-family: 'DM Sans', sans-serif; }
        .ss-slide-enter { opacity: 0; }
        .ss-slide-active { opacity: 1; transition: opacity 1.2s ease; }
      `}</style>

      {/* SCREENSAVER */}
      {screensaver && (
        <div
          onClick={stopScreensaver}
          style={{
            position: "fixed", inset: 0, zIndex: 1000, background: "#0A0400",
            display: "flex", alignItems: "flex-end", cursor: "pointer", overflow: "hidden",
          }}
        >
          {ssSlides.map((slide, i) => (
            <div
              key={i}
              style={{
                position: "absolute", inset: 0,
                background: slide.bg,
                opacity: i === currentSlide ? 1 : 0,
                transition: "opacity 1.2s ease",
                display: "flex", alignItems: "flex-end",
              }}
            >
              <div style={{ padding: "3rem 4rem", color: "#fff", maxWidth: 600 }}>
                <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#FED7AA", fontFamily: "Syne", marginBottom: 12 }}>
                  {slide.tag}
                </div>
                <div style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 1.05, marginBottom: "1rem" }}>
                  {slide.title}
                </div>
                <div style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)" }}>{slide.sub}</div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
            {ssSlides.map((_, i) => (
              <div key={i} style={{
                width: i === currentSlide ? 24 : 8, height: 8,
                borderRadius: i === currentSlide ? 4 : "50%",
                background: i === currentSlide ? "#F97316" : "rgba(255,255,255,0.3)",
                transition: "all .4s",
              }} />
            ))}
          </div>

          {/* Hint */}
          <div style={{ position: "absolute", top: "2rem", right: "2rem", color: "rgba(255,255,255,0.5)", fontSize: 13, display: "flex", alignItems: "center", gap: 8, zIndex: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            Tap anywhere to continue
          </div>
        </div>
      )}

      {/* APP */}
      <div style={{ minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #F3D5BE", padding: "0 2rem",
          height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(249,115,22,0.06)",
        }}>
          <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.5rem", color: "#EA580C" }}>
            Zest<span style={{ color: "#1C0A00" }}>Bite</span>
          </div>
          <button
            onClick={() => document.getElementById("cart-section")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "#F97316", color: "#fff", border: "none", padding: "10px 20px",
              borderRadius: 50, fontFamily: "DM Sans", fontWeight: 500, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            🛒 Cart
            <span style={{
              background: "#fff", color: "#EA580C", borderRadius: "50%",
              width: 20, height: 20, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {totalQty}
            </span>
          </button>
        </header>

        {/* Main Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", maxWidth: 1300, margin: "0 auto", padding: "2rem 2.5rem" }}>
          {/* Left: Categories + Menu */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 500, marginBottom: "1rem" }}>Browse by category</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCategory(c.id); resetIdle(); }}
                  style={{
                    padding: "9px 20px", borderRadius: 50,
                    border: `1.5px solid ${activeCategory === c.id ? "#F97316" : "#F3D5BE"}`,
                    background: activeCategory === c.id ? "#F97316" : "#fff",
                    color: activeCategory === c.id ? "#fff" : "#9A6046",
                    fontFamily: "DM Sans", fontSize: 14, fontWeight: 500, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{c.icon}</span>{c.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 500, marginBottom: "1rem" }}>
              {activeCategory === "all" ? "All Items" : categories.find((c) => c.id === activeCategory)?.label}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18, marginBottom: "2rem" }}>
              {filteredItems.map((item) => {
                const qty = cart[item.id]?.qty || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    style={{
                      background: "#fff", borderRadius: 14, border: "1px solid #F3D5BE",
                      overflow: "hidden", cursor: "pointer", transition: "transform .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <div style={{ height: 150, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontSize: "3.5rem" }}>{item.icon}</span>
                      {item.badge && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "#F97316", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                          {item.badge}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#9A6046", marginBottom: 12, lineHeight: 1.5 }}>{item.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#EA580C" }}>${item.price.toFixed(2)}</span>
                        {qty > 0 ? (
                          <span style={{ background: "#FFF7ED", color: "#EA580C", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                            {qty} in cart
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                            style={{
                              background: "#F97316", color: "#fff", border: "none",
                              width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart */}
          <div id="cart-section" style={{ paddingTop: "2.5rem" }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F3D5BE", padding: "1.75rem 1.5rem", position: "sticky", top: 88, boxShadow: "0 8px 32px rgba(249,115,22,0.10)" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.3rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "2px solid #FDE8D8" }}>
                <span>🧾 Your Order</span>
                <button onClick={clearCart} style={{ fontSize: 12, color: "#9A6046", background: "#FFF7ED", border: "none", cursor: "pointer", fontFamily: "DM Sans", padding: "4px 12px", borderRadius: 20 }}>
                  Clear all
                </button>
              </div>

              {cartEntries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "#9A6046" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.4 }}>🛒</div>
                  <div style={{ fontSize: 14 }}>Your cart is empty</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: "#C4A18A" }}>Add items from the menu</div>
                </div>
              ) : (
                cartEntries.map(({ item, qty }) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #FDE8D8" }}>
                    <div style={{ fontSize: "1.6rem", width: 48, height: 48, background: "linear-gradient(135deg,#FFF7ED,#FED7AA)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(249,115,22,0.10)" }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1C0A00" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#EA580C", fontWeight: 600, marginTop: 2 }}>${item.price.toFixed(2)} each</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#EA580C" }}>${(item.price * qty).toFixed(2)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF7ED", borderRadius: 20, padding: "3px 8px" }}>
                        <button onClick={() => changeQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #F97316", background: "#fff", cursor: "pointer", fontSize: 13, color: "#F97316", fontWeight: 700, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: "center", color: "#1C0A00" }}>{qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: "#F97316", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 700, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cartEntries.length > 0 && (
                <div style={{ paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: 10, background: "#FFFBF5", borderRadius: 12, padding: "1rem 1rem 0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046" }}>
                    <span>Subtotal</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046" }}>
                    <span>Delivery</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>$2.50</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Syne", fontWeight: 700, fontSize: "1.1rem", paddingTop: 10, borderTop: "1.5px dashed #F97316", marginTop: 4 }}>
                    <span>Total</span><span style={{ color: "#EA580C" }}>${(subtotal + 2.5).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={cartEntries.length > 0 ? checkout : undefined}
                disabled={cartEntries.length === 0}
                style={{
                  width: "100%", background: cartEntries.length > 0 ? "linear-gradient(135deg,#F97316,#EA580C)" : "#E5E7EB",
                  color: cartEntries.length > 0 ? "#fff" : "#9CA3AF",
                  border: "none", padding: 14, borderRadius: 12,
                  fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: cartEntries.length > 0 ? "pointer" : "default",
                  marginTop: "1rem", letterSpacing: "0.5px",
                }}
              >
                Place Order →
              </button>

              {/* BILL OUT BUTTON */}
              <button
                onClick={cartEntries.length > 0 ? openBillout : undefined}
                disabled={cartEntries.length === 0}
                style={{
                  width: "100%",
                  background: cartEntries.length > 0 ? "#fff" : "#F9FAFB",
                  color: cartEntries.length > 0 ? "#EA580C" : "#9CA3AF",
                  border: cartEntries.length > 0 ? "2px solid #F97316" : "2px solid #E5E7EB",
                  padding: "12px 14px", borderRadius: 12,
                  fontFamily: "Syne", fontWeight: 700, fontSize: 15,
                  cursor: cartEntries.length > 0 ? "pointer" : "default",
                  marginTop: "0.6rem", letterSpacing: "0.5px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                🧾 Bill Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BILL OUT MODAL */}
      {showBillout && (
        <div
          onClick={() => !orderPlaced && setShowBillout(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000, background: "rgba(28,10,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480,
              overflow: "hidden", boxShadow: "0 24px 64px rgba(249,115,22,0.2)",
            }}
          >
            {orderPlaced ? (
              <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.5rem", color: "#EA580C", marginBottom: 8 }}>Order Confirmed!</div>
                <div style={{ color: "#9A6046", fontSize: 14 }}>Your food is being prepared. Est. delivery: 25–35 mins.</div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", padding: "1.5rem 2rem", color: "#fff" }}>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.4rem", marginBottom: 4 }}>🧾 Your Bill</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>Review your order before checkout</div>
                </div>

                {/* Bill Items */}
                <div style={{ padding: "1.25rem 2rem", maxHeight: 320, overflowY: "auto" }}>
                  {cartEntries.map(({ item, qty }) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #FDE8D8" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1C0A00" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#9A6046" }}>x{qty} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "Syne", fontWeight: 700, color: "#EA580C", fontSize: 14 }}>
                        ${(item.price * qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Totals */}
                <div style={{ margin: "0 2rem", background: "#FFFBF5", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 8 }}>
                    <span>Subtotal</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 8 }}>
                    <span>Delivery Fee</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>$2.50</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 12 }}>
                    <span>Tax (8%)</span><span style={{ fontWeight: 600, color: "#1C0A00" }}>${(subtotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Syne", fontWeight: 800, fontSize: "1.2rem", paddingTop: 10, borderTop: "2px dashed #F97316" }}>
                    <span>Grand Total</span>
                    <span style={{ color: "#EA580C" }}>${(subtotal + 2.5 + subtotal * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div style={{ padding: "1.25rem 2rem 1.75rem", display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowBillout(false)}
                    style={{
                      flex: 1, background: "#fff", color: "#9A6046", border: "1.5px solid #F3D5BE",
                      padding: "12px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700,
                      fontSize: 14, cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={confirmOrder}
                    style={{
                      flex: 2, background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff",
                      border: "none", padding: "12px", borderRadius: 12,
                      fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ✅ Confirm & Pay ${(subtotal + 2.5 + subtotal * 0.08).toFixed(2)}
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