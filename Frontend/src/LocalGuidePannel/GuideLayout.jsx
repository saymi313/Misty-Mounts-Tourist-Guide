import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, AlertTriangle, Star, MessageSquare, Banknote, UserCircle } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PromoCard } from "../components/dashboard/ui";
import { useAuth } from "../context/AuthContext";
import { img } from "../data/mockData";
import { confirmDialog } from "../utils/confirm";
import { LIVE } from "../data/api";
import { getUnreadMessageCount } from "../data/messagesApi";

const NAV = [
  { to: "/local-guide", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/local-guide/spots", label: "Tourist Spots", icon: Map },
  { to: "/local-guide/natural-disasters", label: "Alerts", icon: AlertTriangle },
  { to: "/local-guide/feedback", label: "Reviews", icon: Star },
  { to: "/local-guide/messages", label: "Messages", icon: MessageSquare },
  { to: "/local-guide/revenue", label: "Revenue", icon: Banknote },
  { to: "/local-guide/profile", label: "Profile", icon: UserCircle },
];

/** Local Guide panel shell — wraps the shared DashboardLayout with guide nav. */
export default function GuideLayout({ greeting, subtitle, rightRail = false, children }) {
  const navigate = useNavigate();
  const { user, logout, socket } = useAuth();
  const [unread, setUnread] = useState(0);

  // Live unread-message count for the Messages sidebar badge.
  useEffect(() => {
    if (!LIVE || !user) return undefined;
    const load = () => getUnreadMessageCount().then(setUnread).catch(() => {});
    load();
    const onNew = ({ message }) => { if (!message?.mine) load(); };
    socket?.on("message:new", onNew);
    window.addEventListener("mm:messages-read", load);
    return () => {
      socket?.off("message:new", onNew);
      window.removeEventListener("mm:messages-read", load);
    };
  }, [user, socket]);

  const items = NAV.map((item) =>
    item.to === "/local-guide/messages" ? { ...item, badge: unread } : item
  );

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
      items={items}
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
