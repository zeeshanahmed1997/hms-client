// src/components/dashboard/RecentAppointments.tsx
import React from 'react';
import { Appointment } from '../../api/appointments';
import { useSelector } from 'react-redux';
import { AuthUser } from '@/src/types/auth/common';
import { RootState } from "@/src/redux/store";

interface RecentAppointmentsProps {
  data?: Appointment[];
  loading?: boolean;
}

export default function RecentAppointments({ data, loading }: RecentAppointmentsProps) {
  const user = useSelector((state: RootState) => state.auth?.user as AuthUser | null);
  const role = user?.role?.toLowerCase() || 'guest';

  const ViewAll = () => {
    if (role === 'doctor') {
      window.location.href = '/doctor/appointments';
    } else if (role === 'patient') {
      window.location.href = '/patient/appointments';
    } else {
      window.location.href = '/appointments';
    }
  };

  // Improved Status Configuration - Matches your C# enum exactly
  const getStatusConfig = (status: any) => {
    // Convert to number safely (handles number, string "5", or even "Cancelled")
    const s = Number(status);

    const configs: Record<number, { text: string; badgeClass: string; icon: string }> = {
      0: { text: "Pending",       badgeClass: "bg-warning text-dark", icon: "⏳" },
      1: { text: "Confirmed",     badgeClass: "bg-success",           icon: "✅" },
      2: { text: "Checked In",    badgeClass: "bg-info",              icon: "📍" },
      3: { text: "In Consultation", badgeClass: "bg-primary",         icon: "👨‍⚕️" },
      4: { text: "Completed",     badgeClass: "bg-success",           icon: "🎉" },
      5: { text: "Cancelled",     badgeClass: "bg-danger",            icon: "❌" },   // ← Fixed this
      6: { text: "No Show",       badgeClass: "bg-danger",            icon: "⚠️" },
      7: { text: "Rescheduled",   badgeClass: "bg-warning text-dark", icon: "🔄" },
    };

    return configs[s] || { 
      text: status ? `${status}` : "Unknown", 
      badgeClass: "bg-secondary", 
    };
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold text-primary">Recent Appointments</h5>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={ViewAll}
        >
          View All
        </button>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading recent appointments...
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No recent appointments found.
                  </td>
                </tr>
              ) : (
                data.map((apt, index) => {
                  const statusConfig = getStatusConfig(apt.status);
                  return (
                    <tr key={apt.id || apt.id || index}>
                      {/* Patient */}
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
                            style={{ width: '42px', height: '42px', fontSize: '18px' }}
                          >
                            👤
                          </div>
                          <div>
                            <div className="fw-bold">{apt.patientName || 'Unknown Patient'}</div>
                            {apt.patientPhone && (
                              <small className="text-muted">📞 {apt.patientPhone}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div className="fw-medium">{apt.doctorName || '—'}</div>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div className="fw-medium">
                          {new Date(apt.appointmentDate).toLocaleDateString('en-PK', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <small className="text-muted">
                          {new Date(apt.appointmentDate).toLocaleTimeString('en-PK', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} PKT
                        </small>
                      </td>

                      {/* Reason */}
                      <td>
                        <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '220px' }}>
                          {apt.reason || 'No reason provided'}
                        </small>
                      </td>

                      {/* Status - Now correctly shows "Cancelled" */}
                      <td>
                        <span className={`badge ${statusConfig.badgeClass} px-3 py-2 rounded-pill fw-medium fs-6`}>
                          {statusConfig.icon} {statusConfig.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}