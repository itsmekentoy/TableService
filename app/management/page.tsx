"use client";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "dashboard" | "categories" | "items" | "attributes" | "tables" | "users" | "settings" | "ads";
type AdStatus = "active" | "paused" | "scheduled" | "ended";
type TableStatus = "occupied" | "available" | "reserved";
type UserRole = "admin" | "manager" | "staff";
type OrderStatus = "open" | "paid" | "busy";

// ─── Data ─────────────────────────────────────────────────────────────────────
const categories = [
  { id: "burgers",  label: "Burgers",  icon: "🍔", items: 2, active: true  },
  { id: "pizza",    label: "Pizza",    icon: "🍕", items: 2, active: true  },
  { id: "sushi",    label: "Sushi",    icon: "🍣", items: 2, active: true  },
  { id: "tacos",    label: "Tacos",    icon: "🌮", items: 2, active: true  },
  { id: "drinks",   label: "Drinks",   icon: "🥤", items: 2, active: true  },
  { id: "desserts", label: "Desserts", icon: "🍰", items: 2, active: false },
];

const menuItems = [
  { id: 1,  name: "Flame Stack Burger",    cat: "Burgers",  price: 13.9,  icon: "🍔", bg: "#FFF3E6", badge: "Best Seller" },
  { id: 2,  name: "Crispy Chicken Burger", cat: "Burgers",  price: 12.5,  icon: "🍗", bg: "#FFF3E6" },
  { id: 3,  name: "Margherita Classica",   cat: "Pizza",    price: 14.0,  icon: "🍕", bg: "#FFF0F0" },
  { id: 4,  name: "Pepperoni Inferno",     cat: "Pizza",    price: 15.5,  icon: "🔥", bg: "#FFF0F0", badge: "Spicy" },
  { id: 5,  name: "Salmon Aburi Roll",     cat: "Sushi",    price: 16.9,  icon: "🍣", bg: "#F0FBF4" },
  { id: 6,  name: "Dragon Roll",           cat: "Sushi",    price: 18.0,  icon: "🐉", bg: "#F0FBF4", badge: "Chef Pick" },
  { id: 7,  name: "Al Pastor Tacos",       cat: "Tacos",    price: 10.5,  icon: "🌮", bg: "#FFFBF0" },
  { id: 8,  name: "Baja Fish Tacos",       cat: "Tacos",    price: 11.5,  icon: "🐟", bg: "#FFFBF0" },
  { id: 9,  name: "Mango Lassi",           cat: "Drinks",   price: 5.5,   icon: "🥭", bg: "#FFF8E6" },
  { id: 10, name: "Yuzu Lemonade",         cat: "Drinks",   price: 4.9,   icon: "🍋", bg: "#FFFFF0" },
  { id: 11, name: "Churro Sundae",         cat: "Desserts", price: 8.5,   icon: "🍮", bg: "#FFF5F0", badge: "New" },
  { id: 12, name: "Mochi Trio",            cat: "Desserts", price: 7.9,   icon: "🍡", bg: "#F5F0FF" },
];

const weeklyRevenue = [
  { day: "Mon", thisWeek: 2800, lastWeek: 2400 },
  { day: "Tue", thisWeek: 3200, lastWeek: 2900 },
  { day: "Wed", thisWeek: 2600, lastWeek: 3100 },
  { day: "Thu", thisWeek: 3800, lastWeek: 3300 },
  { day: "Fri", thisWeek: 4100, lastWeek: 3700 },
  { day: "Sat", thisWeek: 5200, lastWeek: 4800 },
  { day: "Sun", thisWeek: 3847, lastWeek: 4100 },
];

const catBreakdown = [
  { name: "🍔 Burgers",  pct: 28, color: "#F97316" },
  { name: "🍕 Pizza",    pct: 22, color: "#EA580C" },
  { name: "🍣 Sushi",    pct: 20, color: "#0F766E" },
  { name: "🌮 Tacos",    pct: 15, color: "#7C3AED" },
  { name: "🥤 Drinks",   pct: 9,  color: "#2563EB" },
  { name: "🍰 Desserts", pct: 6,  color: "#D97706" },
];

const recentOrders: { id: string; table: string; items: string; amount: string; status: OrderStatus; time: string }[] = [
  { id: "#1042", table: "Table 3",  items: "Flame Stack ×2, Lassi ×1",       amount: "$33.30", status: "open", time: "12:41 PM" },
  { id: "#1041", table: "Table 7",  items: "Dragon Roll ×1, Yuzu ×2",        amount: "$26.70", status: "paid", time: "12:38 PM" },
  { id: "#1040", table: "Table 1",  items: "Al Pastor ×3, Churro ×1",        amount: "$40.00", status: "open", time: "12:30 PM" },
  { id: "#1039", table: "Table 11", items: "Pepperoni ×2, Mochi ×1",         amount: "$38.90", status: "busy", time: "12:22 PM" },
  { id: "#1038", table: "Table 5",  items: "Baja Fish ×2, Mango Lassi ×1",   amount: "$28.50", status: "paid", time: "12:15 PM" },
];

const tableData: { num: number; seats: number; status: TableStatus; revenue?: string; time?: string }[] = [
  { num: 1,  seats: 4, status: "occupied", revenue: "$62.40" },
  { num: 2,  seats: 2, status: "available" },
  { num: 3,  seats: 4, status: "occupied", revenue: "$33.30" },
  { num: 4,  seats: 6, status: "reserved", time: "1:00 PM" },
  { num: 5,  seats: 2, status: "occupied", revenue: "$28.50" },
  { num: 6,  seats: 4, status: "available" },
  { num: 7,  seats: 4, status: "occupied", revenue: "$26.70" },
  { num: 8,  seats: 8, status: "reserved", time: "2:30 PM" },
  { num: 9,  seats: 2, status: "occupied", revenue: "$15.80" },
  { num: 10, seats: 4, status: "available" },
  { num: 11, seats: 4, status: "occupied", revenue: "$38.90" },
  { num: 12, seats: 6, status: "occupied", revenue: "$55.60" },
  { num: 13, seats: 2, status: "occupied", revenue: "$21.40" },
  { num: 14, seats: 4, status: "reserved", time: "3:00 PM" },
  { num: 15, seats: 4, status: "occupied", revenue: "$44.20" },
  { num: 16, seats: 6, status: "available" },
];

const users: { name: string; email: string; role: UserRole; status: string; last: string; color: string }[] = [
  { name: "Alex Ortega",  email: "alex@zestbite.com",  role: "admin",   status: "Active",   last: "Just now",   color: "#F97316" },
  { name: "Maria Santos", email: "maria@zestbite.com", role: "manager", status: "Active",   last: "2 min ago",  color: "#2563EB" },
  { name: "Jake Reyes",   email: "jake@zestbite.com",  role: "staff",   status: "Active",   last: "15 min ago", color: "#0F766E" },
  { name: "Chloe Tan",    email: "chloe@zestbite.com", role: "staff",   status: "Active",   last: "1 hr ago",   color: "#7C3AED" },
  { name: "Dan Lim",      email: "dan@zestbite.com",   role: "manager", status: "Inactive", last: "Yesterday",  color: "#DC2626" },
  { name: "Rina Cruz",    email: "rina@zestbite.com",  role: "staff",   status: "Active",   last: "3 hrs ago",  color: "#D97706" },
];

const attributes = {
  badges:    [{ name: "Best Seller", color: "#F97316", count: 1 }, { name: "Spicy", color: "#DC2626", count: 1 }, { name: "Chef Pick", color: "#0F766E", count: 1 }, { name: "New", color: "#7C3AED", count: 1 }, { name: "No Badge", color: "#9CA3AF", count: 8 }],
  allergens: [{ name: "Gluten", color: "#FBBF24", count: 5 }, { name: "Dairy", color: "#F97316", count: 4 }, { name: "Shellfish", color: "#EF4444", count: 2 }, { name: "Vegan Option", color: "#10B981", count: 3 }, { name: "Nut Free", color: "#6366F1", count: 7 }],
  spice:     [{ name: "Mild", color: "#86EFAC", count: 6 }, { name: "Medium", color: "#FBBF24", count: 4 }, { name: "Hot", color: "#F97316", count: 2 }, { name: "Extra Hot", color: "#DC2626", count: 1 }],
  dietary:   [{ name: "Vegetarian", color: "#10B981", count: 4 }, { name: "Vegan", color: "#6366F1", count: 2 }, { name: "Halal", color: "#F59E0B", count: 8 }, { name: "Low Calorie", color: "#3B82F6", count: 3 }],
};

const adsData: {
  id: number; title: string; type: "Banner" | "Popup" | "Screensaver" | "Social";
  target: string; status: AdStatus; impressions: number; clicks: number; start: string; end: string; bg: string; icon: string;
}[] = [
  { id: 1, title: "Weekend BBQ Bash",       type: "Banner",      target: "Homepage",       status: "active",    impressions: 8420,  clicks: 312, start: "May 01", end: "May 04", bg: "linear-gradient(135deg,#7C2D12,#EA580C)", icon: "🍖" },
  { id: 2, title: "Dragon Roll Happy Hour", type: "Popup",       target: "Menu Page",      status: "active",    impressions: 5130,  clicks: 489, start: "May 01", end: "May 31", bg: "linear-gradient(135deg,#134E4A,#0F766E)", icon: "🐉" },
  { id: 3, title: "Churro Sundae Launch",   type: "Screensaver", target: "Kiosk",          status: "active",    impressions: 3200,  clicks: 210, start: "Apr 28", end: "May 15", bg: "linear-gradient(135deg,#78350F,#D97706)", icon: "🍮" },
  { id: 4, title: "Mother's Day Special",   type: "Social",      target: "Instagram",      status: "scheduled", impressions: 0,     clicks: 0,   start: "May 10", end: "May 12", bg: "linear-gradient(135deg,#1E1B4B,#5B21B6)", icon: "🌸" },
  { id: 5, title: "Taco Tuesday Deal",      type: "Banner",      target: "Menu Page",      status: "paused",    impressions: 4100,  clicks: 198, start: "Apr 15", end: "May 31", bg: "linear-gradient(135deg,#14532D,#15803D)", icon: "🌮" },
  { id: 6, title: "Summer Drinks Promo",    type: "Popup",       target: "Homepage",       status: "ended",     impressions: 12800, clicks: 940, start: "Apr 01", end: "Apr 30", bg: "linear-gradient(135deg,#0C4A6E,#0284C7)", icon: "🥤" },
];

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const S = {
  syne: { fontFamily: "'Syne', sans-serif" } as React.CSSProperties,
  dm:   { fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; color: string; border: string; label: string }> = {
    open: { bg: "#FFF7ED", color: "#EA580C", border: "#FDE8D8", label: "Open" },
    paid: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Paid" },
    busy: { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A", label: "In Prep" },
  };
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>
      {s.label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { bg: string; color: string; border: string }> = {
    admin:   { bg: "#FFF7ED", color: "#EA580C", border: "#FDE8D8" },
    manager: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    staff:   { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  };
  const s = map[role];
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function StatCard({ label, value, change, up, icon, accent }: { label: string; value: string; change: string; up: boolean; icon: string; accent: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", padding: "1.1rem 1.25rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 14px 0 60px", background: accent, opacity: 0.08 }} />
      <div style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A6046", fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ ...S.syne, fontWeight: 800, fontSize: "1.7rem", color: "#1C0A00", lineHeight: 1 }}>{value}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: up ? "#F0FDF4" : "#FEF2F2", color: up ? "#16A34A" : "#DC2626" }}>{change}</div>
      <div style={{ position: "absolute", top: "1.1rem", right: "1.25rem", fontSize: 20, opacity: 0.5 }}>{icon}</div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", padding: "1.25rem" }}>
      <div style={{ ...S.syne, fontWeight: 700, fontSize: 14, color: "#1C0A00", marginBottom: 2 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#9A6046", marginBottom: "1rem" }}>{sub}</div>}
      {children}
    </div>
  );
}

function PageHeader({ title, sub, action }: { title: string; sub: string; action?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
      <div>
        <h2 style={{ ...S.syne, fontWeight: 800, fontSize: "1.25rem", color: "#1C0A00" }}>{title}</h2>
        <p style={{ fontSize: 12.5, color: "#9A6046", marginTop: 2 }}>{sub}</p>
      </div>
      {action && (
        <button style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 10, ...S.syne, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const maxVal = Math.max(...weeklyRevenue.flatMap((r) => [r.thisWeek, r.lastWeek]));

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ ...S.syne, fontWeight: 800, fontSize: "1.5rem", color: "#1C0A00" }}>Good morning, Chef 👋</h1>
        <p style={{ fontSize: 13.5, color: "#9A6046", marginTop: 3 }}>Here&apos;s what&apos;s happening at ZestBite today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        <StatCard label="Revenue Today" value="$3,847" change="↑ 12.4% vs yesterday" up icon="💰" accent="#F97316" />
        <StatCard label="Orders Today"  value="184"    change="↑ 8.1% vs yesterday"  up icon="🧾" accent="#0F766E" />
        <StatCard label="Tables Active" value="9 / 16" change="56% occupancy"         up icon="🪑" accent="#7C3AED" />
        <StatCard label="Avg Order Value" value="$20.9" change="↓ 2.3% vs yesterday" up={false} icon="📊" accent="#DC2626" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: "1.5rem" }}>
        <Panel title="Weekly Revenue" sub="Mon – Sun this week vs last week">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, marginBottom: 8 }}>
            {weeklyRevenue.map((r) => {
              const thisH = Math.round((r.thisWeek / maxVal) * 130);
              const lastH = Math.round((r.lastWeek / maxVal) * 130);
              return (
                <div key={r.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, ...S.syne, fontWeight: 700, color: "#EA580C" }}>${(r.thisWeek / 1000).toFixed(1)}k</span>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 130, width: "100%" }}>
                    <div style={{ flex: 1, height: lastH, background: "#FED7AA", borderRadius: "4px 4px 0 0" }} />
                    <div style={{ flex: 1, height: thisH, background: "linear-gradient(180deg,#F97316,#EA580C)", borderRadius: "4px 4px 0 0" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#9A6046", fontWeight: 500 }}>{r.day}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#9A6046" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316" }} />This week</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#9A6046" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FED7AA" }} />Last week</div>
          </div>
        </Panel>

        <Panel title="Sales by Category" sub="Based on all-time orders">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {catBreakdown.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#1C0A00", fontWeight: 500, minWidth: 100 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  {c.name}
                </div>
                <div style={{ flex: 1, height: 5, background: "#F3D5BE", borderRadius: 3, margin: "0 8px", overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 3 }} />
                </div>
                <div style={{ ...S.syne, fontWeight: 700, fontSize: 11, color: "#EA580C" }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden" }}>
        <div style={{ padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3D5BE" }}>
          <div style={{ ...S.syne, fontWeight: 700, fontSize: 14, color: "#1C0A00" }}>Recent Orders</div>
          <button onClick={() => onNavigate("tables")} style={{ fontSize: 12, color: "#F97316", fontWeight: 600, cursor: "pointer", background: "none", border: "none", ...S.dm }}>View all tables →</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FFFBF5" }}>
              {["Order", "Table", "Items", "Amount", "Status", "Time"].map((h) => (
                <th key={h} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A6046", fontWeight: 600, padding: "10px 1.4rem", textAlign: "left", borderBottom: "1px solid #F3D5BE" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #FFF0E6" }}>
                <td style={{ padding: "10px 1.4rem", fontSize: 13 }}><strong>{o.id}</strong></td>
                <td style={{ padding: "10px 1.4rem", fontSize: 13 }}>{o.table}</td>
                <td style={{ padding: "10px 1.4rem", fontSize: 12, color: "#9A6046" }}>{o.items}</td>
                <td style={{ padding: "10px 1.4rem", fontSize: 13 }}><strong style={{ color: "#EA580C", ...S.syne }}>{o.amount}</strong></td>
                <td style={{ padding: "10px 1.4rem" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "10px 1.4rem", fontSize: 12, color: "#9A6046" }}>{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesPage() {
  return (
    <div>
      <PageHeader title="Categories" sub="Manage your menu categories" action="+ Add Category" />
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FFFBF5" }}>
              {["Icon", "Category", "Items", "Status", "Actions"].map((h) => (
                <th key={h} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A6046", fontWeight: 600, padding: "10px 1.4rem", textAlign: "left", borderBottom: "1px solid #F3D5BE" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #FFF0E6" }}>
                <td style={{ padding: "12px 1.4rem", fontSize: 22 }}>{c.icon}</td>
                <td style={{ padding: "12px 1.4rem", fontSize: 13, fontWeight: 600, color: "#1C0A00" }}>{c.label}</td>
                <td style={{ padding: "12px 1.4rem", fontSize: 13, color: "#9A6046" }}>{c.items} items</td>
                <td style={{ padding: "12px 1.4rem" }}>
                  <span style={{ background: c.active ? "#F0FDF4" : "#FFF7ED", color: c.active ? "#16A34A" : "#EA580C", border: `1px solid ${c.active ? "#BBF7D0" : "#FDE8D8"}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    {c.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td style={{ padding: "12px 1.4rem" }}>
                  <button style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #F3D5BE", background: "#fff", cursor: "pointer", fontSize: 12, marginRight: 6 }}>✏</button>
                  <button style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #F3D5BE", background: "#fff", cursor: "pointer", fontSize: 12 }}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemsPage() {
  return (
    <div>
      <PageHeader title="Menu Items" sub="All 12 items across 6 categories" action="+ Add Item" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {menuItems.map((item) => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden", cursor: "pointer", transition: "transform .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
            <div style={{ height: 100, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", position: "relative" }}>
              {item.icon}
              {item.badge && (
                <div style={{ position: "absolute", top: 8, left: 8, background: "#F97316", color: "#fff", fontSize: 9, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{item.badge}</div>
              )}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ ...S.syne, fontWeight: 700, fontSize: 13, color: "#1C0A00", marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: "#9A6046", marginBottom: 8 }}>{item.cat}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ ...S.syne, fontWeight: 700, color: "#EA580C", fontSize: 14 }}>${item.price.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>● In Stock</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttributesPage() {
  const panels = [
    { title: "Badges",       data: attributes.badges    },
    { title: "Allergen Tags", data: attributes.allergens },
    { title: "Spice Levels", data: attributes.spice     },
    { title: "Dietary",      data: attributes.dietary   },
  ];

  return (
    <div>
      <PageHeader title="Attributes" sub="Tags, badges and item properties" action="+ Add Attribute" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {panels.map((panel) => (
          <div key={panel.title} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3D5BE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ ...S.syne, fontWeight: 700, fontSize: 13.5, color: "#1C0A00" }}>{panel.title}</div>
              <button style={{ background: "#FFF7ED", border: "1.5px solid #FDE8D8", color: "#EA580C", borderRadius: 8, padding: "4px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
            </div>
            {panel.data.map((attr) => (
              <div key={attr.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 1.25rem", borderBottom: "1px solid #FFF0E6", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: attr.color, flexShrink: 0 }} />
                  {attr.name}
                </div>
                <span style={{ fontSize: 11, color: "#9A6046", background: "#FFFBF5", padding: "2px 8px", borderRadius: 20, border: "1px solid #F3D5BE" }}>{attr.count} item{attr.count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TablesPage() {
  const statusConfig: Record<TableStatus, { label: string; bg: string; color: string }> = {
    occupied:  { label: "Occupied",  bg: "#FFF7ED", color: "#EA580C" },
    available: { label: "Available", bg: "#F0FDF4", color: "#16A34A" },
    reserved:  { label: "Reserved",  bg: "#FEF3C7", color: "#D97706" },
  };

  return (
    <div>
      <PageHeader title="Table Management" sub="16 tables · 9 occupied · 3 reserved · 4 available" action="+ Add Table" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        <StatCard label="Occupied"       value="9"      change="56% occupancy"  up icon="🔴" accent="#F97316" />
        <StatCard label="Available"      value="4"      change="Ready to seat"  up icon="🟢" accent="#0F766E" />
        <StatCard label="Reserved"       value="3"      change="Upcoming"       up icon="🟡" accent="#7C3AED" />
        <StatCard label="Revenue Today"  value="$3,847" change="↑ 12%"         up icon="💰" accent="#DC2626" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {tableData.map((t) => {
          const cfg = statusConfig[t.status];
          return (
            <div key={t.num}
              style={{ background: t.status === "occupied" ? "#FFF7ED" : t.status === "reserved" ? "#FFFBEB" : "#fff", borderRadius: 14, border: `2px solid ${t.status !== "available" ? (t.status === "occupied" ? "#F97316" : "#D97706") : "#F3D5BE"}`, padding: "1.2rem", cursor: "pointer", textAlign: "center", transition: "transform .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
              <div style={{ ...S.syne, fontWeight: 800, fontSize: "1.5rem", color: "#1C0A00", marginBottom: 4 }}>T{t.num}</div>
              <div style={{ fontSize: 12, color: "#9A6046", marginBottom: 8 }}>{t.seats} seats</div>
              <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
              {t.revenue && <div style={{ fontSize: 11, color: "#EA580C", fontWeight: 700, marginTop: 6, ...S.syne }}>{t.revenue} billed</div>}
              {t.time && <div style={{ fontSize: 11, color: "#D97706", marginTop: 6 }}>Res. {t.time}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UsersPage() {
  return (
    <div>
      <PageHeader title="User Management" sub="Manage staff accounts and permissions" action="+ Invite User" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #F3D5BE", borderRadius: 10, padding: "8px 14px", width: 280 }}>
          <span style={{ color: "#C4A18A", fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Search users..." style={{ border: "none", outline: "none", fontSize: 13, ...S.dm, background: "none", color: "#1C0A00", width: "100%" }} />
        </div>
        <select style={{ border: "1.5px solid #F3D5BE", borderRadius: 10, padding: "8px 12px", fontSize: 13, ...S.dm, color: "#1C0A00", background: "#fff", outline: "none" }}>
          <option>All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Staff</option>
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden" }}>
        <div style={{ background: "#FFFBF5", borderBottom: "1px solid #F3D5BE", padding: "9px 1.4rem", display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 80px", gap: 0 }}>
          {["User", "Role", "Status", "Last Active", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A6046", fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        {users.map((u) => {
          const initials = u.name.split(" ").map((n) => n[0]).join("");
          return (
            <div key={u.email} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 80px", alignItems: "center", padding: "12px 1.4rem", borderBottom: "1px solid #FFF0E6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", ...S.syne, fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1C0A00" }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "#9A6046" }}>{u.email}</div>
                </div>
              </div>
              <div><RoleBadge role={u.role} /></div>
              <div>
                <span style={{ background: u.status === "Active" ? "#F0FDF4" : "#FFF7ED", color: u.status === "Active" ? "#16A34A" : "#EA580C", border: `1px solid ${u.status === "Active" ? "#BBF7D0" : "#FDE8D8"}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{u.status}</span>
              </div>
              <div style={{ fontSize: 12, color: "#9A6046" }}>{u.last}</div>
              <div>
                <button style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #F3D5BE", background: "#fff", cursor: "pointer", fontSize: 12, marginRight: 6 }}>✏</button>
                <button style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #F3D5BE", background: "#fff", cursor: "pointer", fontSize: 12 }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPage() {
  const inputStyle: React.CSSProperties = { width: "100%", border: "1.5px solid #F3D5BE", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#1C0A00" };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#9A6046", marginBottom: 4, display: "block" };
  const saveBtn: React.CSSProperties = { background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4, width: "100%" };

  return (
    <div>
      <PageHeader title="Settings" sub="Restaurant configuration and preferences" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel title="Restaurant Info" sub="Basic details shown on receipts">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} defaultValue="ZestBite Restaurant" /></div>
            <div><label style={labelStyle}>Address</label><input style={inputStyle} defaultValue="123 Flavor Street, Metro City" /></div>
            <div><label style={labelStyle}>Phone</label><input style={inputStyle} defaultValue="+1 (555) 000-1234" /></div>
            <button style={saveBtn}>Save Changes</button>
          </div>
        </Panel>

        <Panel title="Tax & Billing" sub="Applied to all orders at checkout">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={labelStyle}>Tax Rate (%)</label><input type="number" style={inputStyle} defaultValue={8} /></div>
            <div><label style={labelStyle}>Currency</label>
              <select style={{ ...inputStyle, background: "#fff" }}><option>USD ($)</option><option>EUR (€)</option><option>PHP (₱)</option></select>
            </div>
            <div><label style={labelStyle}>Receipt Footer Note</label><input style={inputStyle} defaultValue="Thank you for dining with us!" /></div>
            <button style={saveBtn}>Save Changes</button>
          </div>
        </Panel>

        <Panel title="Screensaver" sub="Idle timeout for menu kiosk mode">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={labelStyle}>Idle Timeout (seconds)</label><input type="number" style={inputStyle} defaultValue={20} /></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFBF5", borderRadius: 10, padding: "10px 12px", border: "1px solid #F3D5BE" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C0A00" }}>Screensaver Enabled</div>
                <div style={{ fontSize: 11, color: "#9A6046" }}>Show promotions when idle</div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: "#F97316", position: "relative", cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2 }} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Notifications" sub="Alerts and system events">
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "New order placed", on: true },
              { label: "Table bill out",   on: true },
              { label: "Low stock alert",  on: false },
            ].map((n) => (
              <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #FFF0E6" }}>
                <div style={{ fontSize: 13, color: "#1C0A00" }}>{n.label}</div>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: n.on ? "#F97316" : "#E5E7EB", position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, [n.on ? "right" : "left"]: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AdsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | AdStatus>("all");

  const statusCfg: Record<AdStatus, { bg: string; color: string; border: string; dot: string }> = {
    active:    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", dot: "#16A34A" },
    paused:    { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A", dot: "#D97706" },
    scheduled: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", dot: "#2563EB" },
    ended:     { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", dot: "#9CA3AF" },
  };

  const filters: { key: "all" | AdStatus; label: string }[] = [
    { key: "all",       label: "All Ads" },
    { key: "active",    label: "Active" },
    { key: "scheduled", label: "Scheduled" },
    { key: "paused",    label: "Paused" },
    { key: "ended",     label: "Ended" },
  ];

  const filtered = activeFilter === "all" ? adsData : adsData.filter((a) => a.status === activeFilter);

  const totalImpressions = adsData.reduce((s, a) => s + a.impressions, 0);
  const totalClicks      = adsData.reduce((s, a) => s + a.clicks, 0);
  const avgCtr           = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";
  const activeCount      = adsData.filter((a) => a.status === "active").length;

  return (
    <div>
      <PageHeader title="Ads Content" sub="Manage promotions, banners, and screensaver campaigns" action="+ Create Ad" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        <StatCard label="Active Campaigns" value={String(activeCount)}                  change="Running now"         up icon="📢" accent="#F97316" />
        <StatCard label="Total Impressions" value={`${(totalImpressions/1000).toFixed(1)}k`} change="↑ 18.2% this week" up icon="👁"  accent="#0F766E" />
        <StatCard label="Total Clicks"      value={String(totalClicks)}                 change="↑ 9.4% this week"    up icon="👆" accent="#7C3AED" />
        <StatCard label="Avg CTR"           value={`${avgCtr}%`}                        change="↑ 1.2% vs last week" up icon="📈" accent="#2563EB" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            style={{ padding: "6px 16px", borderRadius: 50, border: `1.5px solid ${activeFilter === f.key ? "#F97316" : "#F3D5BE"}`, background: activeFilter === f.key ? "#F97316" : "#fff", color: activeFilter === f.key ? "#fff" : "#9A6046", ...S.dm, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s" }}>
            {f.label}
          </button>
        ))}
        <button style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 50, border: "1.5px solid #F3D5BE", background: "#fff", color: "#9A6046", ...S.dm, fontSize: 13, cursor: "pointer" }}>
          ⬇ Export
        </button>
      </div>

      {/* Ad Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        {filtered.map((ad) => {
          const cfg = statusCfg[ad.status];
          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
          return (
            <div key={ad.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F3D5BE", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

              {/* Preview banner */}
              <div style={{ height: 110, background: ad.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: "3rem" }}>{ad.icon}</span>
                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{ad.type}</div>
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 5, background: cfg.bg, borderRadius: 20, padding: "3px 10px", border: `1px solid ${cfg.border}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                  <span style={{ fontSize: 10, color: cfg.color, fontWeight: 700 }}>{ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}</span>
                </div>
              </div>

              <div style={{ padding: "12px 14px" }}>
                <div style={{ ...S.syne, fontWeight: 700, fontSize: 14, color: "#1C0A00", marginBottom: 2 }}>{ad.title}</div>
                <div style={{ fontSize: 11, color: "#9A6046", marginBottom: 10 }}>Target: {ad.target} · {ad.start} – {ad.end}</div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                  {[
                    { label: "Impressions", value: ad.impressions > 0 ? `${(ad.impressions/1000).toFixed(1)}k` : "—" },
                    { label: "Clicks",      value: ad.clicks > 0 ? String(ad.clicks) : "—" },
                    { label: "CTR",         value: ad.impressions > 0 ? `${ctr}%` : "—" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: "#FFFBF5", borderRadius: 8, padding: "7px 8px", textAlign: "center", border: "1px solid #FFF0E6" }}>
                      <div style={{ ...S.syne, fontWeight: 700, fontSize: 13, color: "#EA580C" }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "#9A6046", marginTop: 1 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTR bar */}
                {ad.impressions > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9A6046", marginBottom: 4 }}>
                      <span>Click-through rate</span><span style={{ fontWeight: 600, color: "#EA580C" }}>{ctr}%</span>
                    </div>
                    <div style={{ height: 4, background: "#F3D5BE", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(parseFloat(ctr) * 10, 100)}%`, height: "100%", background: "linear-gradient(90deg,#F97316,#EA580C)", borderRadius: 2 }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ flex: 1, background: "#FFF7ED", border: "1.5px solid #FDE8D8", color: "#EA580C", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", ...S.syne }}>✏ Edit</button>
                  {ad.status === "active" && (
                    <button style={{ flex: 1, background: "#FEF3C7", border: "1.5px solid #FDE68A", color: "#D97706", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", ...S.syne }}>⏸ Pause</button>
                  )}
                  {ad.status === "paused" && (
                    <button style={{ flex: 1, background: "#F0FDF4", border: "1.5px solid #BBF7D0", color: "#16A34A", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", ...S.syne }}>▶ Resume</button>
                  )}
                  {(ad.status === "scheduled" || ad.status === "ended") && (
                    <button style={{ flex: 1, background: "#F3F4F6", border: "1.5px solid #E5E7EB", color: "#6B7280", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", ...S.syne }}>🗑 Delete</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F3D5BE", overflow: "hidden" }}>
        <div style={{ padding: "1.1rem 1.4rem", borderBottom: "1px solid #F3D5BE" }}>
          <div style={{ ...S.syne, fontWeight: 700, fontSize: 14, color: "#1C0A00" }}>Campaign Performance Summary</div>
          <div style={{ fontSize: 12, color: "#9A6046", marginTop: 2 }}>All-time stats across all ad types</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FFFBF5" }}>
              {["Campaign", "Type", "Status", "Impressions", "Clicks", "CTR", "Period"].map((h) => (
                <th key={h} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A6046", fontWeight: 600, padding: "10px 1.2rem", textAlign: "left", borderBottom: "1px solid #F3D5BE" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adsData.map((ad) => {
              const cfg = statusCfg[ad.status];
              const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) + "%" : "—";
              return (
                <tr key={ad.id} style={{ borderBottom: "1px solid #FFF0E6" }}>
                  <td style={{ padding: "10px 1.2rem", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: ad.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{ad.icon}</div>
                      <span style={{ fontWeight: 600, color: "#1C0A00" }}>{ad.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 1.2rem", fontSize: 12, color: "#9A6046" }}>{ad.type}</td>
                  <td style={{ padding: "10px 1.2rem" }}>
                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 1.2rem", fontSize: 13, ...S.syne, fontWeight: 700, color: "#1C0A00" }}>{ad.impressions > 0 ? ad.impressions.toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 1.2rem", fontSize: 13, ...S.syne, fontWeight: 700, color: "#1C0A00" }}>{ad.clicks > 0 ? ad.clicks.toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 1.2rem", fontSize: 13, ...S.syne, fontWeight: 700, color: "#EA580C" }}>{ctr}</td>
                  <td style={{ padding: "10px 1.2rem", fontSize: 12, color: "#9A6046" }}>{ad.start} – {ad.end}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type NavItem =
  | { type: "section"; label: string }
  | { type: "item"; label: string; icon: string; page?: Page; drop?: string }
  | { type: "sub"; label: string; page: Page; parent: string };

const navItems: NavItem[] = [
  { type: "section", label: "Main" },
  { type: "item",    label: "Dashboard",        icon: "▦", page: "dashboard" },
  { type: "section", label: "Menu" },
  { type: "item",    label: "Products",         icon: "☰", drop: "products" },
  { type: "sub",     label: "Categories",       page: "categories", parent: "products" },
  { type: "sub",     label: "Menu Items",       page: "items",      parent: "products" },
  { type: "sub",     label: "Attributes",       page: "attributes", parent: "products" },
  { type: "section", label: "Operations" },
  { type: "item",    label: "Table Management", icon: "⊞", page: "tables" },
  { type: "section", label: "Marketing" },
  { type: "item",    label: "Ads Content",      icon: "📢", page: "ads" },
  { type: "section", label: "Admin" },
  { type: "item",    label: "User Management",  icon: "◎", page: "users" },
  { type: "item",    label: "Settings",         icon: "⚙", page: "settings" },
];

const pageTitles: Record<Page, string> = {
  dashboard:  "Dashboard Overview",
  categories: "Products — Categories",
  items:      "Products — Menu Items",
  attributes: "Products — Attributes",
  tables:     "Table Management",
  ads:        "Ads Content",
  users:      "User Management",
  settings:   "Settings",
};

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function DashboardRootPage() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [openDrops, setOpenDrops]   = useState<Set<string>>(new Set());

  const toggleDrop = (drop: string) => {
    setOpenDrops((prev) => {
      const next = new Set(prev);
      next.has(drop) ? next.delete(drop) : next.add(drop);
      return next;
    });
  };

  const navigate = (page: Page) => setActivePage(page);

  const subPages = new Set(navItems.filter((n): n is Extract<NavItem, { type: "sub" }> => n.type === "sub" && n.parent === "products").map((n) => n.page));
  const activeParent = subPages.has(activePage) ? "products" : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFFBF5; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #FED7AA; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 240, minHeight: "100vh", background: "#1C0A00", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* Logo */}
          <div style={{ padding: "1.4rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ ...S.syne, fontWeight: 800, fontSize: "1.3rem", color: "#F97316" }}>
              Zest<span style={{ color: "#FED7AA" }}>Bite</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(254,215,170,0.4)", marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>Admin Panel</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingBottom: "1rem" }}>
            {navItems.map((nav, i) => {
              if (nav.type === "section") {
                return <div key={i} style={{ padding: "1rem 0.75rem 0.25rem", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(254,215,170,0.35)", fontWeight: 600 }}>{nav.label}</div>;
              }

              if (nav.type === "item") {
                const isActive = nav.page ? activePage === nav.page : activeParent === nav.drop;
                const isOpen   = nav.drop ? openDrops.has(nav.drop) : false;

                return (
                  <div key={i}>
                    <div
                      onClick={() => nav.page ? navigate(nav.page) : nav.drop && toggleDrop(nav.drop)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 1rem", margin: "1px 0.5rem", borderRadius: 10, cursor: "pointer", color: isActive ? "#fff" : "rgba(254,215,170,0.65)", fontSize: 13.5, fontWeight: 500, background: isActive ? "linear-gradient(135deg,#F97316,#EA580C)" : "transparent", transition: "all .15s" }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(249,115,22,0.12)"; e.currentTarget.style.color = "#FED7AA"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isActive ? "#fff" : "rgba(254,215,170,0.65)"; }}
                    >
                      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{nav.icon}</span>
                      {nav.label}
                      {nav.drop && <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5, transition: "transform .2s", transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>}
                    </div>

                    {nav.drop && (
                      <div style={{ overflow: "hidden", maxHeight: isOpen ? 300 : 0, transition: "max-height .25s ease" }}>
                        {navItems.filter((n): n is Extract<NavItem, { type: "sub" }> => n.type === "sub" && n.parent === nav.drop).map((sub, j) => (
                          <div key={j}
                            onClick={() => navigate(sub.page)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 1rem 7px 2.8rem", margin: "1px 0.5rem", borderRadius: 8, cursor: "pointer", color: activePage === sub.page ? "#F97316" : "rgba(254,215,170,0.5)", fontSize: 12.5, background: activePage === sub.page ? "rgba(249,115,22,0.12)" : "transparent", transition: "all .15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#FED7AA"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = activePage === sub.page ? "#F97316" : "rgba(254,215,170,0.5)"; }}
                          >
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", opacity: 0.6, flexShrink: 0 }} />
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </nav>

          {/* User */}
          <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#F97316,#EA580C)", display: "flex", alignItems: "center", justifyContent: "center", ...S.syne, fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>AO</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#FED7AA" }}>Admin Owner</div>
                <div style={{ fontSize: 11, color: "rgba(254,215,170,0.4)" }}>Super Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <div style={{ height: 60, background: "#fff", borderBottom: "1px solid #F3D5BE", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(249,115,22,0.05)" }}>
            <div style={{ ...S.syne, fontWeight: 700, fontSize: "1.05rem", color: "#1C0A00" }}>{pageTitles[activePage]}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/menu?tableNo=1" style={{ background: "#FFF7ED", border: "1px solid #FDE8D8", color: "#EA580C", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>↗ Go to Menu</a>
              <div style={{ background: "#FFF7ED", border: "1px solid #FDE8D8", color: "#EA580C", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>📅 May 2026</div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FFF7ED", border: "1px solid #FDE8D8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, position: "relative" }}>
                🔔
                <div style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#F97316", border: "2px solid #fff" }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "2rem", flex: 1 }}>
            {activePage === "dashboard"  && <DashboardPage  onNavigate={navigate} />}
            {activePage === "categories" && <CategoriesPage />}
            {activePage === "items"      && <ItemsPage />}
            {activePage === "attributes" && <AttributesPage />}
            {activePage === "tables"     && <TablesPage />}
            {activePage === "ads"        && <AdsPage />}
            {activePage === "users"      && <UsersPage />}
            {activePage === "settings"   && <SettingsPage />}
          </div>
        </main>

      </div>
    </>
  );
}