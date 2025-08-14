'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { appointmentAPI, notificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  LogOut, 
  Plus, 
  Heart, 
  FileText, 
  Settings, 
  ArrowRight,
  Users,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  Pill,
  Star
} from 'lucide-react';
const BASE_URL="https://mock-apis-pgcn.onrender.com";
export default function PatientDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { patient, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }

    loadDashboardData();
  }, [patient]);

  useEffect(() => {
    const booking = searchParams.get('booking');
    const reschedule = searchParams.get('reschedule');
    
    if (booking === 'success') {
      setSuccessMessage('Appointment booked successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } else if (reschedule === 'success') {
      setSuccessMessage('Appointment rescheduled successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  const loadDashboardData = async () => {
    if (!patient) return;
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(patient.id),
        loadNotifications(patient.id),
        loadDoctors()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (patientId: string) => {
    try {
      const appointments = await appointmentAPI.getByPatientId(patientId);
      const upcoming = appointments.filter((apt: any) => apt.status === 'confirmed').slice(0, 5);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadNotifications = async (patientId: string) => {
    try {
      const notificationData = await notificationAPI.getByPatientId(patientId);
      setNotifications(notificationData.filter((n: any) => !n.read).slice(0, 5));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/doctors`);
      const doctorsData = await response.json();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                {patient?.profilePicture ? (
                  <img
                    src={patient.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {patient?.name || 'Patient'}
                </h1>
                <p className="text-gray-600">Manage your healthcare journey</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
            >
              <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingAppointments.filter((apt: any) => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Link
            href="/doctors"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-8 w-8" />
            <span className="font-semibold text-center">Book Appointment</span>
          </Link>

          <Link
            href="/appointment-history"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="h-8 w-8" />
            <span className="font-semibold text-center">Appointment History</span>
          </Link>

          <Link
            href="/patient-profile"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <User className="h-8 w-8" />
            <span className="font-semibold text-center">My Profile</span>
          </Link>

          <Link
            href="/notifications"
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-8 w-8" />
            <span className="font-semibold text-center">Notifications</span>
          </Link>

          <Link
            href="/patient-prescriptions"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Pill className="h-8 w-8" />
            <span className="font-semibold text-center">My Prescriptions</span>
          </Link>

          <Link
            href="/patient-reviews"
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Star className="h-8 w-8" />
            <span className="font-semibold text-center">My Reviews</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
              <Link href="/appointment-history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/book-appointment" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                  Book your first appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ClockIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.doctorName}</p>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      <span className="text-xs text-gray-500">Token: {appointment.tokenNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Available Doctors */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Doctors</h2>
              <Link href="/doctors" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doctors available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.slice(0, 3).map((doctor: any) => (
                  <div key={doctor.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        {doctor.avatar ? (
                          <img src={doctor.avatar} alt={doctor.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      </div>
                      <Link 
                        href={`/book-appointment?doctorId=${doctor.id}`}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
              <Link href="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <div key={notification.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
