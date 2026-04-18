'use client';

import React from 'react';
import { useAppSelector } from '../../../redux/hooks';
import TopNavbar from '../../../components/dashboard/TopNavBar';
import StatCard from '../../../components/dashboard/StatCard';
import RecentAppointments from '../../../components/dashboard/RecentAppointments';
import RevenueChartPlaceholder from '../../../components/dashboard/RevenueChartPlaceHolder';
import Sidebar from '../../../components/dashboard/Sidebar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAppointmentsApi } from '@/src/api/appointments';

export default function DoctorDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  // const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const token = useAppSelector((state) => state.auth.token);
  const { data: appointments = [], isLoading } = useQuery({
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

  // Security check for 'doctor' role
  if (role !== 'doctor') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Access denied. This page is for Doctors only.
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
        {/* <Sidebar /> */}
        <div className="flex-grow-1">
          {/* <TopNavbar /> */}
          <div className="container-fluid px-4 py-4">
            {/* <h2 className="mb-4">Welcome, Dr. {user.name || 'Doctor'}</h2> */}

            <div className="row g-4 mb-5">
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard
                  title="Today's Appointments"
                  value="12"
                  icon="fa-calendar-check"
                  color="primary"
                  trend={{ text: "Next: 10:30 AM", isPositive: true }}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard
                  title="Total Patients"
                  value="420"
                  icon="fa-user-injured"
                  color="info"
                  footer="2 new this week"
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard
                  title="Surgery/Procedures"
                  value="3"
                  icon="fa-briefcase-medical"
                  color="success"
                  trend={{ text: "Scheduled for today", isPositive: true }}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <StatCard
                  title="Pending Reports"
                  value="8"
                  icon="fa-file-medical-alt"
                  color="warning"
                  trend={{ text: "Requires review", isPositive: false }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-xl-8">
                <RecentAppointments data={appointments} loading={isLoading} />
              </div>
              <div className="col-12 col-xl-4">
                <RevenueChartPlaceholder />
                {/* Note: In a real doctor view, this might be 'Patient Recovery Stats' or similar */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}