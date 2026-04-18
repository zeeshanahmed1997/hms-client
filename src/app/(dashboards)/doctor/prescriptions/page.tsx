'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  HeartPulse, Search, Calendar, FileText, 
  Plus, ChevronRight, Activity, AlertCircle 
} from 'lucide-react';
import { useMyPrescriptions } from '@/src/api/prescription';
import { Prescription } from '@/src/api/prescription';   // Import the type

export default function MyPrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>("all");

  // Get token from Redux
  const token = useSelector((state: any) => 
    state.auth?.token || state.auth?.user?.token
  );

  // Using your custom hook
  const { 
    data: prescriptions = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useMyPrescriptions();

  // Debug logs
  useEffect(() => {
    console.log('=== MyPrescriptionsPage Debug ===');
    console.log('Token exists:', !!token);
    console.log('Prescriptions received:', prescriptions?.length || 0);
    console.log('isLoading:', isLoading);
    console.log('isError:', isError);
    if (error) console.error('Error:', error);
  }, [token, prescriptions, isLoading, isError, error]);

  // Get unique patients for filter
  const patients = useMemo(() => {
    const patientMap = new Map<number, { id: number; name: string; email: string }>();

    prescriptions.forEach((pres: Prescription) => {
      if (pres.patientId && !patientMap.has(pres.patientId)) {
        patientMap.set(pres.patientId, {
          id: pres.patientId,
          name: pres.patientName || 'Unknown',
          email: pres.patientEmail || '',
        });
      }
    });

    return Array.from(patientMap.values());
  }, [prescriptions]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    let result = [...prescriptions];

    // Filter by selected patient
    if (selectedPatientId !== "all") {
      result = result.filter((p: Prescription) => 
        p.patientId?.toString() === selectedPatientId
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p: Prescription) =>
        (p.patientName || '').toLowerCase().includes(term) ||
        (p.instructions || '').toLowerCase().includes(term)
      );
    }

    return result;
  }, [prescriptions, selectedPatientId, searchTerm]);

  const queryClient = useQueryClient();

  const handleRefetch = () => {
    console.log('🔄 Manual refetch triggered');
    queryClient.invalidateQueries({ queryKey: ['myPrescriptions'] });
    refetch();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Loading_Prescriptions...
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={64} />
          <div className="font-black text-rose-500 uppercase tracking-widest text-2xl mb-3">
            Failed_to_Load_Prescriptions
          </div>
          <p className="text-slate-600 mb-6 text-sm">
            {error?.message || "Unable to fetch prescriptions. Please try again."}
          </p>
          <button 
            onClick={handleRefetch}
            className="bg-slate-950 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold transition-all"
          >
            Retry Fetch
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
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                My_Prescriptions
              </h1>
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity size={12} className="text-emerald-500"/> Clinical Records
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-[13px] font-bold text-slate-950 outline-none focus:border-rose-500 focus:bg-white transition-all uppercase tracking-tight"
              placeholder="Search patient or instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            href="/doctor/prescriptions/new"
            className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            New Prescription
          </Link>
        </div>

        {/* Patient Filter */}
        {prescriptions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <label className="text-sm font-black text-slate-500 uppercase tracking-wider">Filter by Patient:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* No Data */}
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 p-20 text-center border border-slate-100">
            <div className="mx-auto w-28 h-28 bg-rose-50 rounded-full flex items-center justify-center mb-8">
              <FileText size={60} className="text-rose-400" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">No Prescriptions Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-10">
              You haven't issued any prescriptions yet.<br />
              Start prescribing medicines to your patients.
            </p>
            <Link
              href="/doctor/prescriptions/new"
              className="inline-flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <Plus size={24} /> Create First Prescription
            </Link>
          </div>
        ) : (
          /* Prescriptions Table */
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-6 text-left">Date</th>
                    <th className="px-10 py-6 text-left">Patient</th>
                    <th className="px-10 py-6 text-left">Medicines</th>
                    <th className="px-10 py-6 text-left">Instructions</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPrescriptions.map((pres: Prescription) => (
                    <tr key={pres.id} className="hover:bg-rose-50/30 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                          <Calendar size={18} className="text-slate-400" />
                          {format(new Date(pres.prescriptionDate || pres.prescriptionDate || Date.now()), 'dd MMM yyyy')}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="font-semibold text-slate-900">{pres.patientName}</div>
                        {pres.patientEmail && (
                          <div className="text-xs text-slate-500">{pres.patientEmail}</div>
                        )}
                      </td>
                      <td className="px-10 py-6">
                        <span className="inline-flex items-center px-4 py-1.5 bg-rose-100 text-rose-700 rounded-2xl text-sm font-bold">
                          {pres.items?.length || 0} medicine{(pres.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm text-slate-600 max-w-md truncate">
                        {pres.instructions || <span className="text-slate-400">— No instructions</span>}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Link
                          href={`/doctor/prescriptions/${pres.id}`}
                          className="flex items-center justify-end gap-2 text-sm font-black text-slate-700 hover:text-rose-600 transition-colors group-hover:gap-3"
                        >
                          View Details <ChevronRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Debug Refetch Button - Remove after testing */}
        <div className="flex justify-end">
          <button
            onClick={handleRefetch}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-xl font-mono"
          >
            🔄 Force Refetch Prescriptions
          </button>
        </div>
      </div>
    </div>
  );
}