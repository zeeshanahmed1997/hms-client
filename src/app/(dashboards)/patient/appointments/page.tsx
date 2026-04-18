'use client';
import React, { useEffect, useState } from 'react';
import { 
  fetchAppointmentsApi, 
  deleteAppointmentApi, 
  editAppointmentApi,
  createAppointmentApi,
  Appointment,
  CreateAppointmentData 
} from '../../../../api/appointments';

import { fetchDoctorsApi } from '../../../../api/users';   // ← Using your existing file

const AppointmentStatus = {
  Pending: 0, Confirmed: 1, CheckedIn: 2, InConsultation: 3,
  Completed: 4, Cancelled: 5, NoShow: 6, Rescheduled: 7,
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Book New Appointment Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);   // You can create a Doctor interface later
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [bookForm, setBookForm] = useState({
    doctorId: '',
    appointmentDate: '',
    reason: ''
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    reason: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointmentsApi(token);
      setAppointments(data);
    } catch (error: any) {
      console.error(error);
      alert("Error loading your appointments");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await fetchDoctorsApi(token);
      setDoctors(data || []);
    } catch (error: any) {
      console.error("Failed to load doctors", error);
      alert("Could not load available doctors. Please try again.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBookNewClick = () => {
    setBookForm({
      doctorId: '',
      appointmentDate: new Date().toISOString().slice(0, 16),
      reason: ''
    });
    setShowBookModal(true);
    loadDoctors();                    // Load doctors when modal opens
  };

  const handleSaveNewAppointment = async () => {
    if (!bookForm.doctorId) return alert("Please select a doctor");
    if (!bookForm.appointmentDate) return alert("Please select date and time");

    try {
      const payload: CreateAppointmentData = {
        patientId: '',                    // Best: Let backend read PatientId from JWT token
        doctorId: bookForm.doctorId,
        appointmentDate: bookForm.appointmentDate,
        reason: bookForm.reason.trim()
      };

      await createAppointmentApi(token, payload);
      alert("Appointment booked successfully! Waiting for confirmation.");
      setShowBookModal(false);
      loadAppointments();
    } catch (error: any) {
      alert(error.message || "Failed to book appointment. Please try again.");
    }
  };

  const handleRescheduleClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    const date = new Date(apt.appointmentDate);
    setRescheduleForm({
      appointmentDate: date.toISOString().slice(0, 16),
      reason: apt.reason || ''
    });
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = async () => {
    if (!selectedAppointment) return;

    const id = selectedAppointment.id || (selectedAppointment as any).Id || (selectedAppointment as any).appointmentId;

    try {
      const payload = {
        AppointmentDate: rescheduleForm.appointmentDate,
        Reason: rescheduleForm.reason,
        Status: 7
      };

      await editAppointmentApi(token, id.toString(), payload);
      alert("Reschedule request submitted successfully!");
      setShowRescheduleModal(false);
      loadAppointments();
    } catch (error: any) {
      alert(error.message || "Failed to reschedule appointment");
    }
  };

  const handleCancel = async (apt: Appointment) => {
    const id = apt.id || (apt as any).Id || (apt as any).appointmentId;

    if (window.confirm(`Cancel appointment with ${apt.doctorName || 'this doctor'}?`)) {
      try {
        await deleteAppointmentApi(token, id.toString());
        alert("Appointment cancelled successfully");
        loadAppointments();
      } catch (error: any) {
        alert(error.message || "Cancellation failed");
      }
    }
  };

  const getStatusText = (status: string | number) => {
    const numeric = Number(status);
    return Object.keys(AppointmentStatus).find(
      key => (AppointmentStatus as any)[key] === numeric
    ) || status.toString();
  };

  const getStatusBadge = (status: string | number) => {
    const s = Number(status);
    if (s === 1 || s === 4) return 'bg-success';
    if (s === 0 || s === 7) return 'bg-warning text-dark';
    if (s === 5 || s === 6) return 'bg-danger';
    return 'bg-secondary';
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold text-primary">My Appointments</h4>
          <button className="btn btn-primary" onClick={handleBookNewClick}>
            <i className="bi bi-plus-lg me-2"></i>Book New Appointment
          </button>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Doctor / Specialist</th>
                  <th>Date & Time (PKT)</th>
                  <th>Reason for Visit</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5 text-muted">No appointments found.</td></tr>
                ) : appointments.map((apt) => (
                  <tr key={apt.id || (apt as any).Id}>
                    <td>
                      <div className="fw-bold">{apt.doctorName}</div>
                      <small className="text-muted">{apt.doctorSpecialty || '—'}</small>
                    </td>
                    <td>{new Date(apt.appointmentDate).toLocaleString('en-PK')}</td>
                    <td>{apt.reason || '—'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleRescheduleClick(apt)}
                        disabled={[4,5,6].includes(Number(apt.status))}
                      >
                        Reschedule
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancel(apt)}
                        disabled={[4,5,6].includes(Number(apt.status))}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================== BOOK NEW APPOINTMENT MODAL ====================== */}
      {showBookModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Book New Appointment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBookModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Doctor / Specialty</label>
                  <select 
                    className="form-select" 
                    value={bookForm.doctorId}
                    onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                    disabled={loadingDoctors}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((doc: any) => (
                      <option key={doc.id || doc.userId} value={doc.id || doc.userId}>
                        {doc.firstName} {doc.lastName} — {doc.specialization || 'General'} 
                        {doc.consultationFee ? ` (₹${doc.consultationFee})` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingDoctors && <small className="text-primary">Loading doctors...</small>}
                  {doctors.length === 0 && !loadingDoctors && <small className="text-muted">No doctors available</small>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Preferred Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    value={bookForm.appointmentDate}
                    onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Reason for Visit</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={bookForm.reason}
                    onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                    placeholder="Describe your symptoms or reason for the visit..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleSaveNewAppointment}>Book Appointment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Reschedule Appointment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRescheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-danger">New Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    value={rescheduleForm.appointmentDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Additional Notes</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={handleSaveReschedule}>Request Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}