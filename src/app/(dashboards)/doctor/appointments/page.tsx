'use client';
import React, { useState } from 'react';
import {
  fetchAppointmentsApi,
  createAppointmentApi,
  editAppointmentApi,
  deleteAppointmentApi,
  generateTokenApi,
  updateQueueStatusApi,
  fetchTodayQueueApi,        // ← Added
  Appointment,
  CreateAppointmentData
} from '../../../../api/appointments';

import { fetchPatientsApi } from '../../../../api/users';
import { User } from '@/src/redux/slices/userSlice';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash, Clock, UserCheck, CheckCircle } from 'lucide-react';

const AppointmentStatus = {
  Pending: 0, Confirmed: 1, CheckedIn: 2, InConsultation: 3,
  Completed: 4, Cancelled: 5, NoShow: 6, Rescheduled: 7,
};

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const [activeTab, setActiveTab] = useState<'all' | 'today'>('all'); // Tab state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    reason: '',
    status: '0'
  });

  const getDoctorIdFromToken = (token: string): string => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || '';
    } catch (e) {
      console.error("Failed to decode token:", e);
      return '';
    }
  };

  // Queries
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => fetchAppointmentsApi(token),
    enabled: !!token && activeTab === 'all',
  });

  const { data: todayQueue = [], isLoading: isLoadingTodayQueue } = useQuery({
    queryKey: ['todayQueue'],
    queryFn: () => fetchTodayQueueApi(token),
    enabled: !!token && activeTab === 'today',
  });

  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchPatientsApi(token),
    enabled: !!token,
  });

  const filteredPatients = React.useMemo(() => {
    if (!patientSearchTerm.trim()) return patients;
    const term = patientSearchTerm.toLowerCase().trim();
    return patients.filter((p: User) =>
      `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(term) ||
      (p.phoneNumber?.toLowerCase() || '').includes(term) ||
      (p.email?.toLowerCase() || '').includes(term) ||
      (p.id?.toLowerCase() || '').includes(term)
    );
  }, [patientSearchTerm, patients]);

  // Mutations
  const generateTokenMutation = useMutation({
    mutationFn: (appointmentId: string) => generateTokenApi(token, appointmentId),
    onSuccess: (data) => {
      alert(`✅ Token Generated Successfully: ${data.tokenNumber}`);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['todayQueue'] });
    },
    onError: () => alert("Failed to generate token"),
  });

  const updateQueueMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateQueueStatusApi(token, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['todayQueue'] });
    },
    onError: () => alert("Failed to update queue status"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentData) => createAppointmentApi(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert("✅ Appointment scheduled successfully!");
      setShowCreateModal(false);
      resetCreateForm();
    },
    onError: (error: any) => alert(error.message || "Failed to create appointment"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      editAppointmentApi(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert("✅ Appointment updated successfully!");
      setShowEditModal(false);
    },
    onError: (error: any) => alert(error.message || "Failed to update appointment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointmentApi(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert("✅ Appointment cancelled successfully");
    },
    onError: (error: any) => alert(error.message || "Cancellation failed"),
  });

  const resetCreateForm = () => {
    const doctorId = getDoctorIdFromToken(token);
    setForm({
      patientId: '',
      doctorId,
      appointmentDate: new Date().toISOString().slice(0, 16),
      reason: '',
      status: '0'
    });
    setPatientSearchTerm('');
  };

  const handleNewClick = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const handleSaveCreate = () => {
    if (!form.patientId) return alert("Please select a patient");
    const payload: CreateAppointmentData = {
      patientId: form.patientId,
      doctorId: form.doctorId,
      appointmentDate: form.appointmentDate,
      reason: form.reason.trim(),
    };
    createMutation.mutate(payload);
  };

  const handleEditClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    const formattedDate = new Date(apt.appointmentDate).toISOString().slice(0, 16);
    setForm({
      patientId: apt.patientId || '',
      doctorId: apt.doctorId || '',
      appointmentDate: formattedDate,
      reason: apt.reason || '',
      status: apt.status?.toString() || '0'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;
    const id = selectedAppointment.id || (selectedAppointment as any).Id || (selectedAppointment as any).appointmentId;
    if (!id) return alert("Appointment ID not found");

    const payload = {
      AppointmentDate: form.appointmentDate,
      Reason: form.reason.trim(),
      Status: parseInt(form.status),
    };
    updateMutation.mutate({ id: id.toString(), payload });
  };

  const handleDelete = (apt: Appointment) => {
    const id = apt.id || (apt as any).Id || (apt as any).appointmentId;
    if (!id) return alert("Cannot find appointment ID");
    if (window.confirm(`Cancel appointment for ${apt.patientName || 'this patient'}?`)) {
      deleteMutation.mutate(id.toString());
    }
  };

  const handleGenerateToken = (id: string | number) => {
    if (window.confirm("Generate Token for this appointment?")) {
      generateTokenMutation.mutate(id.toString());
    }
  };

  const handleQueueStatus = (id: string | number, status: string) => {
    if (window.confirm(`Mark as ${status}?`)) {
      updateQueueMutation.mutate({ id: id.toString(), status });
    }
  };

const getStatusConfig = (status: number | string) => {
  // Normalize string status to number
  if (typeof status === 'string' && isNaN(Number(status))) {
    const stringMap: Record<string, number> = {
      'Pending': 0,
      'Confirmed': 1,
      'CheckedIn': 2,
      'InConsultation': 3,
      'Completed': 4,
      'Cancelled': 5,
      'NoShow': 6,
      'Rescheduled': 7,
    };
    status = stringMap[status] ?? -1;
  }

  const s = Number(status);
  const config: Record<number, { text: string; color: string; icon: string; bg: string }> = {
    0: { text: "Pending",        color: "text-warning", icon: "⏳", bg: "bg-warning-subtle"  },
    1: { text: "Confirmed",      color: "text-success", icon: "✅", bg: "bg-success-subtle"  },
    2: { text: "Checked In",     color: "text-info",    icon: "📍", bg: "bg-info-subtle"     },
    3: { text: "In Consultation",color: "text-primary", icon: "👨‍⚕️", bg: "bg-primary-subtle" },
    4: { text: "Completed",      color: "text-success", icon: "🎉", bg: "bg-success-subtle"  },
    5: { text: "Cancelled",      color: "text-danger",  icon: "❌", bg: "bg-danger-subtle"   },
    6: { text: "No Show",        color: "text-danger",  icon: "⚠️", bg: "bg-danger-subtle"   },
    7: { text: "Rescheduled",    color: "text-warning", icon: "🔄", bg: "bg-warning-subtle"  },
  };

  return config[s] ?? { text: "Unknown", color: "text-secondary", icon: "❓", bg: "bg-secondary-subtle" };
};
debugger;
  const displayAppointments = activeTab === 'today' ? todayQueue : appointments;
  const isLoading = activeTab === 'today' ? isLoadingTodayQueue : isLoadingAppointments;
debugger;
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Appointments</h2>
          <p className="text-muted mb-0">Professional Schedule with Token System</p>
        </div>
        <button className="btn btn-primary btn-lg shadow" onClick={handleNewClick}>
          <i className="bi bi-plus-lg me-2"></i>New Appointment
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Appointments
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Today's Queue
          </button>
        </li>
      </ul>

      <div className="card shadow border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr>
                  <th className="ps-4 py-3">Patient</th>
                  <th className="py-3">Date & Time</th>
                  <th className="py-3">Token Number</th>
                  <th className="py-3">Queue Status</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3">Status</th>
                  <th className="text-center py-3 pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <p className="text-muted">Loading...</p>
                    </td>
                  </tr>
                ) : displayAppointments.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">
                    {activeTab === 'today' ? "No appointments for today" : "No appointments found"}
                  </td></tr>
                ) : (
                  displayAppointments.map((apt) => {
                    const statusConfig = getStatusConfig(apt.status);
                    const hasToken = apt.tokenNumber;
                    debugger;
                    return (
                      <tr key={apt.id || (apt as any).Id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
                              style={{ width: '48px', height: '48px', fontSize: '22px' }}>
                              👤
                            </div>
                            <div>
                              <div className="fw-bold fs-5 text-dark">{apt.patientName}</div>
                              <div className="text-muted small">
                                {apt.patientPhone && <span>📞 {apt.patientPhone}</span>}
                                {apt.patientEmail && <span className="ms-2">✉️ {apt.patientEmail}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="fw-medium">
                            {new Date(apt.appointmentDate).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-muted small">
                            {new Date(apt.appointmentDate).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })} PKT
                          </div>
                        </td>
                        <td className="py-3">
                          {hasToken ? (
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary fs-5 px-3 py-2 rounded-pill fw-bold">
                                {apt.tokenNumber}
                              </span>
                              <CheckCircle size={18} className="text-success" />
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`badge px-3 py-2 ${apt.queueStatus === 'InProgress' ? 'bg-success' : apt.queueStatus === 'Waiting' ? 'bg-warning' : 'bg-secondary'} text-white`}>
                            {apt.queueStatus || 'Not Generated'}
                          </span>
                        </td>
                        <td className="py-3 text-truncate" style={{ maxWidth: '260px' }}>
                          {apt.reason || <span className="text-muted fst-italic">No reason provided</span>}
                        </td>
                        <td className="py-3">
                          <span className={`badge ${statusConfig.bg} ${statusConfig.color} px-3 py-2 rounded-pill fw-medium`}>
                            {statusConfig.icon} {statusConfig.text}
                          </span>
                        </td>
                        <td className="text-center py-3 pe-4">
                          <div className="d-flex gap-2 justify-content-center flex-wrap">
                            {!hasToken && (
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleGenerateToken(apt.id || (apt as any).Id)}>
                                <Clock size={16} className="me-1" /> Generate Token
                              </button>
                            )}

                            {apt.queueStatus === 'Waiting' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleQueueStatus(apt.id || (apt as any).Id, 'InProgress')}>
                                <UserCheck size={16} className="me-1" /> Call Patient
                              </button>
                            )}

                            {apt.queueStatus === 'InProgress' && (
                              <button className="btn btn-sm btn-info" onClick={() => handleQueueStatus(apt.id || (apt as any).Id, 'Completed')}>
                                Mark Completed
                              </button>
                            )}

                            <Pencil size={18} className="text-primary cursor-pointer" onClick={() => handleEditClick(apt)} />
                            <Trash size={18} className="text-danger cursor-pointer" onClick={() => handleDelete(apt)} />
                          </div>
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

      {/* Create & Edit Modals (Keep your existing modals here) */}
 {/* Edit Modal (unchanged for brevity but still included) */}
      {showEditModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-success text-white border-0 rounded-top-4">
                <h5 className="modal-title fw-bold">✏️ Edit Appointment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Status and other fields same as before */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Update Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {Object.entries(AppointmentStatus).map(([key, value]) => (
                      <option key={value} value={value}>{key}</option>
                    ))}
                  </select>
                </div>

                {parseInt(form.status) === AppointmentStatus.Rescheduled && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-danger">New Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.appointmentDate}
                      onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Reason / Notes</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary px-4" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button
                  className="btn btn-success px-4"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}