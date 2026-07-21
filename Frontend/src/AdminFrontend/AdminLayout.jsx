import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, BedDouble, Bus, Wallet, Plus } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { scheduleItems, img } from "../data/mockData";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tourist-spots", label: "Tourist Spots", icon: Map },
  { to: "/admin/accommodation", label: "Accommodation", icon: BedDouble },
  { to: "/admin/transportation", label: "Transport", icon: Bus },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
];

const adminUser = { name: "Admin · Saymi", role: "Platform Administrator", avatar: img("admin-avatar", 120, 120) };

/** Admin panel shell — wraps the shared DashboardLayout with admin nav. */
export default function AdminLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const onLogout = () => {
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
      schedule={scheduleItems}
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
