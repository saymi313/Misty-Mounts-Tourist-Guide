import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, BedDouble, CalendarCheck, Banknote, UserCircle } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { useAuth } from "../context/AuthContext";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";

const NAV = [
  { to: "/hotel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/hotel/listings", label: "My Listings", icon: BedDouble },
  { to: "/hotel/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/hotel/revenue", label: "Revenue", icon: Banknote },
  { to: "/hotel/profile", label: "Profile", icon: UserCircle },
];

/** Hotel-manager panel shell — wraps the shared DashboardLayout with hotel nav. */
export default function HotelLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    const ok = await confirmDialog({
      title: "Sign out?",
      body: "You'll need to sign in again to manage your hotel.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!ok) return;
    logout();
    navigate("/");
  };

  const hotelUser = {
    name: user?.hotelName || user?.name || "Hotel",
    role: "Hotel Manager",
    avatar: user?.avatar || img("hotel-avatar", 120, 120),
  };

  return (
    <DashboardLayout
      items={NAV}
      onLogout={onLogout}
      greeting={greeting}
      subtitle={subtitle}
      user={hotelUser}
      schedule={[]}
      rightRail={rightRail}
      footerCard={
        <PromoCard
          title="Add a new listing"
          body="Grow your bookings — list a room, suite or restaurant."
          cta="Add listing"
          image={img("promo-hotel", 500, 600)}
          onClick={() => navigate("/hotel/listings")}
        />
      }
    >
      {children}
    </DashboardLayout>
  );
}
