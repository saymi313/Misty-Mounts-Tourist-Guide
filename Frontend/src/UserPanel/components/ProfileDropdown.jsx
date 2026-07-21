import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Heart, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setIsOpen(false);
  };

  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-abyss-900/12 bg-white py-1.5 pl-1.5 pr-3 transition-colors duration-200 hover:border-glacier-400 dark:border-frost-50/15 dark:bg-abyss-900"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-glacier-500 font-display text-sm font-semibold text-abyss-950">
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-abyss-900 dark:text-frost-100 sm:block">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-frost-500 transition-transform duration-200 dark:text-frost-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-abyss-900/10 bg-white shadow-lift dark:border-frost-50/10 dark:bg-abyss-900">
          <div className="flex items-center gap-3 border-b border-abyss-900/8 bg-frost-50 px-4 py-3.5 dark:border-frost-50/8 dark:bg-abyss-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-glacier-500 font-display font-semibold text-abyss-950">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-abyss-900 dark:text-frost-50">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-frost-500 dark:text-frost-400">{user?.email || ''}</p>
            </div>
          </div>
          <div className="py-1.5">
            {[[Heart, 'Saved spots'], [CalendarCheck, 'My bookings'], [User, 'Profile']].map(([Icon, label]) => (
              <button
                key={label}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-frost-700 transition-colors hover:bg-glacier-50 hover:text-abyss-900 dark:text-frost-300 dark:hover:bg-abyss-800 dark:hover:text-frost-50"
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-abyss-900/8 px-4 py-3 text-sm font-medium text-clay-600 transition-colors hover:bg-clay-500/5 dark:border-frost-50/8"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
