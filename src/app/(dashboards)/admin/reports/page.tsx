'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminReportApi, AdminReport, DoctorPerformance, PatientVisit } from '../../../../api/reports';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color, sub }: {
  title: string; value: string | number; icon: string; color: string; sub?: string;
}) => (
  <div className="col-xl-3 col-md-6 mb-4">
    <div className={`card border-0 shadow-sm rounded-4 h-100 border-start border-4 border-${color}`}>
      <div className="card-body d-flex align-items-center gap-3 p-4">
        <div className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
          style={{ width: 56, height: 56, fontSize: 24 }}>
          {icon}
        </div>
        <div>
          <div className="text-muted small fw-semibold text-uppercase">{title}</div>
          <div className="fw-bold fs-3 text-dark">{value}</div>
          {sub && <div className="text-muted small">{sub}</div>}
        </div>
      </div>
    </div>
  </div>
);

export default function AdminReportsPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const { data: report, isLoading, isError } = useQuery<AdminReport>({
    queryKey: ['adminReport'],
    queryFn: () => fetchAdminReportApi(token),
    enabled: !!token,
  });

  const appointmentPieData = report ? [
    { name: 'Pending',   value: report.pendingAppointments   },
    { name: 'Confirmed', value: report.confirmedAppointments },
    { name: 'Completed', value: report.completedAppointments },
    { name: 'Cancelled', value: report.cancelledAppointments },
  ] : [];

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
        <p className="text-muted">Generating report...</p>
      </div>
    </div>
  );

  if (isError || !report) return (
    <div className="alert alert-danger m-4">Failed to load report. Please try again.</div>
  );

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">📊 Admin Reports</h2>
        <p className="text-muted">Hospital-wide analytics and performance overview</p>
      </div>

      {/* ── Appointment Stats ── */}
      <h5 className="fw-semibold text-muted text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>
        Appointment Overview
      </h5>
      <div className="row mb-2">
        <StatCard title="Total Appointments" value={report.totalAppointments}   icon="📅" color="primary" />
        <StatCard title="Pending"            value={report.pendingAppointments}  icon="⏳" color="warning" />
        <StatCard title="Completed"          value={report.completedAppointments} icon="✅" color="success" />
        <StatCard title="Cancelled"          value={report.cancelledAppointments} icon="❌" color="danger"  />
      </div>

      {/* ── Revenue Stats ── */}
      <h5 className="fw-semibold text-muted text-uppercase mb-3 mt-4" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>
        Revenue Overview
      </h5>
      <div className="row mb-2">
        <StatCard title="Total Revenue" value={`PKR ${report.totalRevenue.toLocaleString()}`}  icon="💰" color="success" />
        <StatCard title="Paid"          value={`PKR ${report.paidRevenue.toLocaleString()}`}   icon="✅" color="info"    />
        <StatCard title="Unpaid"        value={`PKR ${report.unpaidRevenue.toLocaleString()}`} icon="⚠️" color="warning" />
        <StatCard title="Prescriptions" value={report.totalPrescriptions} icon="💊" color="primary"
          sub={`${report.totalMedicinesDispensed} medicines dispensed`} />
      </div>

      {/* ── Patient Stats ── */}
      <h5 className="fw-semibold text-muted text-uppercase mb-3 mt-4" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>
        Patient Overview
      </h5>
      <div className="row mb-4">
        <StatCard title="Total Visits"    value={report.totalPatients}  icon="🏥" color="primary" />
        <StatCard title="Unique Patients" value={report.uniquePatients} icon="👥" color="info"    />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="row mb-4">

        {/* Revenue Line Chart */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">💰 Revenue by Month</h6>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={report.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => v !== undefined ? `PKR ${(v as number).toLocaleString()}` : ''} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#0d6efd" strokeWidth={2}
                    dot={{ fill: '#0d6efd', r: 4 }} name="Revenue (PKR)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Appointment Pie Chart */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">📅 Appointment Status</h6>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={appointmentPieData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" label={({ name, percent }) =>
                      percent && percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }>
                    {appointmentPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="row mb-4">

        {/* Doctor Performance Bar Chart */}
        <div className="col-lg-7 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">👨‍⚕️ Doctor Performance</h6>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={report.doctorPerformance} layout="vertical"
                  margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="doctorName" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalAppointments"     fill="#0d6efd" name="Total"     radius={[0,4,4,0]} />
                  <Bar dataKey="completedAppointments" fill="#198754" name="Completed" radius={[0,4,4,0]} />
                  <Bar dataKey="totalPrescriptions"    fill="#0dcaf0" name="Rx"        radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prescription Summary */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">💊 Prescription Summary</h6>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3 bg-primary bg-opacity-10">
                  <div className="text-muted small">Total Prescriptions</div>
                  <div className="fw-bold fs-2 text-primary">{report.totalPrescriptions}</div>
                </div>
                <div className="p-3 rounded-3 bg-info bg-opacity-10">
                  <div className="text-muted small">Total Medicines Dispensed</div>
                  <div className="fw-bold fs-2 text-info">{report.totalMedicinesDispensed}</div>
                </div>
                <div className="p-3 rounded-3 bg-success bg-opacity-10">
                  <div className="text-muted small">Avg Medicines per Prescription</div>
                  <div className="fw-bold fs-2 text-success">
                    {report.totalPrescriptions > 0
                      ? (report.totalMedicinesDispensed / report.totalPrescriptions).toFixed(1)
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Patient Visit Table ── */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">🏥 Patient Visit History</h6>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Last Visit</th>
                  <th>Total Visits</th>
                </tr>
              </thead>
              <tbody>
                {report.recentPatientVisits.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-4">No visits found</td></tr>
                ) : report.recentPatientVisits.map((v: PatientVisit, i: number) => (
                  <tr key={i}>
                    <td className="fw-semibold">{v.patientName}</td>
                    <td className="text-muted">{v.patientEmail}</td>
                    <td>{new Date(v.lastVisit).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}</td>
                    <td>
                      <span className="badge bg-primary rounded-pill px-3">{v.totalVisits}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}