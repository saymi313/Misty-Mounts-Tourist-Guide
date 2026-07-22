import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, BedDouble, Bus, Wallet, Users, Settings, Plus } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tourist-spots", label: "Tourist Spots", icon: Map },
  { to: "/admin/accommodation", label: "Accommodation", icon: BedDouble },
  { to: "/admin/transportation", label: "Transport", icon: Bus },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const adminUser = { name: "Admin · Saymi", role: "Platform Administrator", avatar: img("admin-avatar", 120, 120) };

/** Admin panel shell — wraps the shared DashboardLayout with admin nav. */
export default function AdminLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
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
      items={NAV}
      onLogout={onLogout}
      greeting={greeting}
      subtitle={subtitle}
      user={adminUser}
      schedule={[]}
      rightRail={rightRail}
      footerCard={
        <PromoCard
          title="Add a tourist spot"
          body="Grow the catalogue with new curated places."
          cta="Add spot"
          image={img("promo-admin", 500, 600)}
          onClick={() => navigate("/admin/tourist-spots")}
        />
      }
    >
      {children}
    </DashboardLayout>
  );
}

export { adminUser };
