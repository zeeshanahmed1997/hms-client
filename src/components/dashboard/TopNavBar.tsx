'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/src/redux/hooks';
import { Bell, ChevronDown, User, LogOut, Activity, Settings } from 'lucide-react';
import './dashboard.css';   // ← rename your css file if needed

export default function TopNavbar() {
  const user = useAppSelector((state) => state.auth.user);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const displayName = user?.fullName ?? 'Dr. Abdullah';
  const displayRole = user?.role ?? 'Chief Surgeon';

  const timeString = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Karachi',
  });

  return (
    <header className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="top-navbar-container">

        {/* Left side - System status */}
        <div className="top-navbar-left">
          <div className="system-status d-none d-xl-flex align-items-center gap-2">
            <div className="status-dot" />
            <span className="status-text">
              EMR Sync: <span className="status-live">Live</span>
            </span>
          </div>
        </div>

        {/* Right side - Controls & Profile */}
        <div className="top-navbar-right">

          {/* Clock */}
          <div className="clock-container d-none d-md-flex align-items-center gap-2">
            <span className="clock-time">{timeString}</span>
            <span className="clock-zone">PKT</span>
          </div>

          {/* Notifications */}
          <button className="nav-icon-btn notification-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-count">9+</span>
          </button>

          <div className="divider-vertical" />

          {/* User Profile Dropdown */}
          <div className="dropdown">
            <button
              className="profile-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="avatar-container">
                <div className="avatar">{displayName.charAt(0)}</div>
                <div className="status-indicator" />
              </div>

              <div className="user-info d-none d-lg-flex flex-column">
                <span className="user-name">{displayName}</span>
                <span className="user-role">{displayRole}</span>
              </div>

              <ChevronDown size={16} className="chevron" />
            </button>

            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li className="dropdown-header">Staff Portal</li>
              <li>
                <a className="dropdown-item" href="#">
                  <User size={16} /> Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <Activity size={16} /> Activity
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <Settings size={16} /> Settings
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#">
                  <LogOut size={16} /> Sign Out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}