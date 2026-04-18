'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserApi, CreateUserData } from "@/src/api/users";
import { Department, fetchDepartmentsApi } from "@/src/api/departments";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Lock,
  User as UserIcon,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import './AddUser.css';

export default function AddUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const token = useSelector((state: RootState) => state.auth?.token || "");

  const { data: departments, isLoading: isDeptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchDepartmentsApi(token),
    enabled: !!token && selectedRole === "Doctor",
    staleTime: 1000 * 60 * 10,
  });

  const mutation = useMutation<boolean, Error, CreateUserData>({
    mutationFn: (newUserData: CreateUserData) => createUserApi(token, newUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/admin/user-management');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateUserData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      age: Number(formData.get('age')),
      address: formData.get('address') as string,
      phoneNumber: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
      speciality: formData.get('speciality') as string,
      consultationFee: formData.get('consultationFee') ? Number(formData.get('consultationFee')) : undefined,
      departmentId: formData.get('departmentId') ? Number(formData.get('departmentId')) : undefined,
      emergencyContact: formData.get('emergencyContact') as string,
      bloodGroup: formData.get('bloodGroup') as string,
    };

    mutation.mutate(data);
  };

  return (
    <div className="min-vh-100 hms-bg-gradient">
      <div className="container py-5" style={{ maxWidth: '1100px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <button
            onClick={() => router.back()}
            className="btn btn-link text-muted d-flex align-items-center gap-2 ps-0"
          >
            <ArrowLeft size={18} />
            <span>Back to Staff Directory</span>
          </button>

          <div className="d-flex align-items-center gap-3">
            <div className="hms-icon-circle bg-primary-subtle text-primary">
              <UserPlus size={24} />
            </div>
            <div>
              <h4 className="mb-0 fw-semibold text-dark">Onboard New Personnel</h4>
              <small className="text-muted">Register system users with role-specific data</small>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-lg rounded-4 overflow-hidden hms-card">
          <div className="card-header bg-gradient-primary text-white px-5 py-4 border-0">
            <div className="d-flex align-items-center">
              <div className="me-4">
                <div className="avatar-lg bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                  <Stethoscope size={28} />
                </div>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Registration Portal</h3>
                <p className="mb-0 opacity-85 small">Required fields adapt based on the selected role.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-body px-5 py-5">
            <h5 className="section-title mb-4 pb-2 border-bottom d-flex align-items-center gap-2 text-primary">
              <UserIcon size={20} />
              Personal Details
            </h5>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="form-label fw-medium">First Name</label>
                <input name="firstName" className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Last Name</label>
                <input name="lastName" className="form-control" required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Age</label>
                <input name="age" type="number" min="1" className="form-control" required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Gender</label>
                <select name="gender" className="form-select" required>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-medium">Residential Address</label>
                <div className="input-group">
                  <span className="input-group-text"><MapPin size={18} /></span>
                  <input name="address" className="form-control" required />
                </div>
              </div>
            </div>

            <h5 className="section-title mb-4 pb-2 border-bottom d-flex align-items-center gap-2 text-primary">
              <ShieldCheck size={20} />
              System Access & Role
            </h5>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="form-label fw-medium">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><Mail size={18} /></span>
                  <input name="email" type="email" className="form-control" required />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text"><Phone size={18} /></span>
                  <input name="phone" className="form-control" required />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Role</label>
                <div className="input-group">
                  <span className="input-group-text"><Briefcase size={18} /></span>
                  <select 
                    name="role" 
                    className="form-select" 
                    required 
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">Select role...</option>
                    <option value="Admin">Administrator</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={18} /></span>
                  <input name="password" type="password" className="form-control" required />
                </div>
              </div>
            </div>

            {selectedRole === "Doctor" && (
              <div className="row g-4 mb-5 p-4 bg-light rounded-3 border-start border-primary border-4 shadow-sm">
                <div className="col-12"><h6 className="fw-bold text-primary">Professional Details</h6></div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Department</label>
                  <select name="departmentId" className="form-select" required>
                    <option value="">{isDeptsLoading ? "Loading..." : "Select Department..."}</option>
                    {departments?.map((dept: Department) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Specialization</label>
                  <input name="speciality" className="form-control" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Fee (PKR)</label>
                  <input name="consultationFee" type="number" className="form-control" required />
                </div>
              </div>
            )}

            {selectedRole === "Patient" && (
              <div className="row g-4 mb-5 p-4 bg-light rounded-3 border-start border-danger border-4 shadow-sm">
                <div className="col-12"><h6 className="fw-bold text-danger">Emergency & Medical</h6></div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Emergency Contact</label>
                  <input name="emergencyContact" className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Blood Group</label>
                  <select name="bloodGroup" className="form-select" required>
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            )}

            {mutation.isError && (
              <div className="alert alert-danger d-flex align-items-center gap-3">
                <ShieldCheck size={20} />
                <div>{mutation.error?.message || "Registration failed."}</div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-3 pt-4 border-top">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline-secondary px-5"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary px-5 d-flex align-items-center gap-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}