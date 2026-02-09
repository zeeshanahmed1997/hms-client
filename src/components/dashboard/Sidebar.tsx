"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/authSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-line' },
    { name: 'Patients', href: '/patients', icon: 'fas fa-user-injured' },
    { name: 'Appointments', href: '/appointments', icon: 'fas fa-calendar-alt' },
    { name: 'Doctors', href: '/doctors', icon: 'fas fa-stethoscope' },
    { name: 'Reports', href: '/reports', icon: 'fas fa-notes-medical' },
  ];

  return (
    <div className="hms-sidebar-pro d-none d-md-flex flex-column">
      {/* Brand Header with Glow */}
      <div className="brand-header p-4">
        <div className="logo-wrapper">
          <i className="fas fa-hospital-symbol logo-icon"></i>
        </div>
        <div className="ms-3">
          <h4 className="brand-text mb-0">HMS <span className="text-cyan">PRO</span></h4>
          <span className="brand-subtext">VITAL CARE SYSTEM</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-grow-1 px-3 mt-3">
        <ul className="nav flex-column gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="nav-item">
                <Link 
                  href={item.href} 
                  className={`pro-nav-link ${isActive ? 'active' : ''}`}
                >
                  <div className="icon-container">
                    <i className={item.icon}></i>
                  </div>
                  <span className="link-text">{item.name}</span>
                  {isActive && <div className="active-indicator" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout Section */}
      <div className="sidebar-footer p-3">
        <div className="user-card mb-3">
          <div className="avatar">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="user-info">
            <p className="u-name">Dr. Admin</p>
            <p className="u-role">Medical Chief</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt me-2"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}