'use client';

import React from 'react';
import { useAppSelector } from '../../../redux/hooks';
import TopNavbar from '../../../components/dashboard/TopNavBar';
import StatCard from '../../../components/dashboard/StatCard';
import RecentAppointments from '../../../components/dashboard/RecentAppointments';
import Sidebar from '../../../components/dashboard/Sidebar';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchAppointmentsApi } from '@/src/api/appointments';

export default function PatientDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
 const token = useAppSelector((state) => state.auth.token);
const { data: appointments = [], isLoading } = useQuery({ // Added = [] here
  queryKey: ['appointments', { token }],
  queryFn: async () => {
    const response = await fetchAppointmentsApi(token as string);
    return response || [];
  },
  enabled: !!user?.id,
});
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

  // Security check for 'patient' role
  if (role !== 'patient') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Access denied. This page is for Patients only.
        </div>
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
            {/* <h2 className="mb-4">Welcome, {user.name || 'Patient'}</h2> */}
            
            <div className="row g-4 mb-5">
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard 
                  title="Upcoming Appointments" 
                  value="2" 
                  icon="fa-calendar-alt" 
                  color="primary" 
                  trend={{ text: "Next: Tomorrow at 9:00 AM", isPositive: true }} 
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard 
                  title="Active Prescriptions" 
                  value="4" 
                  icon="fa-pills" 
                  color="success" 
                  footer="2 refills available" 
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard 
                  title="Medical Reports" 
                  value="15" 
                  icon="fa-file-invoice" 
                  color="info" 
                  trend={{ text: "New report added today", isPositive: true }} 
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard 
                  title="Health Alerts" 
                  value="0" 
                  icon="fa-bell" 
                  color="warning" 
                  trend={{ text: "No urgent actions", isPositive: true }} 
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-xl-8">
                {/* Reusing the component - ensures it filters by Patient ID internally */}
                <RecentAppointments data={appointments} loading={isLoading} />
              </div>
              <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                  <h5>Health Tips</h5>
                  <hr />
                  <div className="d-flex align-items-center mb-3">
                    <i className="fa-solid fa-droplet text-primary me-3"></i>
                    <span>Stay hydrated! Drink at least 8 glasses of water today.</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-walking text-success me-3"></i>
                    <span>Try to get 30 minutes of light exercise this evening.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}