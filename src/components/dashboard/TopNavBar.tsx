// src/components/dashboard/TopNavbar.tsx
'use client';   // ← very important – this is a Client Component

import React from 'react';
import { useAppSelector } from '@/src/redux/hooks';
import './dashboard.css'; // Import the CSS file for styling
export default function TopNavbar() {
  const user = useAppSelector(state => state.auth.user || null);    
       
  const displayName = user?.fullName ?? 'Guest';
  const displayRole  = user?.role  ?? 'Visitor';
//   const avatarUrl    = user?.avatar ?? 'https://via.placeholder.com/40';

  return (
    <nav className="navbar top-nav-bar navbar-expand-lg">
      <div className="container-fluid px-4">
        <button
          className="navbar-toggler d-md-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="d-flex align-items-center">
          <h4 className="dashboard-header mb-0 ms-2">Dashboard</h4>
        </div>

        <div className="navbar-nav ms-auto d-flex align-items-center gap-3">
          <div className="position-sticky">
            <i className="fas fa-bell text-muted fs-5 cursor-pointer"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="user-name d-none d-md-block">
              <div>{displayName}</div>
              <small className="text-muted">{displayRole}</small>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}