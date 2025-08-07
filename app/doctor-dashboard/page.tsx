
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentAPI } from '@/lib/api';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion } from 'framer-motion';
import PrescriptionStats from '@/components/PrescriptionStats';
import { 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  LogOut, 
  Plus, 
  Stethoscope, 
  FileText, 
  Settings, 
  ArrowRight,
  Users,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  TrendingUp,
  Activity
} from 'lucide-react';

const BASE_URL="https://mock-apis-pgcn.onrender.com"

export default function DoctorDashboard() {
  const { doctor, logout } = useDoctorAuth();
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!doctor) {
      router.push('/doctor-login');
      return;
    }

    loadDashboardData();
  }, [doctor]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(),
        loadPatients(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      if (!doctor) return;
      
      // Fetch all appointments
      const response = await fetch(`${BASE_URL}/appointments`);
      const allAppointments = await response.json();
      
      // Filter appointments for this doctor
      const doctorAppointments = allAppointments.filter((apt: any) => apt.doctorId === doctor.id);
      
      // Fetch patient profiles to get patient names
      const patientsResponse = await fetch(`${BASE_URL}/patient-profile`);
      const patientsData = await patientsResponse.json();
      
      // Add patient information to appointments
      const appointmentsWithPatientInfo = doctorAppointments.map((apt: any) => {
        const patient = patientsData.find((p: any) => p.id === apt.patientId);
        return {
          ...apt,
          patientName: patient ? patient.name : 'Unknown Patient',
          patientPhone: patient ? patient.phone : 'N/A',
          patientEmail: patient ? patient.email : 'N/A'
        };
      });
      
      // Filter today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayApts = appointmentsWithPatientInfo.filter((apt: any) => apt.date === today);
      setTodayAppointments(todayApts);

      // Filter upcoming appointments (next 7 days)
      const upcoming = appointmentsWithPatientInfo.filter((apt: any) => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return aptDate > today && aptDate <= nextWeek && apt.status === 'confirmed';
      }).slice(0, 5);
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch(`${BASE_URL}/patient-profile`);
      const patientsData = await response.json();
      setPatients(patientsData.slice(0, 5)); // Show first 5 patients
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!doctor) return;
      const response = await fetch(`${BASE_URL}/notifications`);
      const allNotifications = await response.json();
      
      // Filter notifications for this doctor
      const doctorNotifications = allNotifications.filter((notif: any) => 
        notif.doctorId === doctor.id && !notif.read
      );
      
      setNotifications(doctorNotifications.slice(0, 5)); // Show first 5 notifications
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                {doctor?.profilePicture ? (
                  <img
                    src={doctor.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <Stethoscope className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dr. {doctor?.name || 'Doctor'}
                </h1>
                <p className="text-gray-600">{doctor?.specialty} • {doctor?.hospital}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/notifications"
                className="relative p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <Bell className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
              >
                <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-8">
        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
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
                  {todayAppointments.filter((apt: any) => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAppointments.filter((apt: any) => apt.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Link
            href="/doctor-appointments"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Calendar className="h-8 w-8" />
            <span className="font-semibold text-center">View Appointments</span>
          </Link>

          <Link
            href="/doctor-calendar"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Calendar className="h-8 w-8" />
            <span className="font-semibold text-center">Calendar View</span>
          </Link>

          <Link
            href="/doctor-profile"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <User className="h-8 w-8" />
            <span className="font-semibold text-center">My Profile</span>
          </Link>

          <Link
            href="/doctor-help-support"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="h-8 w-8" />
            <span className="font-semibold text-center">Support</span>
          </Link>

          <Link
            href="/notifications"
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-8 w-8" />
            <span className="font-semibold text-center">Notifications</span>
          </Link>

          <Link
            href="/doctor-prescriptions"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="h-8 w-8" />
            <span className="font-semibold text-center">Prescriptions</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
              <Link href="/doctor-appointments" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments today</p>
                <p className="text-sm text-gray-400 mt-2">Enjoy your day!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-xs text-gray-600">Token: {appointment.tokenNumber}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      {appointment.notes && (
                        <span className="text-xs text-gray-500 truncate max-w-32">
                          {appointment.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Patients */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
              <Link href="/patients" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {patients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No patients yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patients.map((patient: any) => (
                  <div key={patient.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        {patient.profilePicture ? (
                          <img src={patient.profilePicture} alt={patient.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        <p className="text-xs text-gray-500">{patient.bloodType} • {patient.age || 'N/A'} years</p>
                      </div>
                      <Link 
                        href={`/patient-details/${patient.id}`}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayAppointments.map((appointment: any) => (
                <div key={appointment.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ClockIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                      <p className="text-xs text-gray-500">{appointment.patientPhone}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Token:</span>
                      <span className="font-medium">{appointment.tokenNumber}</span>
                    </div>
                    {appointment.notes && (
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Notes:</span>
                          <span className="font-medium text-xs">{appointment.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments (Next 7 Days)</h2>
              <Link href="/doctor-appointments" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment: any) => (
                <div key={appointment.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                      <p className="text-xs text-gray-500">{appointment.patientPhone}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Token:</span>
                      <span className="font-medium">{appointment.tokenNumber}</span>
                    </div>
                    {appointment.notes && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Notes:</span>
                          <span className="font-medium text-xs">{appointment.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Prescription Statistics */}
        <PrescriptionStats doctorId={doctor?.id || ''} />
      </div>
    </div>
  );
}
