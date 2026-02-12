'use client';
import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserApi, CreateUserData } from "@/src/api/users";
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
  Users,
  Stethoscope,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import './AddUser.css'; // ← keep your CSS file — suggested updates below

export default function AddUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth?.token || "");

  const mutation = useMutation<boolean, Error, CreateUserData>({
    mutationFn: (newUserData: CreateUserData) => createUserApi(token, newUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/dashboard/users');
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
    };

    mutation.mutate(data);
  };

  return (
    <div className="min-vh-100 hms-bg-gradient">
      <div className="container py-5" style={{ maxWidth: '1100px' }}>
        {/* Back + Title Bar */}
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
              <h4 className="mb-0 fw-semibold text-dark">Onboard New Staff</h4>
              <small className="text-muted">Add medical, nursing or administrative personnel</small>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-lg rounded-4 overflow-hidden hms-card">
          {/* Card Header – Medical style */}
          <div className="card-header bg-gradient-primary text-white px-5 py-4 border-0">
            <div className="d-flex align-items-center">
              <div className="me-4">
                <div className="avatar-lg bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                  <Stethoscope size={28} />
                </div>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">New Personnel Registration</h3>
                <p className="mb-0 opacity-85 small">
                  Please fill in accurate information. Credentials will be used for secure system access.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-body px-5 py-5">
            {/* ── Personal Information ── */}
            <h5 className="section-title mb-4 pb-2 border-bottom d-flex align-items-center gap-2 text-primary">
              <UserIcon size={20} />
              Personal Details
            </h5>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">First Name</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <UserIcon size={18} className="text-muted" />
                  </span>
                  <input
                    name="firstName"
                    className="form-control border-start-0"
                    placeholder="e.g. Ahmed"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">Last Name</label>
                <input
                  name="lastName"
                  className="form-control"
                  placeholder="e.g. Khan"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium text-dark">Age</label>
                <input
                  name="age"
                  type="number"
                  min="18"
                  className="form-control"
                  placeholder="28"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium text-dark">Gender</label>
                <select name="gender" className="form-select" required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium text-dark">Date of Birth (optional)</label>
                <input
                  name="dob"
                  type="date"
                  className="form-control"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium text-dark">Residential Address</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <MapPin size={18} className="text-muted" />
                  </span>
                  <input
                    name="address"
                    className="form-control border-start-0"
                    placeholder="House #12, Street 5, DHA Phase 6, Lahore"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Professional & Access ── */}
            <h5 className="section-title mb-4 pb-2 border-bottom d-flex align-items-center gap-2 text-primary">
              <ShieldCheck size={20} />
              Professional & System Access
            </h5>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">Hospital Email (Official)</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={18} className="text-muted" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="form-control border-start-0"
                    placeholder="dr.ahmed.khan@cityhospital.pk"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">Contact Number (WhatsApp preferred)</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <Phone size={18} className="text-muted" />
                  </span>
                  <input
                    name="phone"
                    className="form-control border-start-0"
                    placeholder="+92 321 1234567"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">Department / Role</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <Briefcase size={18} className="text-muted" />
                  </span>
                  <select name="role" className="form-select border-start-0" required>
                    <option value="">Select role...</option>
                    <option value="Admin">Administrator</option>
                    <option value="Doctor">Doctor / Consultant</option>
                    <option value="Nurse">Nurse / Paramedic</option>
                    <option value="Receptionist">Front Desk / Reception</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="LabTechnician">Lab Technician</option>
                    <option value="Accountant">Accounts / Finance</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium text-dark">Initial Password</label>
                <div className="input-group input-group-merge">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={18} className="text-muted" />
                  </span>
                  <input
                    name="password"
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Create secure password"
                    required
                  />
                </div>
                <small className="text-muted mt-1 d-block">
                  Password should be at least 8 characters. User can change it later.
                </small>
              </div>
            </div>

            {/* Error Message */}
            {mutation.isError && (
              <div className="alert alert-danger mt-5 d-flex align-items-center gap-3">
                <ShieldCheck size={20} className="flex-shrink-0" />
                <div>{mutation.error?.message || "Failed to register new staff member."}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top">
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
                {mutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Register Staff Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Optional subtle footer note */}
        <div className="text-center mt-5 text-muted small">
          <p>City Hospital Management System • Confidential • © 2026</p>
        </div>
      </div>
    </div>
  );
}