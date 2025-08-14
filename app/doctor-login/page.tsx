'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { doctorLoginSchema } from '@/lib/validationSchemas';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, ArrowLeft, Stethoscope, Shield, Clock, Users } from 'lucide-react';

interface DoctorLoginForm {
  email: string;
  password: string;
}
const BASE_URL="https://mock-apis-pgcn.onrender.com";
export default function DoctorLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useDoctorAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorLoginForm>({
    resolver: yupResolver(doctorLoginSchema),
  });

  const onSubmit = async (data: DoctorLoginForm) => {
    setIsLoading(true);
    setApiError('');

    try {
      console.log('Attempting doctor login with:', data.email);
      
      // Step 1: Validate login credentials against doctor-login
      const loginRes = await fetch(
        `${BASE_URL}/doctor-login?email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`
      );
      
      if (!loginRes.ok) {
        throw new Error('Network error occurred');
      }
      
      const loginData = await loginRes.json();
      console.log('Login response:', loginData);

      if (loginData.length === 0) {
        setApiError('Invalid email or password');
        return;
      }

      // Step 2: Fetch full profile using doctor-profile with case-insensitive matching
      const profileRes = await fetch(
        `${BASE_URL}/doctor-profile`
      );
      
      if (!profileRes.ok) {
        throw new Error('Failed to fetch doctor profile');
      }
      
      const allProfiles = await profileRes.json();
      console.log('All profiles:', allProfiles);
      
      // Find profile with case-insensitive email matching
      const profileData = allProfiles.filter((profile: any) => 
        profile.email.toLowerCase() === data.email.toLowerCase()
      );
      
      console.log('Matched profile:', profileData);

      if (profileData.length === 0) {
        setApiError('Doctor profile not found. Please contact support.');
        return;
      }

      // Step 3: Set doctor in context with full profile data
      const doctorData = {
        ...loginData[0],
        ...profileData[0]
      };
      
      console.log('Setting doctor in context:', doctorData);
      login(doctorData);
      
      // Step 4: Navigate to doctor dashboard
      console.log('Navigating to doctor dashboard...');
      router.push('/doctor-dashboard');

    } catch (error: any) {
      console.error('Login error:', error);
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 left-6 z-50"
      >
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </motion.div>

      <div className="relative flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Doctor Login
                  </h1>
                  <p className="text-gray-600">Welcome back! Access your medical practice</p>
                </motion.div>

                {/* Error Message */}
                {apiError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-600 text-sm font-medium">{apiError}</p>
                  </motion.div>
                )}

                {/* Login Form */}
                <motion.form 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                    <div className="relative">
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm pr-12"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <LogIn className="h-5 w-5" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </motion.button>
                </motion.form>

                {/* Links */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-6 text-center"
                >
                  <Link 
                    href="/doctor-forgot-password" 
                    className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8 pt-6 border-t border-gray-100 text-center"
                >
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/doctor-register" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                      Sign up
                    </Link>
                  </p>
                </motion.div>

                {/* Demo Account */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                >
                  <p className="text-xs font-semibold text-green-800 mb-2">Demo Account:</p>
                  <p className="text-xs text-green-700">Email: sarah.johnson@hospital.com</p>
                  <p className="text-xs text-green-700">Password: 123456</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Manage Your Practice
                  <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    With Confidence
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Access patient records, manage appointments, and provide exceptional healthcare services through our comprehensive medical platform.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Users,
                    title: "Patient Management",
                    description: "Efficiently manage patient appointments and medical records"
                  },
                  {
                    icon: Shield,
                    title: "Secure Platform",
                    description: "HIPAA-compliant system ensuring patient data privacy"
                  },
                  {
                    icon: Clock,
                    title: "24/7 Access",
                    description: "Access your practice management tools anytime, anywhere"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                      <feature.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
