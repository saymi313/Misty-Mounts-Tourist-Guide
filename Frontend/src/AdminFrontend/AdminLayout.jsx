import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, BedDouble, Bus, Wallet, Banknote, Users, MessageSquare, Settings } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";
import { LIVE, getAdminCounts } from "../data/adminApi";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tourist-spots", label: "Tourist Spots", icon: Map },
  { to: "/admin/accommodation", label: "Accommodation", icon: BedDouble },
  { to: "/admin/transportation", label: "Transport", icon: Bus },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/revenue", label: "Revenue", icon: Banknote },
  { to: "/admin/queries", label: "Queries", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

// Map a nav item to its badge count from the /admin/counts payload.
const badgeFor = (to, c) => {
  switch (to) {
    case "/admin/tourist-spots": return c.pendingSpots || 0;
    case "/admin/accommodation": return c.pendingListings || 0;
    case "/admin/revenue": return (c.pendingPayments || 0) + (c.pendingPayouts || 0);
    case "/admin/queries": return c.queries || 0;
    default: return 0;
  }
};

const adminUser = { name: "Admin · Saymi", role: "Platform Administrator", avatar: img("admin-avatar", 120, 120) };

/** Admin panel shell — wraps the shared DashboardLayout with admin nav + badges. */
export default function AdminLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (LIVE) getAdminCounts().then(setCounts).catch(() => {});
  }, []);

  const items = NAV.map((item) => ({ ...item, badge: badgeFor(item.to, counts) }));

  const onLogout = async () => {
    const ok = await confirmDialog({
      title: "Sign out?",
      body: "You'll need to sign in again to manage the platform.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!ok) return;
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <DashboardLayout
      items={items}
      onLogout={onLogout}
      greeting={greeting}
      subtitle={subtitle}
      user={adminUser}
      schedule={[]}
      rightRail={rightRail}
    >
      {children}
    </DashboardLayout>
  );
}

export { adminUser };
