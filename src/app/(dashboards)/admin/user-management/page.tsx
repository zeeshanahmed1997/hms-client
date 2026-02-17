'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsersApi, deleteUserApi } from '@/src/api/users'; // assuming deleteUserApi exists
import { User } from '@/src/redux/slices/userSlice'; // keep type import
import TopNavbar from '../../../../components/dashboard/TopNavBar';
import Sidebar from '../../../../components/dashboard/Sidebar';
import { Pencil, Trash, UserPlus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/src/components/modals/EditUserModal';
import './UserManagement.css';

export default function UserManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useSelector((state: any) => state.auth?.token || state.auth?.user?.token);
  const authUser = useSelector((state: any) => state.auth?.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [editUserVisible, setEditUserVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery<User[], Error>({
    queryKey: ['users', token],
    queryFn: () => fetchUsersApi(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Delete mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (userId: string) => deleteUserApi(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', token] });
      alert('User deleted successfully.');
    },
    onError: (err) => {
      console.error('Delete failed:', err);
      alert('Failed to delete user. Please try again.');
    },
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  // Handlers
  const handleAddUser = () => {
    router.push('/admin/user-management/add');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserVisible(true);
  };

  const handleDeleteUser = (userId: string, name?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name || 'this user'}? This cannot be undone.`
    );
    if (confirmed) {
      deleteUser(userId);
    }
  };

  const handleCloseEditModal = () => {
    setEditUserVisible(false);
    setSelectedUser(null);
  };

  if (!authUser && !token) {
    return <div className="p-5 text-center">Loading access...</div>;
  }

  return (
    <div className="management-container">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="d-flex w-100">

        <div className="flex-grow-1 min-vh-100 d-flex flex-column">
          <div className="container-fluid py-4 flex-grow-1">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
              <div>
                <h1 className="all-users-heading mb-0">Staff Directory</h1>
                <p className="text-muted small">Hospital Personnel Management</p>
              </div>
              <button
                className="btn btn-create d-flex align-items-center gap-2"
                onClick={handleAddUser}
              >
                <UserPlus size={18} /> Add New Staff
              </button>
            </div>

            {/* Search & stats */}
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
                  <strong>{filteredUsers.length}</strong> Records Found
                </div>
              </div>
            </div>

            {/* Error */}
            {isError && (
              <div className="alert alert-danger shadow-sm border-0">
                {error?.message || 'Failed to load users'}
              </div>
            )}

            {/* Table */}
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
                          <div className="spinner-border text-primary" role="status" />
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar-placeholder me-3">
                                {user.firstName?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-secondary">{user.email}</span>
                          </td>
                          <td>
                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="status-dot" />
                            <span className="small text-muted">Active</span>
                          </td>
                          <td className="pe-4 text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn action-btn btn-edit"
                                onClick={() => handleEditUser(user)}
                                disabled={isDeleting}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="btn action-btn btn-delete"
                                onClick={() =>
                                  handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)
                                }
                                disabled={isDeleting}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal – render conditionally */}
      {editUserVisible && selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleCloseEditModal} />
      )}
    </div>
  );
}

// Keep your helper (moved outside)
function getRoleBadgeClass(role: string = '') {
  const r = role?.toLowerCase();
  if (r?.includes('admin')) return 'badge-admin';
  if (r?.includes('doctor')) return 'badge-doctor';
  if (r?.includes('nurse')) return 'badge-nurse';
  return 'badge-staff';
}