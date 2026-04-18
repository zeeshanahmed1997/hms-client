"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Import useAppSelector to access the role
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/authSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Get user data from Redux
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.role || 'guest';
  // debugger;
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    router.push('/login');
    router.refresh();
  };

  // 2. Define items with allowed roles
  const navItems = [
    { name: 'Dashboard', href: `/${user?.role.toLowerCase()}`, icon: 'fas fa-chart-line', roles: ['admin', 'doctor', 'patient'] },
    { name: 'Patients', href: '/patients', icon: 'fas fa-user-injured', roles: ['admin'] },
        { name: 'Patients', href: '/doctor/patients', icon: 'fas fa-user-injured', roles: ['doctor'] },
    { name: 'Appointments', href: '/admin/appointments', icon: 'fas fa-calendar-alt', roles: ['admin'] },
    { name: 'Appointments', href: '/doctor/appointments', icon: 'fas fa-calendar-alt', roles: ['doctor'] },
    { name: 'Appointments', href: '/patient/appointments', icon: 'fas fa-calendar-alt', roles: ['patient'] },
    // { name: 'Doctors', href: '/doctors', icon: 'fas fa-stethoscope', roles: ['admin'] },
    { name: 'User Management', href: '/admin/user-management', icon: 'fas fa-user', roles: ['admin'] },
    { name: 'Doctor Management', href: '/admin/user-management/doctor', icon: 'fas fa-user-md', roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: 'fas fa-notes-medical', roles: ['admin', 'doctor'] },
    // Inside your navItems array
{ 
  name: 'Prescriptions', 
  href: '/doctor/prescriptions', 
  icon: 'fas fa-file-prescription', 
  roles: ['doctor'] 
},
{ 
  name: 'My Prescriptions', 
  href: '/patient/prescriptions', 
  icon: 'fas fa-file-prescription', 
  roles: ['patient'] 
},
{ 
  name: 'All Prescriptions', 
  href: '/admin/prescriptions', 
  icon: 'fas fa-file-prescription', 
  roles: ['admin'] 
},
{ 
  name: 'Medicines', 
  href: '/admin/medicines', 
  icon: 'fas fa-pills', 
  roles: ['admin', 'staff'] 
},
  ];

  // 3. Filter items based on the current user's role
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole.toLowerCase()));
  // debugger;
  return (
    <div className="hms-sidebar-pro d-none d-md-flex flex-column">
      <div className="brand-header p-4">
        <div className="logo-wrapper">
          <i className="fas fa-hospital-symbol logo-icon"></i>
        </div>
        <div className="ms-3">
          <h4 className="brand-text mb-0">HMS <span className="text-cyan">PRO</span></h4>
          <span className="brand-subtext">VITAL CARE SYSTEM</span>
        </div>
      </div>

      <nav className="flex-grow-1 px-3 mt-3">
        <ul className="nav flex-column gap-2">
          {filteredNavItems.map((item) => {
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

      <div className="sidebar-footer p-3">
        <div className="user-card mb-3">
          <div className="avatar">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="user-info">
            {/* 4. Display dynamic user info */}
            <p className="u-name">{user?.fullName || 'User'}</p>
            <p className="u-role text-capitalize">{userRole}</p>
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