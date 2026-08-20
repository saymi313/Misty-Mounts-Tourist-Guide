import React, { useState, useEffect } from "react";
import {
  Users, Compass, ShieldCheck, BedDouble, Mail, Phone, MapPin, Heart, BadgeCheck,
  Trash2, Eye, User as UserIcon, Check, Clock,
} from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { LIVE, listUsers, deleteUser, approveUser, verifyUser } from "../../data/adminApi";
import { formatDate } from "../../utils/datetime";
import { toast } from "../../utils/toast";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "user", label: "Travellers" },
  { key: "local guide", label: "Local Guides" },
  { key: "hotel", label: "Hotels" },
  { key: "travel agency", label: "Agencies" },
];

const TYPE_META = {
  "local guide": { label: "Local Guide", cls: "bg-violet-50 text-violet-600" },
  hotel: { label: "Hotel", cls: "bg-sky-50 text-sky-600" },
  "travel agency": { label: "Travel Agency", cls: "bg-apricot-50 text-apricot-600" },
  user: { label: "Traveller", cls: "bg-lime-50 text-lime-600" },
};

const Avatar = ({ user, className }) =>
  user.avatar ? (
    <img loading="lazy" decoding="async" src={user.avatar} alt={user.name} className={`${className} shrink-0 rounded-2xl object-cover`} />
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-lime-400 font-bold text-night-950`}>
      {(user.name || "U").charAt(0).toUpperCase()}
    </span>
  );

const TypePill = ({ type }) => {
  const meta = TYPE_META[type] || TYPE_META.user;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 p-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="truncate text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    if (LIVE) listUsers().then(setUsers).catch(() => {});
  }, []);

  const travellers = users.filter((u) => u.type === "user").length;
  const guides = users.filter((u) => u.type === "local guide").length;
  const hotels = users.filter((u) => u.type === "hotel").length;
  const agencies = users.filter((u) => u.type === "travel agency").length;
  const pendingAgencies = users.filter((u) => u.type === "travel agency" && u.isApproved === false).length;
  const counts = { all: users.length, user: travellers, "local guide": guides, hotel: hotels, "travel agency": agencies };
  const shown = filter === "all" ? users : users.filter((u) => u.type === filter);

  const approve = async (u) => {
    if (LIVE) {
      try { await approveUser(u._id, true); }
      catch { toast.error("Couldn't approve this agency. Please try again."); return; }
    }
    setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isApproved: true } : x)));
    if (viewing?._id === u._id) setViewing({ ...viewing, isApproved: true });
    toast.success(`${u.agencyName || u.name} approved — their tours can now go live.`);
  };

  const verify = async (u, val) => {
    if (LIVE) {
      try { await verifyUser(u._id, val); }
      catch { toast.error("Couldn't update verification. Please try again."); return; }
    }
    const status = val ? "verified" : "unverified";
    setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, verificationStatus: status } : x)));
    if (viewing?._id === u._id) setViewing({ ...viewing, verificationStatus: status });
    toast.success(val ? `${u.name} is now verified.` : `${u.name}'s verification was removed.`);
  };

  const remove = async (u) => {
    if (LIVE) {
      try { await deleteUser(u._id); }
      catch { toast.error("Couldn't delete this account. Please try again."); return; }
    }
    setUsers((prev) => prev.filter((x) => x._id !== u._id));
    setConfirmDel(null);
    if (viewing?._id === u._id) setViewing(null);
    toast.success(`${u.name}'s account was deleted.`);
  };

  return (
    <AdminLayout greeting="Users & Guides" subtitle="Manage travellers and local guides on the platform">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} tone="emerald" label="Total accounts" value={users.length} />
        <StatCard icon={Compass} tone="sky" label="Travellers" value={travellers} />
        <StatCard icon={ShieldCheck} tone="violet" label="Local guides" value={guides} />
        <StatCard icon={BedDouble} tone="apricot" label="Hotels" value={hotels} />
        <StatCard icon={Compass} tone="emerald" label={pendingAgencies ? `Agencies · ${pendingAgencies} pending` : "Agencies"} value={agencies} />
      </div>

      <Card className="mt-6">
        <SectionHead title="All accounts" sub={`${shown.length} shown`} />

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.key ? "bg-lime-400 text-night-950" : "bg-slate-100 text-slate-500 hover:text-lime-700"
              }`}
            >
              {f.label} <span className="opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Person</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} className="h-10 w-10" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><TypePill type={u.type} /></td>
                  <td className="px-3 py-3 text-sm text-slate-500">{u.city || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      {u.type === "travel agency" && u.isApproved === false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-apricot-600">
                          <Clock className="h-3.5 w-3.5" /> Pending review
                        </span>
                      ) : u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-600">
                          <BadgeCheck className="h-3.5 w-3.5" /> Email verified
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unverified</span>
                      )}
                      {u.verificationStatus === "verified" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-lime-600"><BadgeCheck className="h-3 w-3" /> ID verified</span>
                      )}
                      {u.verificationStatus === "pending" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600"><Clock className="h-3 w-3" /> ID in review</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.type === "travel agency" && u.isApproved === false && (
                        <button
                          onClick={() => approve(u)}
                          title="Approve agency"
                          className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-2.5 py-1.5 text-xs font-bold text-night-950 transition-colors hover:bg-lime-300"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {u.verificationStatus === "pending" && (
                        <button
                          onClick={() => verify(u, true)}
                          title="Verify identity"
                          className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-2.5 py-1.5 text-xs font-bold text-night-950 transition-colors hover:bg-lime-300"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" /> Verify
                        </button>
                      )}
                      <button
                        onClick={() => setViewing(u)}
                        title="View profile"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDel(u)}
                        title="Delete account"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-400">No accounts to show.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View profile */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        icon={UserIcon}
        title={viewing?.name}
        subtitle={viewing ? `${(TYPE_META[viewing.type] || TYPE_META.user).label} profile` : ""}
        footer={
          <>
            <BtnGhost onClick={() => setViewing(null)}>Close</BtnGhost>
            <Btn
              className="!bg-rose-500 hover:!bg-rose-600"
              onClick={() => { setConfirmDel(viewing); setViewing(null); }}
            >
              <Trash2 className="h-4 w-4" /> Delete account
            </Btn>
          </>
        }
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar user={viewing} className="h-16 w-16" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900">{viewing.name}</p>
                <p className="text-sm text-slate-400">@{viewing.username}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <TypePill type={viewing.type} />
                  {viewing.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-600">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {viewing.bio && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{viewing.bio}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail icon={Mail} label="Email" value={viewing.email} />
              <Detail icon={Phone} label="Phone" value={viewing.phone || "—"} />
              <Detail icon={MapPin} label="City" value={viewing.city || "—"} />
              <Detail icon={Heart} label="Saved spots" value={String(viewing.savedSpots?.length || 0)} />
            </div>

            {["local guide", "hotel", "travel agency"].includes(viewing.type) && (
              <div className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Identity (KYC)</p>
                  {viewing.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-600"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>
                  ) : viewing.verificationStatus === "pending" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Clock className="h-3.5 w-3.5" /> In review</span>
                  ) : (
                    <span className="text-xs text-slate-400">Not submitted</span>
                  )}
                </div>
                {viewing.idDocument ? (
                  <a href={viewing.idDocument} target="_blank" rel="noreferrer">
                    <img loading="lazy" decoding="async" src={viewing.idDocument} alt="Submitted ID document" className="mt-3 max-h-56 w-full rounded-xl border border-slate-100 bg-slate-50 object-contain" />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">No ID document uploaded yet.</p>
                )}
                {viewing.idDocument && (
                  <div className="mt-3 flex gap-2">
                    {viewing.verificationStatus !== "verified" ? (
                      <button onClick={() => verify(viewing, true)} className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-bold text-night-950 transition-colors hover:bg-lime-300">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verify identity
                      </button>
                    ) : (
                      <button onClick={() => verify(viewing, false)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                        Remove verification
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {viewing.interests?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {viewing.interests.map((i) => (
                    <span key={i} className="rounded-full bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-600">{i}</span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400">Member since {formatDate(viewing.memberSince)}</p>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        icon={Trash2}
        title="Delete account?"
        subtitle="This permanently removes the account."
        footer={
          <>
            <BtnGhost onClick={() => setConfirmDel(null)}>Cancel</BtnGhost>
            <Btn className="!bg-rose-500 hover:!bg-rose-600" onClick={() => remove(confirmDel)}>Delete</Btn>
          </>
        }
      >
        {confirmDel && (
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{confirmDel.name}</strong> ({confirmDel.email})?
            This can't be undone.
          </p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default UserManagement;
