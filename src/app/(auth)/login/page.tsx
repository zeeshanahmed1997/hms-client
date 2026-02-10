'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch } from '../../../redux/hooks';
import { login } from '../../../redux/slices/authSlice';
import type { LoginFormData } from '../../../types/auth/login';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = () => {
    if (!formRef.current) return;

    setError('');
    const formData = new FormData(formRef.current);
    const email = (formData.get('email') as string | null)?.trim() ?? '';
    const password = formData.get('password') as string | null ?? '';

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);

    dispatch(login({ email, password }))
      .unwrap()
      .then((payload) => {
        //  
        const token = payload.token ?? payload.access_token ?? payload.jwt;
        
        if (token) {
            //  
          Cookies.set('hms_auth_token', token, { 
            expires: 7, 
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
        }
        
        router.push('/admin');
        router.refresh();
      })
      .catch((err) => {
        setError(err.message || 'Invalid credentials. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              MediCare HMS
            </h1>
            <p className="mt-2 text-blue-100/90 text-base font-medium">
              Hospital Management System
            </p>
          </div>

          <div className="px-8 py-10">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
              Secure Login
            </h2>

            <form ref={formRef} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="doctor@hospital.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="••••••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 space-y-4 text-center text-sm">
              <div className="flex items-center justify-center gap-6">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Contact Admin/IT
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">New staff / patient registration?</p>
                <Link href="/signup" className="inline-flex items-center justify-center w-full py-3 px-4 border border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                  Create New Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MediCare Hospital • Authorized Access Only
        </p>
      </div>
    </div>
  );
}