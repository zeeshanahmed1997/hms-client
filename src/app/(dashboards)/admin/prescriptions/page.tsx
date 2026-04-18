'use client';

import { useAllPrescriptions } from '@/src/api/prescription';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Search, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Loader2, 
  Filter,
  Package
} from 'lucide-react';

export default function AllPrescriptionsPage() {
  // Using your existing API hook
  const { data: prescriptions = [], isLoading, error } = useAllPrescriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('all');

  // Filter Logic
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(p => {
      const matchesSearch = p.patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPatient = selectedPatient === 'all' || p.patientId.toString() === selectedPatient;
      return matchesSearch && matchesPatient;
    });
  }, [prescriptions, searchTerm, selectedPatient]);

  // Extract unique patients for the filter dropdown
  const patientsList = useMemo(() => {
    const unique = new Map();
    prescriptions.forEach(p => unique.set(p.patientId, p.patientName));
    return Array.from(unique.entries());
  }, [prescriptions]);

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500 opacity-50" />
    </div>
  );

  if (error) return (
    <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100 m-6">
      <h3 className="text-red-600 font-bold">Failed to load prescriptions</h3>
      <p className="text-sm text-red-400 mt-2">Please check your database connection.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header & Stats Card */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Prescription Ledger</h1>
              <p className="text-gray-500 font-medium mt-1">Review and manage all issued medical orders</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-4xl font-black text-blue-600">{prescriptions.length}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Issued</div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl shadow-lg shadow-blue-100 flex items-center justify-between text-white">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Quick Action</p>
              <h3 className="text-lg font-bold">Need a new order?</h3>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
              New Prescription
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              placeholder="Search by patient name..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-400 ml-2" />
            <select 
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="all">All Patients</option>
              {patientsList.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date Issued</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Patient Details</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Items</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Clinical Instructions</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPrescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white transition-colors">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {format(new Date(pres.prescriptionDate), 'dd MMM, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                          {pres.patientName.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{pres.patientName}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                        {pres.items.length} Medications
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-gray-500 max-w-xs truncate font-medium">
                        {pres.instructions || 'Routine follow-up as prescribed'}
                      </p>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPrescriptions.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <FileText className="h-12 w-12 text-gray-100" />
              <p className="text-gray-400 font-medium">No medical records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}