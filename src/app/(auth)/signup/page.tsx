'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch } from '@/src/redux/hooks';
import { signup } from '@/src/redux/slices/authSlice';
import { SignUpFormData } from '@/src/types/auth/signup';
import './signup.css'; // Import your new CSS file
import { 
  Stethoscope, Mail, Lock, User, 
  Phone, ChevronRight, Briefcase 
} from 'lucide-react';

export default function SignUpPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setError('');
    
    const formData = new FormData(formRef.current);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const data: SignUpFormData = {
      firstName: (formData.get('firstName') as string)?.trim(),
      lastName: (formData.get('lastName') as string)?.trim(),
      email: (formData.get('email') as string)?.trim(),
      password,
      confirmPassword,
      gender: formData.get('gender') as string,
      age: parseInt(formData.get('age') as string) || 0,
      address: (formData.get('address') as string)?.trim(),
      phoneNumber: (formData.get('phoneNumber') as string)?.trim(),
      role: formData.get('role') as string,
      department: formData.get('department') as string,
    };

    setIsLoading(true);

    dispatch(signup(data))
      .unwrap()
      .then((payload) => {
        const token = payload.token;
        if (token) {
          Cookies.set('hms_auth_token', token, { expires: 7, path: '/' });
        }
        router.push('/dashboard');
      })
      .catch((err) => {
        setError(err.message || 'Registration failed');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="header">
          <div className="icon-wrapper">
            <Stethoscope size={32} />
          </div>
          <h1>Join MediCare</h1>
          <p>Create your staff account</p>
        </div>

        <form ref={formRef} className="signup-form">
          {/* Professional Info */}
          {/* <div>
            <label className="input-group-label">
              <Briefcase size={12} /> Work Details
            </label>
            <div className="grid-2">
              <select name="role" required className="select-field">
                <option value="">Role</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
              <select name="department" required className="select-field">
                <option value="">Dept</option>
                <option value="cardiology">Cardiology</option>
                <option value="er">Emergency</option>
              </select>
            </div>
          </div> */}

          {/* Personal Info */}
          <div>
            <label className="input-group-label">
              <User size={12} /> Personal Details
            </label>
            <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
              <input name="firstName" placeholder="First Name" type="text" required className="input-field" />
              <input name="lastName" placeholder="Last Name" type="text" required className="input-field" />
            </div>
            <div className="grid-3-split">
              <input name="age" placeholder="Age" type="number" className="input-field" />
              <select name="gender" className="select-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="relative-input">
            <Mail className="icon" size={16} />
            <input name="email" type="email" placeholder="Email Address" className="input-field" />
          </div>
          <div className="relative-input">
            <Phone className="icon" size={16} />
            <input name="phoneNumber" type="tel" placeholder="Phone Number" className="input-field" />
          </div>
          <div className="relative-input">
            <Lock className="icon" size={16} />
            <input name="address" type="address" placeholder="Address" className="input-field" />
          </div>
          {/* Security */}
          <div className="relative-input">
            <Lock className="icon" size={16} />
            <input name="password" type="password" placeholder="Password" className="input-field" />
          </div>
          <div className="relative-input">
            <Lock className="icon" size={16} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" className="input-field" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Processing...' : 'Register Account'}
            {!isLoading && <ChevronRight size={18} />}
          </button>

          <p className="footer-text">
            Already registered? <Link href="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}