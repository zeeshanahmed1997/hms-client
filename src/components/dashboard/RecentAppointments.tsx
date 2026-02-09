// src/components/dashboard/RecentAppointments.tsx
import React from 'react';

export default function RecentAppointments() {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header card-header-gradient d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent Appointments</h5>
        <a href="#" className="btn btn-sm btn-light">View All</a>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>APP-001</td>
                <td>Ahmed Khan</td>
                <td>Dr. Fatima</td>
                <td>09:30 AM</td>
                <td><span className="badge status-confirmed px-3 py-2">Confirmed</span></td>
              </tr>
              <tr>
                <td>APP-002</td>
                <td>Sana Malik</td>
                <td>Dr. Ali</td>
                <td>10:15 AM</td>
                <td><span className="badge status-pending px-3 py-2">Pending</span></td>
              </tr>
              <tr>
                <td>APP-003</td>
                <td>Bilal Ahmed</td>
                <td>Dr. Sara</td>
                <td>11:00 AM</td>
                <td><span className="badge status-confirmed px-3 py-2">Confirmed</span></td>
              </tr>
              <tr>
                <td>APP-004</td>
                <td>Ayesha Raza</td>
                <td>Dr. Usman</td>
                <td>02:45 PM</td>
                <td><span className="badge status-cancelled px-3 py-2">Cancelled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}