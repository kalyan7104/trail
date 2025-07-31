
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkDoctorAuth, redirectToDoctorLogin } from '@/lib/authGuard';

export default function DoctorDashboard() {
  const [doctorData, setDoctorData] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!checkDoctorAuth()) {
      redirectToDoctorLogin();
      return;
    }
    
    const userData = localStorage.getItem('doctorData');
    const doctor = JSON.parse(userData!);
    setDoctorData(doctor);
    
    // Load today's appointments
    loadTodayAppointments();
  }, [router]);

  const loadTodayAppointments = () => {
    // Mock today's appointments
    const today = new Date().toISOString().split('T')[0];
    const mockAppointments = [
      {
        id: 'A001',
        patientName: 'John Smith',
        time: '10:00 AM',
        type: 'Consultation',
        status: 'confirmed'
      },
      {
        id: 'A002',
        patientName: 'Emily Johnson',
        time: '11:30 AM',
        type: 'Follow-up',
        status: 'waiting'
      },
      {
        id: 'A003',
        patientName: 'Michael Brown',
        time: '2:00 PM',
        type: 'Check-up',
        status: 'confirmed'
      }
    ];
    setTodayAppointments(mockAppointments);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorData');
    localStorage.removeItem('userType');
    router.push('/');
  };

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                {doctorData.profilePicture ? (
                  <img src={doctorData.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <i className="ri-stethoscope-line text-white text-lg"></i>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{doctorData.name}</h1>
                <p className="text-sm text-gray-500">{doctorData.specialty}</p>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-calendar-line text-blue-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-user-line text-green-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorData.totalPatients || 0}</p>
            <p className="text-sm text-gray-600">Patients</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-star-line text-yellow-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorData.rating || 4.5}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/doctor-appointments"
            className="bg-indigo-600 text-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-indigo-700 transition-colors !rounded-button"
          >
            <i className="ri-calendar-check-line text-2xl"></i>
            <span className="text-sm font-medium">My Schedule</span>
          </Link>
          <Link
            href="/doctor-profile"
            className="bg-blue-600 text-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-blue-700 transition-colors !rounded-button"
          >
            <i className="ri-user-line text-2xl"></i>
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
            <Link href="/doctor-appointments" className="text-indigo-600 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-calendar-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-indigo-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 px-0">
          <Link href="/doctor-dashboard" className="flex flex-col items-center justify-center py-3 text-indigo-600 bg-indigo-50">
            <i className="ri-home-line text-xl mb-1"></i>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/doctor-appointments" className="flex flex-col items-center justify-center py-3 text-gray-500 hover:text-gray-700">
            <i className="ri-calendar-line text-xl mb-1"></i>
            <span className="text-xs font-medium">Schedule</span>
          </Link>
          <Link href="/doctor-profile" className="flex flex-col items-center justify-center py-3 text-gray-500 hover:text-gray-700">
            <i className="ri-user-line text-xl mb-1"></i>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
