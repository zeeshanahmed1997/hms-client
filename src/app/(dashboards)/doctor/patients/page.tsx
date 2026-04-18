'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPatientsByDoctorApi } from '@/src/api/users'; 
import { 
  HeartPulse, Search, Fingerprint, ChevronRight, Calendar, 
  Activity, Droplets, VenusAndMars, Mail, MessageCircle 
} from 'lucide-react';

import ChatModal from '../../../../components/chat/ChatModal';   // Adjust path if needed

export default function PatientsByDoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const token = useSelector((state: any) => state.auth?.token || state.auth?.user?.token);
  const currentUser = useSelector((state: any) => state.auth?.user || {});

  const doctorId = currentUser?.id || currentUser?.doctorId || currentUser?.userId;

  const queryClient = useQueryClient();

  const { 
    data: response, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['patientsByDoctor', doctorId],
    queryFn: async () => await fetchPatientsByDoctorApi(token, Number(doctorId)),
    enabled: !!token && !!doctorId && Number(doctorId) > 0,
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const patients = response?.data || [];

  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    return patients.filter((p: any) => {
      const fullName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
      const email = (p?.email || '').toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             email.includes(searchTerm.toLowerCase());
    });
  }, [patients, searchTerm]);

  const handleChatClick = (patient: any) => {
    setSelectedPatient(patient);
  };

  const closeChatModal = () => {
    setSelectedPatient(null);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Loading_Clinical_Data...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center max-w-md px-6">
          <div className="font-black text-rose-500 uppercase tracking-widest text-2xl mb-4">
            Failed_to_Load_Patients
          </div>
          <p className="text-slate-600 mb-6 text-sm">{error?.message}</p>
          <button onClick={() => refetch()} className="bg-slate-900 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl text-sm font-bold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-950 antialiased">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-5 border-r border-slate-100 pr-10">
            <div className="h-14 w-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-200">
              <HeartPulse size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                My_Patients_Registry
              </h1>
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity size={12} className="text-emerald-500"/> Live Clinical Session
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-6 rounded-2xl 
                         text-[13px] font-bold text-slate-950 outline-none 
                         focus:border-rose-500 focus:bg-white transition-all uppercase tracking-tight"
              placeholder="Search Patient Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-8 px-6">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Assigned</p>
              <p className="text-xl font-black text-slate-950">{patients.length}</p>
            </div>
            <div className="text-center border-l border-slate-100 pl-8">
              <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
              <p className="text-xl font-black text-emerald-500 uppercase">Online</p>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-6 text-left">Case_Hash</th>
                  <th className="px-10 py-6 text-left">Patient_Identity</th>
                  <th className="px-10 py-6 text-left">Bio_Data</th>
                  <th className="px-10 py-6 text-left">Contact_Node</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient: any) => (
                    <tr key={patient.id} className="hover:bg-rose-50/30 transition-all group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-black text-slate-300 group-hover:text-rose-500 transition-colors">
                          <Fingerprint size={14} />
                          {String(patient.id).slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-[11px] font-black uppercase">
                            {(patient.firstName?.[0] || '?')}{(patient.lastName?.[0] || '?')}
                          </div>
                          <div>
                            <span className="text-[15px] font-black text-slate-950 uppercase tracking-tight block">
                              {patient.firstName} {patient.lastName}
                            </span>
                            <span className="text-[9px] font-black text-blue-600 uppercase">Patient_Verified</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            <Calendar size={12} className="text-slate-400" /> {patient.age}y
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            <VenusAndMars size={12} className="text-slate-400" /> {patient.gender?.[0] || 'U'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                            <Droplets size={12} /> {patient.bloodGroup || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Mail size={14} className="text-slate-300" />
                          {patient.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => alert(`Viewing EHR for Patient ID: ${patient.id}`)}
                            className="flex items-center gap-2 bg-slate-950 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                          >
                            View_EHR <ChevronRight size={14} />
                          </button>

                          <button 
                            onClick={() => handleChatClick(patient)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95"
                          >
                            <MessageCircle size={16} />
                            CHAT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                      {searchTerm ? "No_Matching_Patients_Found" : "No_Patients_Assigned_Yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Beautiful Chat Modal */}
      {selectedPatient && (
        <ChatModal 
          // patient={selectedPatient} 
          onClose={closeChatModal} 
        />
      )}
    </div>
  );
}