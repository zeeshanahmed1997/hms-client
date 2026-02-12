'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Fixed: Import useDispatch
import { useQuery } from '@tanstack/react-query';
import { CreateUserData, fetchUsersApi } from '@/src/api/users';
import { setAllUsers, User } from '@/src/redux/slices/userSlice';
import TopNavbar from '../../../../components/dashboard/TopNavBar';
import Sidebar from '../../../../components/dashboard/Sidebar';
import { Pencil, Trash, UserPlus, Search } from 'lucide-react';
import './UserManagement.css';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/src/components/dashboard/user-management/EditUserModal';
const EditUserModalComponent = EditUserModal as unknown as React.FC<{ user: User | null; onClose: () => void }>;

export default function UserManagementPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [editUserVisible, setEditUserVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const token = useSelector((state: any) => state.auth?.token || state.auth?.user?.token);
  const authUser = useSelector((state: any) => state.auth?.user);
  const [searchTerm, setSearchTerm] = useState('');
 function AddUserClickHandle()
 {
  router.push('/admin/user-management/add');
 }

  const { data: users, isSuccess, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users', token],
    queryFn: () => fetchUsersApi(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });

  // Sync with Redux
  useEffect(() => {
    if (isSuccess && users) {
      dispatch(setAllUsers(users)); 
    }
  }, [isSuccess, users, dispatch]);

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  };

  const getRoleBadgeClass = (role: string) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('admin')) return 'badge-admin';
    if (r.includes('doctor')) return 'badge-doctor';
    if (r.includes('nurse')) return 'badge-nurse';
    return 'badge-staff';
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    const lowerSearch = searchTerm.toLowerCase();
    return users.filter((u) =>
      u.firstName?.toLowerCase().includes(lowerSearch) ||
      u.email?.toLowerCase().includes(lowerSearch)
    );
  }, [users, searchTerm]);

  const handleEditUser = (userId: string) => {
    setEditUserVisible(true);
    setSelectedUser(users?.find(u => u.id === userId) || null);
  }
  const handleCloseEditModal = () => {
    setEditUserVisible(false);
    setSelectedUser(null);
  }
  if (!authUser && !token) return <div className="p-5 text-center">Loading Access...</div>;

  return (
    <div className="management-container w-100">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <div className="d-flex w-100">
        <Sidebar />
        <div className="flex-grow-1 min-vh-100 d-flex flex-column">
          <TopNavbar />
          <div className="container-fluid py-4 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
              <div>
                <h1 className="all-users-heading mb-0">Staff Directory</h1>
                <p className="text-muted small">Hospital Personnel Management</p>
              </div>
              <button className="btn btn-create d-flex align-items-center gap-2" onClick={AddUserClickHandle}>
                <UserPlus size={18} /> Add New Staff
              </button>
            </div>

            <div className="card user-card mb-4 w-100">
              <div className="card-body d-flex justify-content-end align-items-center gap-3 flex-wrap">
                <div className="search-wrapper position-relative flex-grow-1 me-4">
                  <Search className="search-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-control user-search-bar w-100 ps-5" 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="text-muted small text-nowrap">
                  <strong>{filteredUsers?.length || 0}</strong> Records Found
                </div>
              </div>
            </div>

            {/* Fixed Error Alert */}
            {isError && (
              <div className="alert alert-danger shadow-sm border-0">
                {error instanceof Error ? error.message : "Failed to fetch users"}
              </div>
            )}

            <div className="card user-card overflow-hidden w-100 border-0 shadow-sm">
              <div className="table-responsive w-100">
                <table className="table table-hover align-middle mb-0 w-100">
                  <thead>
                    <tr>
                      <th className="ps-4" style={{ width: '30%' }}>Full Name</th>
                      <th style={{ width: '30%' }}>Email Address</th>
                      <th style={{ width: '15%' }}>Role</th>
                      <th style={{ width: '15%' }}>Status</th>
                      <th className="text-center pe-4" style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <div className="spinner-border text-primary" role="status"></div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar-placeholder me-3">
                                {getInitials(item.firstName)}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{item.firstName + item.lastName}</div>
                                {/* <div className="text-muted extra-small">HMS-{item.id}</div> */}
                              </div>
                            </div>
                          </td>
                          <td><span className="text-secondary">{item.email}</span></td>
                          <td>
                            <span className={`role-badge ${getRoleBadgeClass(item.role)}`}>
                              {item.role}
                            </span>
                          </td>
                          <td>
                            <span className="status-dot"></span>
                            <span className="small text-muted">Active</span>
                          </td>
                          <td className="pe-4 text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn action-btn btn-edit" onClick={() => handleEditUser(item.id)}>
                                <Pencil size={16} />
                              </button>
                              <button className="btn action-btn btn-delete">
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {editUserVisible && selectedUser && (
                <div>Edit User Modal Placeholder
                <EditUserModalComponent user={selectedUser} onClose={handleCloseEditModal} />
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}