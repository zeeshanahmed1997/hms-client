'use client';

import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Search, FileText, ChevronRight, Activity, 
  AlertCircle, Stethoscope, Clock, X, Pill, Info, MessageCircle
} from 'lucide-react';

// API and Components
import { useMyPrescriptions, Prescription } from '@/src/api/prescription';
import ChatModal from '../../../../components/chat/ChatModal'

export default function PatientPrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  
  // --- MODAL STATES ---
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [isChatHubOpen, setIsChatHubOpen] = useState(false);
  const [activeDoctorForChat, setActiveDoctorForChat] = useState<any>(null);

  const { 
    data: prescriptions = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useMyPrescriptions();

  // Extract unique doctors for filter
  const doctors = useMemo(() => {
    const doctorMap = new Map<number, { id: number; name: string }>();
    prescriptions.forEach((pres: Prescription) => {
      if (pres.doctorId && !doctorMap.has(pres.doctorId)) {
        doctorMap.set(pres.doctorId, {
          id: pres.doctorId,
          name: pres.doctorName || 'Unknown Doctor',
        });
      }
    });
    return Array.from(doctorMap.values());
  }, [prescriptions]);

  // Handlers
  const handleOpenDetails = (prescription: Prescription) => {
    setActivePrescription(prescription);
  };

  const handleChatWithDoctor = (pres: Prescription) => {
    setActiveDoctorForChat({
      id: pres.doctorId,
      firstName: pres.doctorName || 'Doctor', // Matches ChatModal expectations
    });
    setIsChatHubOpen(true);
  };

  const filteredPrescriptions = useMemo(() => {
    let result = [...prescriptions];
    if (selectedDoctor !== "all") {
      result = result.filter((p: Prescription) => p.doctorId?.toString() === selectedDoctor);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p: Prescription) =>
        (p.doctorName || '').toLowerCase().includes(term) ||
        (p.instructions || '').toLowerCase().includes(term) ||
        p.items.some(item => (item.medicineName || '').toLowerCase().includes(term))
      );
    }
    return result;
  }, [prescriptions, selectedDoctor, searchTerm]);

  const queryClient = useQueryClient();

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['prescriptions', 'my'] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse font-black text-blue-400 uppercase tracking-widest">
          Fetching_Medical_Records...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={64} />
          <div className="font-black text-rose-500 uppercase tracking-widest text-2xl mb-3">Connection_Error</div>
          <p className="text-slate-600 mb-6 text-sm">{error?.message || "Failed to retrieve prescriptions."}</p>
          <button onClick={handleRefetch} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-950 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">My_Health_Vault</h1>
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity size={12} className="text-blue-500"/> Personal Prescription History
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-[13px] font-bold outline-none focus:border-blue-500 transition-all uppercase"
              placeholder="Search by medicine or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-3">
            <Stethoscope size={18} className="text-blue-500" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Doctors</option>
              {doctors.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
            </select>
          </div>
        </div>

        {/* Prescription List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] py-24 text-center border border-slate-200">
              <Clock size={40} className="mx-auto text-blue-200 mb-4" />
              <h3 className="text-2xl font-black text-slate-800 uppercase">No Records Found</h3>
            </div>
          ) : (
            filteredPrescriptions.map((pres: Prescription) => (
              <button 
                key={pres.id} 
                onClick={() => handleOpenDetails(pres)}
                className="group bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-blue-500 hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl group-hover:bg-blue-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{format(new Date(pres.prescriptionDate), 'MMM')}</span>
                    <span className="text-2xl font-black text-slate-800">{format(new Date(pres.prescriptionDate), 'dd')}</span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Stethoscope size={14} className="text-blue-500" />
                      <h4 className="font-black text-slate-900 uppercase">Dr. {pres.doctorName}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pres.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-[11px] font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{item.medicineName}</span>
                      ))}
                      {pres.items.length > 3 && <span className="text-[11px] font-bold text-blue-500">+{pres.items.length - 3} more</span>}
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight size={24} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- POPUP / MODAL OVERLAY --- */}
      {activePrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Medical Record</p>
                <h2 className="text-2xl font-black uppercase mt-1">Dr. {activePrescription.doctorName}</h2>
                <div className="flex items-center gap-2 mt-2 text-blue-100 text-xs font-bold">
                  <Clock size={14} />
                  {format(new Date(activePrescription.prescriptionDate), 'PPPP')}
                </div>
              </div>
              <button 
                onClick={() => setActivePrescription(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <Pill size={18} />
                    <h3 className="font-black uppercase text-sm tracking-widest">Medications</h3>
                  </div>
                  <div className="grid gap-3">
                    {activePrescription.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="font-black text-slate-900 uppercase text-sm">{item.medicineName}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          Dosage: {item.dosage} | Frequency: {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {activePrescription.instructions && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <Info size={18} />
                      <h3 className="font-black uppercase text-sm tracking-widest">General Instructions</h3>
                    </div>
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 border-dashed">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                        "{activePrescription.instructions}"
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Modal Footer with Chat Option */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <button 
                onClick={() => handleChatWithDoctor(activePrescription)}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-200 shadow-sm"
              >
                <MessageCircle size={18} />
                Message Doctor
              </button>

              <button 
                onClick={() => setActivePrescription(null)}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAT HUB MODAL --- */}
      {isChatHubOpen && (
        <ChatModal 
          initialPatient={activeDoctorForChat} 
          onClose={() => {
            setIsChatHubOpen(false);
            setActiveDoctorForChat(null);
          }} 
        />
      )}
    </div>
  );
}