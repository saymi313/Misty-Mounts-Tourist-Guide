import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Heart, CalendarCheck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { confirmDialog } from '../../utils/confirm';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    const ok = await confirmDialog({
      title: 'Sign out?',
      body: "You'll be signed out of your Misty Mounts account.",
      confirmLabel: 'Sign out',
      danger: false,
    });
    if (!ok) return;
    logout();
    navigate('/auth');
  };

  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/12 bg-night-800 py-1.5 pl-1.5 pr-3 transition-colors duration-200 hover:border-lime-400/50"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-sm font-bold text-night-950">
            {initial}
          </span>
        )}
        <span className="hidden text-sm font-semibold text-white sm:block">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-night-800 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/8 bg-night-900 px-4 py-3.5">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-bold text-night-950">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-white/50">{user?.email || ''}</p>
            </div>
          </div>
          <div className="py-1.5">
            {[
              [Heart, 'Saved spots', '/saved'],
              [CalendarCheck, 'My bookings', '/bookings'],
              [Bell, 'Notifications', '/notifications'],
              [User, 'Profile', '/profile'],
            ].map(([Icon, label, to]) => (
              <button
                key={label}
                onClick={() => {
                  navigate(to);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-night-700 hover:text-white"
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-white/8 px-4 py-3 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
