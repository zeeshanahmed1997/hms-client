'use client';

import React from 'react';
import { useAppSelector } from '../../../redux/hooks';
import { useAdminStats } from '../../../api/dashboard';
import TopNavbar from '../../../components/dashboard/TopNavBar';
import StatCard from '../../../components/dashboard/StatCard';
import RecentAppointments from '../../../components/dashboard/RecentAppointments';
import RevenueChartPlaceholder from '../../../components/dashboard/RevenueChartPlaceHolder';
import Sidebar from '../../../components/dashboard/Sidebar';

export default function AdminDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  // Fetch real-time stats from C# Backend
  const { data: stats, isLoading, isError } = useAdminStats(token);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const role = user?.role?.toLowerCase() || 'guest';

  if (role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Access denied. This page is for administrators only.</div>
      </div>
    );
  }

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

      <style jsx global>{`
        body { background-color: #f5f7ff; font-family: 'Segoe UI', sans-serif; }
        .card-stat { transition: transform 0.2s; }
        .card-stat:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important; }
      `}</style>

      <div className="d-flex justify-content-start align-items-stretch" style={{ minHeight: '100vh' }}>
        <div className="flex-grow-1">
          <div className="container-fluid px-4 py-4">
            
            {/* Show loading state for stats */}
            {isLoading ? (
              <div className="text-center p-5 font-bold text-muted">SYNCING_DATABASE_STATS...</div>
            ) : isError ? (
              <div className="alert alert-warning">Failed to load real-time stats. Showing cached data.</div>
            ) : (
              <div className="row g-4 mb-5">
                <div className="col-12 col-sm-6 col-lg-3">
                  <StatCard 
                    title="Total Patients" 
                    value={stats?.totalPatients?.toLocaleString() || "0"} 
                    icon="fa-users" 
                    color="primary" 
                    trend={{ text: "Live from DB", isPositive: true }} 
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <StatCard 
                    title="Active Doctors" 
                    value={stats?.activeDoctors?.toString() || "0"} 
                    icon="fa-user-md" 
                    color="info" 
                    footer="On Duty & Active" 
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <StatCard 
                    title="Revenue" 
                    value={`₹${stats?.revenue?.toLocaleString() || "0"}`} 
                    icon="fa-chart-line" 
                    color="success" 
                    trend={{ text: "Total Collected", isPositive: true }} 
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <StatCard 
                    title="Pending Bills" 
                    value={`₹${stats?.pendingBills?.toLocaleString() || "0"}`} 
                    icon="fa-money-bill-wave" 
                    color="warning" 
                    trend={{ text: "Unpaid Invoices", isPositive: false }} 
                  />
                </div>
              </div>
            )}

            <RecentAppointments />
            <RevenueChartPlaceholder />
          </div>
        </div>
      </div>
    </>
  );
}