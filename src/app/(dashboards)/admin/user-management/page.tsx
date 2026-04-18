'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsersApi, deleteUserApi } from '@/src/api/users'; 
import { 
  Users, Search, UserPlus, Edit3, Trash2, Mail, 
  Fingerprint, ShieldCheck, Activity, Globe, ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/src/components/modals/EditUserModal';
import { toast } from 'react-hot-toast';

export default function UserManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserVisible, setEditUserVisible] = useState(false);

  const token = useSelector((state: any) => state.auth?.token || state.auth?.user?.token);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', token],
    queryFn: () => fetchUsersApi(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUserApi(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Registry Updated Successfully');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-950 antialiased">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Expanded Glass Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-5 border-r border-slate-100 pr-10">
            <div className="h-14 w-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-400 rotate-3 group-hover:rotate-0 transition-transform">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Personnel_Master_v2</h1>
              <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={12}/> Global Hospital Node
              </p>
            </div>
          </div>

          {/* Expanded Search Field */}
          <div className="flex-1 max-w-3xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-[13px] font-bold text-slate-950 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner uppercase tracking-tight"
              placeholder="Query Identity by Name, Role, or System Hash..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => router.push('/admin/user-management/add')}
            className="bg-blue-600 hover:bg-slate-950 text-white px-10 py-4 rounded-2xl text-xs font-black transition-all flex items-center gap-3 uppercase shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={18} /> Initialize_New_Entry
          </button>
        </div>

        {/* The Wide Ledger Container */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-6 text-left">Identity_Hash</th>
                  <th className="px-10 py-6 text-left">Personnel_Name</th>
                  <th className="px-10 py-6 text-left">Security_Tier</th>
                  <th className="px-10 py-6 text-left">Communication_Node</th>
                  <th className="px-10 py-6 text-right">System_Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-black text-slate-300 group-hover:text-blue-500 transition-colors">
                        <Fingerprint size={14} />
                        {String(user.id).slice(-10).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[11px] font-black uppercase shadow-lg group-hover:scale-110 transition-transform">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span className="text-[15px] font-black text-slate-950 uppercase tracking-tight truncate max-w-[250px]" title={`${user.firstName} ${user.lastName}`}>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${
                          user.role?.toLowerCase().includes('admin') 
                          ? 'bg-purple-50 text-purple-700 border-purple-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 group-hover:text-slate-950 transition-colors">
                        <Mail size={14} className="text-blue-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedUser(user); setEditUserVisible(true); }}
                          className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                        >
                          <Edit3 size={14} /> Edit_Data
                        </button>
                        <button 
                          onClick={() => { if(confirm(`PURGE RECORD: ${user.firstName}?`)) deleteMutation.mutate(user.id) }}
                          className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editUserVisible && selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setEditUserVisible(false)} />
      )}
    </div>
  );
}