'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Stethoscope, Plus, MoreHorizontal, Mail, 
  HeartPulse, Award, Clock, Edit, X 
} from 'lucide-react';

import { fetchDoctorsApi, updateUserApi, CreateUserData } from '@/src/api/users'; // Adjust path if needed

export default function DoctorManagementPage() {
  const token = useSelector((state: any) => state.auth.token);
  const queryClient = useQueryClient();

  const { 
    data: doctors = [], 
    isLoading 
  } = useQuery({
    queryKey: ['doctors', token],
    queryFn: () => fetchDoctorsApi(token!),
    enabled: !!token,
  });

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    age: 0,
    address: '',
    password: '',           // Usually optional for updates
    gender: '',
    role: 'DOCTOR',
    speciality: '',
    consultationFee: 0,
    bloodGroup: '',
    emergencyContact: '',
    departmentId: undefined,
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateUserData }) =>
      updateUserApi(token!, userId, data),
    onSuccess: () => {
      alert('Profile updated successfully!');
      setSelectedDoctor(null);
      // Refresh the doctors list
      queryClient.invalidateQueries({ queryKey: ['doctors', token] });
    },
    onError: (error: any) => {
      alert(`Update failed: ${error.message || 'Unknown error'}`);
    },
  });

  const handleEditProfile = (doctor: any) => {
    setSelectedDoctor(doctor);
    setFormData({
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      phoneNumber: doctor.phoneNumber || '',
      age: doctor.age || 0,
      address: doctor.address || '',
      password: '',                    // Leave empty for updates (backend usually ignores if empty)
      gender: doctor.gender || '',
      role: doctor.role || 'DOCTOR',
      speciality: doctor.speciality || '',
      consultationFee: doctor.consultationFee || 0,
      bloodGroup: doctor.bloodGroup || '',
      emergencyContact: doctor.emergencyContact || '',
      departmentId: doctor.departmentId,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'consultationFee' || name === 'departmentId' 
        ? Number(value) || undefined 
        : value,
    }));
  };

  const handleSave = () => {
    if (!selectedDoctor) return;
    
    // Remove password if empty (common practice for updates)
    const dataToSend = { ...formData };
    if (!dataToSend.password) delete (dataToSend as any).password;

    updateMutation.mutate({
      userId: selectedDoctor.id.toString(),
      data: dataToSend,
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DoctorBannerStat label="TOTAL_PHYSICIANS" value={doctors.length} icon={<Stethoscope size={18}/>} color="bg-blue-600" />
          <DoctorBannerStat label="SURGICAL_UNIT" value={Math.floor(doctors.length * 0.3)} icon={<HeartPulse size={18}/>} color="bg-rose-500" />
          <DoctorBannerStat label="ON_CALL_NOW" value="08" icon={<Clock size={18}/>} color="bg-amber-500" />
        </div>

        {/* Sub-Header */}
        <div className="flex justify-between items-center bg-white/50 p-1 px-4 rounded-full border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical_Credentialing_System</p>
          <button className="text-blue-600 text-[10px] font-black hover:underline uppercase">Sync_Records</button>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {doctors.map((doc: any) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {doc.firstName?.[0]}{doc.lastName?.[0]}
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">Verified_MD</span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                    DR. {doc.firstName} {doc.lastName}
                  </h3>
                  <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">{doc.role}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium truncate">
                    <Mail size={10} className="text-slate-300" /> {doc.email}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Award size={10} className="text-slate-300" /> REF: {String(doc.id).slice(-5).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t">
                <button 
                  onClick={() => handleEditProfile(doc)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Edit size={13} />
                  EDIT_PROFILE
                </button>
                <button className="text-slate-300 hover:text-rose-500 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Doctor Button */}
          <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all min-h-[180px]">
            <Plus size={24} />
            <span className="text-[10px] font-black uppercase">Onboard_Physician</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-8 py-5">
              <h2 className="text-2xl font-black text-slate-900">
                Edit Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
              </h2>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">FIRST NAME</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">LAST NAME</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">PHONE NUMBER</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">SPECIALITY</label>
                  <input
                    type="text"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">CONSULTATION FEE ($)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* You can add more fields here if needed (age, gender, address, etc.) */}
            </div>

            {/* Footer */}
            <div className="border-t px-8 py-5 flex gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="flex-1 py-3.5 border border-slate-300 rounded-2xl font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-semibold transition-all"
              >
                {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Keep your existing DoctorBannerStat component
function DoctorBannerStat({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
      <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}