import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, AlertTriangle, Star, MessageSquare, UserCircle } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { useAuth } from "../context/AuthContext";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";

const NAV = [
  { to: "/local-guide", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/local-guide/spots", label: "Tourist Spots", icon: Map },
  { to: "/local-guide/natural-disasters", label: "Alerts", icon: AlertTriangle },
  { to: "/local-guide/feedback", label: "Reviews", icon: Star },
  { to: "/local-guide/messages", label: "Messages", icon: MessageSquare },
  { to: "/local-guide/profile", label: "Profile", icon: UserCircle },
];

/** Local Guide panel shell — wraps the shared DashboardLayout with guide nav. */
export default function GuideLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const onLogout = async () => {
    const ok = await confirmDialog({
      title: "Sign out?",
      body: "You'll need to sign in again to access the guide panel.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!ok) return;
    logout();
    navigate("/");
  };

  const guideUser = {
    name: user?.name || "Karim Ali",
    role: "Local Guide · Hunza",
    avatar: img("guide-0", 120, 120),
  };

  return (
    <DashboardLayout
      items={NAV}
      onLogout={onLogout}
      greeting={greeting}
      subtitle={subtitle}
      user={guideUser}
      schedule={[]}
      rightRail={rightRail}
      footerCard={
        <PromoCard
          title="Post a safety alert"
          body="Keep travellers safe with real-time updates."
          cta="New alert"
          image={img("promo-guide", 500, 600)}
          onClick={() => navigate("/local-guide/natural-disasters")}
        />
      }
    >
      {children}
    </DashboardLayout>
  );
}
