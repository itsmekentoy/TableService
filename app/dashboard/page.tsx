"use client";
import { useState, useEffect, useRef, Suspense } from "react";

const TAX_RATE = 0.08;
const TABLES = ["Table 1","Table 2","Table 3","Table 4","Table 5","Table 6","Table 7","Table 8","Takeaway"];

type OrderStatus = "new" | "preparing" | "ready" | "served";
type OrderItem = { id: number; name: string; icon: string; price: number; qty: number };
type OrderBatch = { batchId: number; time: string; status: OrderStatus; items: OrderItem[] };
type TableData = { orders: OrderBatch[] };
type TablesState = Record<string, TableData>;

const calcSubtotal = (orders: { items: { price: number; qty: number }[] }[]) =>
  orders.reduce((s, b) => s + b.items.reduce((bs: number, i: { price: number; qty: number }) => bs + i.price * i.qty, 0), 0);

const STATUS_COLORS: Record<OrderStatus, { bg: string; border: string; text: string; dot: string }> = {
  new:       { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", dot: "#F59E0B" },
  preparing: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E3A8A", dot: "#3B82F6" },
  ready:     { bg: "#D1FAE5", border: "#10B981", text: "#065F46", dot: "#10B981" },
  served:    { bg: "#F3F4F6", border: "#9CA3AF", text: "#4B5563", dot: "#9CA3AF" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New Order", preparing: "Preparing", ready: "Ready", served: "Served",
};

const createDemoTables = (): TablesState => ({
  "Table 1": {
    orders: [
      { batchId: 1001, time: "12:05 AM", status: "served",
        items: [{ id:1, name:"Flame Stack Burger", icon:"🍔", price:13.9, qty:2 },
                { id:9, name:"Mango Lassi", icon:"🥭", price:5.5, qty:2 }] },
      { batchId: 1002, time: "12:38 AM", status: "new",
        items: [{ id:11, name:"Churro Sundae", icon:"🍮", price:8.5, qty:2 }] },
    ],
  },
  "Table 3": {
    orders: [
      { batchId: 2001, time: "12:20 AM", status: "preparing",
        items: [{ id:3, name:"Margherita Classica", icon:"🍕", price:14.0, qty:1 },
                { id:4, name:"Pepperoni Inferno", icon:"🔥", price:15.5, qty:1 },
                { id:10, name:"Yuzu Lemonade", icon:"🍋", price:4.9, qty:2 }] },
    ],
  },
  "Table 5": {
    orders: [
      { batchId: 3001, time: "12:45 AM", status: "new",
        items: [{ id:5, name:"Salmon Aburi Roll", icon:"🍣", price:16.9, qty:2 },
                { id:6, name:"Dragon Roll", icon:"🐉", price:18.0, qty:1 }] },
    ],
  },
  "Table 7": {
    orders: [
      { batchId: 4001, time: "11:50 AM", status: "ready",
        items: [{ id:7, name:"Al Pastor Tacos", icon:"🌮", price:10.5, qty:3 },
                { id:8, name:"Baja Fish Tacos", icon:"🐟", price:11.5, qty:2 }] },
    ],
  },
  "Takeaway": {
    orders: [
      { batchId: 5001, time: "12:55 AM", status: "new",
        items: [{ id:2, name:"Crispy Chicken Burger", icon:"🍗", price:12.5, qty:1 },
                { id:12, name:"Mochi Trio", icon:"🍡", price:7.9, qty:1 }] },
    ],
  },
});

// ─── KEY FIX: All localStorage access is deferred to useEffect (client-only) ─

function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [tables, setTables] = useState<TablesState>({});
  const [seenBatches, setSeenBatches] = useState<Set<number>>(new Set());
  const [newBadges, setNewBadges] = useState<Record<string, number>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── STEP 1: Mount + load from localStorage (client-only, no SSR) ──────────
  useEffect(() => {
    const stored = localStorage.getItem("zestbite_tables");
    if (stored) {
      try {
        setTables(JSON.parse(stored) as TablesState);
      } catch {
        setTables(createDemoTables());
        localStorage.setItem("zestbite_tables", JSON.stringify(createDemoTables()));
      }
    } else {
      const demo = createDemoTables();
      setTables(demo);
      localStorage.setItem("zestbite_tables", JSON.stringify(demo));
    }
    setMounted(true);
  }, []);

  // ── STEP 2: Poll localStorage every 3s for new orders from menu page ──────
  useEffect(() => {
    if (!mounted) return;
    pollRef.current = setInterval(() => {
      const stored = localStorage.getItem("zestbite_tables");
      if (!stored) return;
      try {
        const incoming = JSON.parse(stored) as TablesState;
        setTables((prev) => {
          const newBadgeUpdates: Record<string, number> = {};
          Object.entries(incoming).forEach(([tName, tData]) => {
            tData.orders.forEach((batch) => {
              const alreadyExists = prev[tName]?.orders.some(b => b.batchId === batch.batchId);
              if (!seenBatches.has(batch.batchId) && !alreadyExists) {
                newBadgeUpdates[tName] = (newBadgeUpdates[tName] || 0) + 1;
              }
            });
          });
          if (Object.keys(newBadgeUpdates).length > 0) {
            setNewBadges((b) => {
              const next = { ...b };
              Object.entries(newBadgeUpdates).forEach(([t, c]) => { next[t] = (next[t] || 0) + c; });
              return next;
            });
          }
          const merged = { ...prev };
          Object.entries(incoming).forEach(([tName, tData]) => {
            const existing = merged[tName] || { orders: [] };
            const existingIds = new Set(existing.orders.map(b => b.batchId));
            const newBatches = tData.orders
              .filter(b => !existingIds.has(b.batchId))
              .map((b): OrderBatch => ({ ...b, status: "new" as OrderStatus }));
            if (newBatches.length > 0) {
              merged[tName] = { orders: [...existing.orders, ...newBatches] };
            }
          });
          return merged;
        });
      } catch {}
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [mounted, seenBatches]);

  const clearBadge = (tableName: string) => {
    setNewBadges((prev) => { const n = { ...prev }; delete n[tableName]; return n; });
    const tData = tables[tableName];
    if (tData) {
      setSeenBatches((prev) => {
        const next = new Set(prev);
        tData.orders.forEach(b => next.add(b.batchId));
        return next;
      });
    }
  };

  const updateBatchStatus = (tableName: string, batchId: number, status: OrderStatus) => {
    setTables((prev) => {
      const updated = {
        ...prev,
        [tableName]: {
          orders: prev[tableName].orders.map(b => b.batchId === batchId ? { ...b, status } : b),
        },
      };
      localStorage.setItem("zestbite_tables", JSON.stringify(updated));
      return updated;
    });
  };

  const billOutTable = (tableName: string) => {
    setTables((prev) => {
      const n = { ...prev };
      delete n[tableName];
      localStorage.setItem("zestbite_tables", JSON.stringify(n));
      return n;
    });
    setNewBadges((prev) => { const n = { ...prev }; delete n[tableName]; return n; });
    if (selectedTable === tableName) setSelectedTable(null);
  };

  // ── STEP 3: Render nothing until mounted to avoid SSR/client mismatch ─────
  if (!mounted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#9A6046" }}>
        Loading dashboard...
      </div>
    );
  }

  // Derived — only runs client-side after mount
  const openTables = Object.keys(tables);
  const totalNewOrders = Object.values(tables).reduce(
    (s, t) => s + t.orders.filter(b => b.status === "new").length, 0
  );
  const totalRevenue = Object.values(tables).reduce((s, t) => s + calcSubtotal(t.orders), 0);
  const selectedTableData = selectedTable ? tables[selectedTable] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFFBF5; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FED7AA; border-radius: 4px; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes badge-pop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        .table-card { transition: transform .18s, box-shadow .18s; cursor: pointer; }
        .table-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(249,115,22,0.13) !important; }
        .status-btn { transition: all .15s; }
        .status-btn:hover { filter: brightness(0.93); transform: scale(1.03); }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#fff", borderBottom: "1px solid #F3D5BE", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(249,115,22,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.4rem", color: "#EA580C" }}>
            Zest<span style={{ color: "#1C0A00" }}>Bite</span>
          </div>
          <div style={{ width: 1, height: 24, background: "#F3D5BE" }} />
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1rem", color: "#9A6046" }}>Kitchen Dashboard</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {totalNewOrders > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 20, padding: "6px 14px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", display: "inline-block", animation: "pulse-dot 1.2s infinite" }} />
              <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#92400E" }}>
                {totalNewOrders} new order{totalNewOrders !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#FFF7ED", border: "1px solid #FDE8D8", borderRadius: 20, padding: "5px 14px", fontSize: 13, color: "#9A6046", fontWeight: 500 }}>
              <span style={{ fontFamily: "Syne", fontWeight: 700, color: "#EA580C" }}>{openTables.length}</span> open table{openTables.length !== 1 ? "s" : ""}
            </div>
            <div style={{ background: "#FFF7ED", border: "1px solid #FDE8D8", borderRadius: 20, padding: "5px 14px", fontSize: 13, color: "#9A6046", fontWeight: 500 }}>
              Revenue <span style={{ fontFamily: "Syne", fontWeight: 700, color: "#EA580C" }}>${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <a href="/menu" style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 20, fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            ← Menu
          </a>
        </div>
      </header>

      {/* MAIN */}
      <div style={{ display: "grid", gridTemplateColumns: selectedTable ? "1fr 420px" : "1fr", gap: "1.5rem", maxWidth: 1400, margin: "0 auto", padding: "1.75rem 2rem" }}>

        {/* LEFT: All tables grid */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9A6046", fontWeight: 600 }}>All Tables</div>
            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
              {(Object.entries(STATUS_COLORS) as [OrderStatus, typeof STATUS_COLORS[OrderStatus]][]).map(([s, c]) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20, padding: "3px 10px", color: c.text, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
                  {STATUS_LABELS[s]}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {TABLES.map((tName) => {
              const tData = tables[tName];
              const isOpen = !!tData;
              const isSelected = selectedTable === tName;
              const newCount = newBadges[tName] || 0;
              const hasNew = tData ? tData.orders.some(b => b.status === "new") : false;
              const subtotal = tData ? calcSubtotal(tData.orders) : 0;
              const itemCount = tData ? tData.orders.reduce((s, b) => s + b.items.reduce((bs, i) => bs + i.qty, 0), 0) : 0;
              const batchCount = tData ? tData.orders.length : 0;

              return (
                <div
                  key={tName}
                  className="table-card"
                  onClick={() => {
                    setSelectedTable(isSelected ? null : tName);
                    if (newCount > 0) clearBadge(tName);
                  }}
                  style={{
                    background: "#fff", borderRadius: 16, padding: "1.1rem 1.25rem", position: "relative",
                    border: isSelected ? "2px solid #F97316" : isOpen ? "1.5px solid #FDE8D8" : "1.5px solid #F3D5BE",
                    boxShadow: isSelected ? "0 0 0 3px rgba(249,115,22,0.15)" : isOpen ? "0 4px 16px rgba(249,115,22,0.08)" : "none",
                    opacity: isOpen ? 1 : 0.5,
                  }}
                >
                  {/* Red badge for new batches */}
                  {newCount > 0 && (
                    <div style={{ position: "absolute", top: -8, right: -8, background: "#EF4444", color: "#fff", borderRadius: "50%", width: 22, height: 22, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne", boxShadow: "0 2px 8px rgba(239,68,68,0.4)", animation: "badge-pop .3s ease", zIndex: 2 }}>
                      {newCount}
                    </div>
                  )}

                  {/* Pulsing amber dot for new status */}
                  {hasNew && (
                    <div style={{ position: "absolute", top: 14, right: newCount > 0 ? 30 : 14 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "inline-block", animation: "pulse-dot 1.2s infinite" }} />
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1rem", color: "#1C0A00" }}>{tName}</div>
                      {isOpen ? (
                        <div style={{ fontSize: 12, color: "#9A6046", marginTop: 2 }}>
                          {batchCount} batch{batchCount !== 1 ? "es" : ""} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#C4A18A", marginTop: 2 }}>Available</div>
                      )}
                    </div>
                    {isOpen && (
                      <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1rem", color: "#EA580C" }}>${subtotal.toFixed(2)}</div>
                    )}
                  </div>

                  {isOpen && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                      {tData.orders.map((batch, bi) => {
                        const sc = STATUS_COLORS[batch.status];
                        return (
                          <div key={batch.batchId} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: sc.text, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block", animation: batch.status === "new" ? "pulse-dot 1.2s infinite" : "none" }} />
                            Batch #{bi + 1} — {STATUS_LABELS[batch.status]}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isOpen && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #FDE8D8" }}>
                      <div style={{ fontSize: 11, color: "#9A6046" }}>
                        Last: {tData.orders[tData.orders.length - 1]?.time}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "Syne", fontWeight: 700, color: isSelected ? "#EA580C" : "#9A6046" }}>
                        {isSelected ? "Viewing ↗" : "View orders →"}
                      </div>
                    </div>
                  )}

                  {!isOpen && (
                    <div style={{ textAlign: "center", paddingTop: 8, fontSize: 12, color: "#C4A18A" }}>No active orders</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Selected table detail panel */}
        {selectedTable && selectedTableData && (
          <div style={{ animation: "slide-in .25s ease" }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F3D5BE", overflow: "hidden", position: "sticky", top: 80, boxShadow: "0 8px 32px rgba(249,115,22,0.10)" }}>

              <div style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", padding: "1.1rem 1.5rem", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.1rem" }}>{selectedTable}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 1 }}>
                    {selectedTableData.orders.length} batch{selectedTableData.orders.length !== 1 ? "es" : ""} · ${calcSubtotal(selectedTableData.orders).toFixed(2)} subtotal
                  </div>
                </div>
                <button onClick={() => setSelectedTable(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontFamily: "Syne", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ×
                </button>
              </div>

              <div style={{ padding: "1rem 1.5rem", maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
                {selectedTableData.orders.map((batch, bi) => {
                  const sc = STATUS_COLORS[batch.status];
                  const batchTotal = batch.items.reduce((s, i) => s + i.price * i.qty, 0);
                  return (
                    <div key={batch.batchId} style={{ marginBottom: "1rem", borderRadius: 14, border: `1.5px solid ${sc.border}`, overflow: "hidden" }}>

                      <div style={{ background: sc.bg, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, display: "inline-block", animation: batch.status === "new" ? "pulse-dot 1.2s infinite" : "none" }} />
                          <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: sc.text }}>Batch #{bi + 1}</span>
                          <span style={{ background: sc.border, color: "#fff", borderRadius: 20, fontSize: 10, padding: "2px 8px", fontWeight: 700 }}>
                            {STATUS_LABELS[batch.status]}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: sc.text, fontWeight: 500 }}>{batch.time}</div>
                      </div>

                      <div style={{ padding: "8px 14px" }}>
                        {batch.items.map((item) => (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #FDE8D8" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C0A00" }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: "#9A6046" }}>×{item.qty} × ${item.price.toFixed(2)}</div>
                              </div>
                            </div>
                            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#EA580C" }}>
                              ${(item.price * item.qty).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 7, fontSize: 13, fontWeight: 600, color: "#9A6046" }}>
                          Batch total: <span style={{ fontFamily: "Syne", color: "#EA580C", marginLeft: 6 }}>${batchTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ padding: "8px 14px 12px", display: "flex", gap: 6 }}>
                        {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([s, label]) => (
                          <button
                            key={s}
                            className="status-btn"
                            onClick={() => updateBatchStatus(selectedTable, batch.batchId, s)}
                            style={{
                              flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "Syne", cursor: "pointer",
                              background: batch.status === s ? STATUS_COLORS[s].border : "#fff",
                              color: batch.status === s ? "#fff" : STATUS_COLORS[s].text,
                              border: `1.5px solid ${STATUS_COLORS[s].border}`,
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "1rem 1.5rem 1.5rem", borderTop: "1px solid #FDE8D8" }}>
                <div style={{ background: "#FFFBF5", borderRadius: 12, padding: "0.9rem 1rem", marginBottom: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 6 }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: "#1C0A00" }}>${calcSubtotal(selectedTableData.orders).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9A6046", marginBottom: 10 }}>
                    <span>Tax (8%)</span>
                    <span style={{ fontWeight: 600, color: "#1C0A00" }}>${(calcSubtotal(selectedTableData.orders) * TAX_RATE).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Syne", fontWeight: 800, fontSize: "1.1rem", paddingTop: 9, borderTop: "2px dashed #F97316" }}>
                    <span>Grand Total</span>
                    <span style={{ color: "#EA580C" }}>${(calcSubtotal(selectedTableData.orders) * (1 + TAX_RATE)).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => billOutTable(selectedTable)}
                  style={{ width: "100%", background: "linear-gradient(135deg,#1C0A00,#3D1200)", color: "#FED7AA", border: "none", padding: "13px", borderRadius: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.4px" }}
                >
                  🧾 Bill Out & Close {selectedTable} — ${(calcSubtotal(selectedTableData.orders) * (1 + TAX_RATE)).toFixed(2)}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {openTables.length === 0 && (
        <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#C4A18A" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.4 }}>🍽️</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1.25rem", marginBottom: 8 }}>No open tables</div>
          <div style={{ fontSize: 14 }}>All tables are clear. Orders will appear here when placed from the menu.</div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#9A6046" }}>
        Loading dashboard...
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}