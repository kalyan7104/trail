
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { doctorRegistrationSchema } from '@/lib/validationSchemas';
import { doctorAPI } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid'; // Ensure this is imported at the top

const BASE_URL = "https://mock-apis-pgcn.onrender.com";
interface DoctorRegistrationForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  specialty: string;
  hospital: string;
  experience: string;
  license: string;
  education: string;
  about: string;
}

export default function DoctorRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorRegistrationForm>({
    resolver: yupResolver(doctorRegistrationSchema),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 


const onSubmit = async (data: DoctorRegistrationForm) => {
  setIsLoading(true);
  setApiError('');

  try {
    const { confirmPassword, ...doctorData } = data;
    const newId = uuidv4(); // shared ID

    // Step 1: POST to doctor-profile
    await fetch(`${BASE_URL}/doctor-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...doctorData,
        id: newId,
        profilePicture: profilePicture || ''
      })
    });

    // Step 2: POST to doctor-login
    await fetch(`${BASE_URL}/doctor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newId,
        email: doctorData.email,
      })
    });

    setShowSuccess(true);
    setTimeout(() => router.push('/doctor-login'), 2000);
  } catch (error: any) {
    setApiError(error.message || 'Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-6">Your doctor account has been successfully created. Redirecting to login...</p>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-stethoscope-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Doctor Account</h1>
          <p className="text-gray-600">Join our medical platform</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-stethoscope-line text-gray-400 text-3xl"></i>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <i className="ri-camera-line text-white text-sm"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">Add profile picture</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Dr. John Smith"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="john.smith@hospital.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Min 6 characters"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              {...register('specialty')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">Select Specialty</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="General Practitioner">General Practitioner</option>
            </select>
            {errors.specialty && <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic</label>
            <input
              {...register('hospital')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="City General Hospital"
            />
            {errors.hospital && <p className="mt-1 text-sm text-red-600">{errors.hospital.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <input
              {...register('experience')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="5 years"
            />
            {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input
              {...register('license')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="MD-2024-001"
            />
            {errors.license && <p className="mt-1 text-sm text-red-600">{errors.license.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
            <input
              {...register('education')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="MD from Harvard Medical School"
            />
            {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
            <textarea
              {...register('about')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-24 resize-none"
              placeholder="Tell us about your medical background and expertise..."
              maxLength={500}
            />
            {errors.about && <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 !rounded-button shadow-lg disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?
            <Link href="/doctor-login" className="text-blue-600 font-medium ml-1">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="p-4 text-center">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
