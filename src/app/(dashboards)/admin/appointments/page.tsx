'use client';
import React, { useEffect, useState } from 'react';
import { 
  fetchAppointmentsApi, 
  deleteAppointmentApi, 
  editAppointmentApi, 
  createAppointmentApi,
  Appointment,
  CreateAppointmentData,
  fetchAllAppointmentsApi
} from '../../../../api/appointments';

const AppointmentStatus = {
  Pending: 0, Confirmed: 1, CheckedIn: 2, InConsultation: 3,
  Completed: 4, Cancelled: 5, NoShow: 6, Rescheduled: 7,
};

export default function AllAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    reason: '',
    status: '0'
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const getDoctorIdFromToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAppointmentsApi(token);
      setAppointments(data);
    } catch (error) {
      alert("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };


  const handleSaveCreate = async () => {
    if(!form.patientId) return alert("Please enter a Patient ID");
    try {
      const payload: CreateAppointmentData = {
        patientId: form.patientId,
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        reason: form.reason
      };

      await createAppointmentApi(token, payload);
      alert("Appointment scheduled successfully");
      setShowCreateModal(false);
      loadAppointments();
    } catch (error: any) {
      alert(error.message || "Failed to create appointment");
    }
  };

  const handleEditClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    const date = new Date(apt.appointmentDate);
    const formattedDate = date.toISOString().slice(0, 16);

    setForm({
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      appointmentDate: formattedDate,
      reason: apt.reason,
      status: apt.status.toString()
    });
    setShowEditModal(true);
  };

const handleSaveEdit = async () => {
  if (!selectedAppointment) return;

  // Use 'id' from the AppointmentDto we fixed earlier
  const id = selectedAppointment.id || (selectedAppointment as any).Id;
debugger;
  try {
    const payload = {
      // Ensure names match the C# UpdateAppointmentRequest properties
      AppointmentDate: form.appointmentDate,
      Reason: form.reason,
      Status: parseInt(form.status) // MUST be an integer for the API to accept it
    };

    // Notice we use the 'id' variable here
    await editAppointmentApi(token, id.toString(), payload);
    
    alert("Appointment updated successfully");
    setShowEditModal(false);
    loadAppointments();
  } catch (error: any) {
    // This will now show the specific validation error from the 400 response
    console.error("Update Error:", error);
    alert(error.message || "Failed to update");
  }
};
  const handleDelete = async (apt: Appointment) => {
    const id = (apt as any).appointmentId || (apt as any).id;
    
    if (window.confirm(`Cancel appointment for ${apt.patientName}?`)) {
      try {
        await deleteAppointmentApi(token, id);
        alert("Appointment cancelled successfully");
        loadAppointments();
      } catch (error) {
        alert("Cancellation failed");
      }
    }
  };

  const getStatusText = (status: string | number) => {
    const numericStatus = Number(status);
    return Object.keys(AppointmentStatus).find(
      (key) => (AppointmentStatus as any)[key] === numericStatus
    ) || status; 
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
      {/* ... Table UI remains same ... */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Date & Time (PKT)</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5">Loading...</td></tr>
                ) : appointments.map((apt, index) => (
                  <tr key={index}>
                    <td>
                        <div className="fw-bold">{apt.patientName}</div>
                        <small className="text-muted">{apt.patientPhone}</small>
                    </td>
                    <td>{new Date(apt.appointmentDate).toLocaleString('en-PK')}</td>
                    <td>{apt.reason}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(apt)}>View</button>
                      {/* <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(apt)}>Cancel</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE MODAL Code ... */}
      {/* EDIT MODAL Code ... */}
      {/* (Keep modals exactly as you had them, ensuring handleSaveEdit is called) */}
      
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Schedule New Patient</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label fw-bold">Doctor ID (Logged In)</label>
                            <input type="text" className="form-control bg-light" value={form.doctorId} readOnly />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Patient ID</label>
                            <input type="text" className="form-control border-primary" value={form.patientId} 
                                onChange={(e) => setForm({...form, patientId: e.target.value})} placeholder="Required: Enter Patient ID" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Date</label>
                            <input type="datetime-local" className="form-control" value={form.appointmentDate}
                                onChange={(e) => setForm({...form, appointmentDate: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Reason</label>
                            <textarea className="form-control" rows={3} value={form.reason}
                                onChange={(e) => setForm({...form, reason: e.target.value})} placeholder="Reason for visit" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                        <button className="btn btn-success" onClick={handleSaveCreate}>Schedule Appointment</button>
                    </div>
                </div>
            </div>
        </div>
      )}

     {showEditModal && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content border-0 shadow">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Appointment Details</h5>
          <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
        </div>
        <div className="modal-body">
          
          {/* Status Selection First (Better UX flow) */}
          <div className="mb-3">
            <label className="form-label fw-bold"> Status</label>
            <select disabled className="form-select border-info" value={form.status} 
              onChange={(e) => setForm({...form, status: e.target.value})}>
              {Object.entries(AppointmentStatus).map(([key, value]) => (
                <option key={value} value={value}>{key}</option>
              ))}
            </select>
          </div>

          {/* CONDITIONAL DATE PICKER: Only show if Status is Rescheduled (7) */}
          {parseInt(form.status) === AppointmentStatus.Rescheduled && (
            <div className="mb-3 animate__animated animate__fadeIn">
              <label className="form-label fw-bold text-danger">New Rescheduled Date</label>
              <input 
                type="datetime-local" 
                className="form-control border-danger" 
                value={form.appointmentDate}
                onChange={(e) => setForm({...form, appointmentDate: e.target.value})} 
              />
              <small className="text-muted">Please select the new time for this patient.</small>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-bold">Reason / Notes</label>
            <textarea disabled className="form-control" rows={3} value={form.reason}
              onChange={(e) => setForm({...form, reason: e.target.value})} />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}