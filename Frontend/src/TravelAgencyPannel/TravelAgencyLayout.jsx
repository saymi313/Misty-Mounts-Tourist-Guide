import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, CalendarCheck, Banknote, UserCircle, Clock, BarChart3 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { useAuth } from "../context/AuthContext";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";

const NAV = [
  { to: "/travel-agency", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/travel-agency/packages", label: "Tour Packages", icon: Package },
  { to: "/travel-agency/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/travel-agency/insights", label: "Insights", icon: BarChart3 },
  { to: "/travel-agency/revenue", label: "Revenue", icon: Banknote },
  { to: "/travel-agency/profile", label: "Profile", icon: UserCircle },
];

/** Travel-agency panel shell — wraps the shared DashboardLayout with agency nav. */
export default function TravelAgencyLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pending = user?.isApproved === false;

  const onLogout = async () => {
    const ok = await confirmDialog({
      title: "Sign out?",
      body: "You'll need to sign in again to manage your tours.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!ok) return;
    logout();
    navigate("/");
  };

  const agencyUser = {
    name: user?.agencyName || user?.name || "Travel Agency",
    role: "Travel Agency",
    avatar: user?.avatar || img("agency-avatar", 120, 120),
  };

  return (
    <DashboardLayout
      items={NAV}
      onLogout={onLogout}
      greeting={greeting}
      subtitle={subtitle}
      user={agencyUser}
      schedule={[]}
      rightRail={rightRail}
      footerCard={
        <PromoCard
          title="Create a package"
          body="Design an itinerary and fill your next group departure."
          cta="New package"
          image={img("promo-agency", 500, 600)}
          onClick={() => navigate("/travel-agency/packages")}
        />
      }
    >
      {pending && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-apricot-200 bg-apricot-50 px-4 py-3 text-sm text-apricot-700">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <p><span className="font-bold">Pending admin review.</span> Your agency is awaiting approval — you can set up packages, but they stay hidden from travellers until an admin approves your account.</p>
        </div>
      )}
      {children}
    </DashboardLayout>
  );
}
