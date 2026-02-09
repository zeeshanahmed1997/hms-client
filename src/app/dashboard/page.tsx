'use client';

import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import TopNavbar from '../../components/dashboard/TopNavBar';
import StatCard from '../../components/dashboard/StatCard';
import RecentAppointments from '../../components/dashboard/RecentAppointments';
import RevenueChartPlaceholder from '../../components/dashboard/RevenueChartPlaceHolder';
import Sidebar from '../../components/dashboard/Sidebar';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  
  // 1. Loading Guard: Prevents "guest" default if Redux is still hydrating
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 2. Normalize role to lowercase to avoid case-sensitivity bugs
  const role = user?.role[0]?.toLowerCase() || 'guest';

  const renderStats = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Total Patients" value="1,248" icon="fa-users" color="primary" trend={{ text: "12% this month", isPositive: true }} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Active Doctors" value="18" icon="fa-user-md" color="info" footer="All on duty today" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Revenue" value="₹2.4M" icon="fa-chart-line" color="success" trend={{ text: "+15% vs last month", isPositive: true }} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Pending Bills" value="₹67,890" icon="fa-money-bill-wave" color="warning" trend={{ text: "High priority", isPositive: false }} />
            </div>
          </>
        );

      case 'doctor':
        return (
          <>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="My Appointments" value="12" icon="fa-calendar-check" color="primary" footer="4 remaining today" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="New Patients" value="5" icon="fa-user-plus" color="success" trend={{ text: "Assigned today", isPositive: true }} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Surgeries" value="2" icon="fa-procedures" color="info" footer="Scheduled for tomorrow" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Reports Pending" value="8" icon="fa-file-medical" color="warning" footer="Review required" />
            </div>
          </>
        );

      case 'patient':
        return (
          <>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Next Appointment" value="Oct 24" icon="fa-clock" color="primary" footer="Dr. Smith @ 10:00 AM" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Total Visits" value="14" icon="fa-history" color="info" footer="In last 12 months" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Medical Records" value="6" icon="fa-folder-open" color="success" footer="New lab results available" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <StatCard title="Outstanding Balance" value="₹500" icon="fa-wallet" color="warning" footer="Due by month end" />
            </div>
          </>
        );

      default:
        return (
          <div className="col-12">
            <div className="alert alert-info">
              Welcome! Please wait while we fetch your dashboard. (Role: {user.role})
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

      <style jsx global>{`
        body { background-color: #f5f7ff; font-family: 'Segoe UI', sans-serif; }
        .card-stat { transition: transform 0.2s; }
        .card-stat:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important; }
      `}</style>

      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <TopNavbar />
          <div className="container-fluid px-4 py-4">
            
            <div className="row g-4 mb-5">
              {renderStats()}
            </div>

            {/* Role-based Visibility for Tables/Charts (Updated to lowercase) */}
            {(role === 'admin' || role === 'doctor') && <RecentAppointments />}
            {role === 'admin' && <RevenueChartPlaceholder />}
            
          </div>
        </div>
      </div>
    </>
  );
}