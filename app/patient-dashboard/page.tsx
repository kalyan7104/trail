'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentAPI, notificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { patient, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!patient) return;

    loadAppointments(patient.id);
    loadNotifications(patient.id);
  }, [patient]);

  const loadAppointments = async (patientId: string) => {
    try {
      const appointments = await appointmentAPI.getByPatientId(patientId);
      const upcoming = appointments.filter((apt: any) => apt.status === 'confirmed').slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadNotifications = async (patientId: string) => {
    try {
      const notificationData = await notificationAPI.getByPatientId(patientId);
      setNotifications(notificationData.filter((n: any) => !n.read));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  {patient?.profilePicture ? (
                    <img
                      src={patient.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <i className="ri-user-line text-white text-lg"></i>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Welcome, {patient?.name || 'Patient'}
                  </h1>
                  <p className="text-sm text-gray-500">Patient Dashboard</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <i className="ri-logout-box-line text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/book-appointment"
              className="bg-blue-600 text-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-blue-700 transition-colors !rounded-button"
            >
              <i className="ri-calendar-check-line text-2xl"></i>
              <span className="text-sm font-medium">Book Appointment</span>
            </Link>
            <Link
              href="/doctors"
              className="bg-indigo-600 text-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-indigo-700 transition-colors !rounded-button"
            >
              <i className="ri-stethoscope-line text-2xl"></i>
              <span className="text-sm font-medium">Find Doctors</span>
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/appointment-history" className="text-blue-600 text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-calendar-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Link
                    href="/book-appointment"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors !rounded-button"
                  >
                    Book Your First Appointment
                  </Link>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-blue-600"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-blue-600">{appointment.date}</span>
                          <span className="text-sm text-gray-500">{appointment.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Token: {appointment.tokenNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-calendar-line text-blue-600"></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-heart-line text-green-600"></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-600">Health Score</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-medicine-bottle-line text-purple-600"></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="grid grid-cols-4 px-0">
            <Link href="/patient-dashboard" className="flex flex-col items-center justify-center py-3 text-blue-600 bg-blue-50">
              <i className="ri-home-line text-xl mb-1"></i>
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="/appointment-history" className="flex flex-col items-center justify-center py-3 text-gray-500 hover:text-gray-700">
              <i className="ri-time-line text-xl mb-1"></i>
              <span className="text-xs font-medium">History</span>
            </Link>
            <Link href="/patient-profile" className="flex flex-col items-center justify-center py-3 text-gray-500 hover:text-gray-700">
              <i className="ri-user-line text-xl mb-1"></i>
              <span className="text-xs font-medium">Profile</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center justify-center py-3 text-gray-500 hover:text-gray-700 relative">
              <i className="ri-notification-line text-xl mb-1"></i>
              <span className="text-xs font-medium">Alerts</span>
              {notifications.length > 0 && (
                <div className="absolute top-1 right-1/2 transform translate-x-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
