'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { patientLoginSchema } from '@/lib/validationSchemas';
import { useAuth } from '@/contexts/AuthContext';
import { patientAPI } from '@/lib/api'; // ✅ Use centralized API

interface PatientLoginForm {
  email: string;
  password: string;
}

export default function PatientLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientLoginForm>({
    resolver: yupResolver(patientLoginSchema),
  });

  const onSubmit = async (data: PatientLoginForm) => {
    setIsLoading(true);
    setApiError('');

    try {
      const profile = await patientAPI.login(data.email, data.password); // ✅ use api.ts
      login(profile); // ✅ store in AuthContext
      router.push('/patient-dashboard');
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Login</h1>
            <p className="text-gray-600">Access your medical appointments</p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/patient-forgot-password" className="text-blue-600 text-sm font-medium">
              Forgot password?
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?
              <Link href="/patient-register" className="text-blue-600 font-medium ml-1">Sign up</Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Demo Account:</p>
            <p className="text-xs text-gray-600">Email: Lokesh@gmail.com</p>
            <p className="text-xs text-gray-600">Password: 123456</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Link 
          href="/" 
          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
