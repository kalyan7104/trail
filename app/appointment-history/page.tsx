'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentAPI } from '@/lib/api';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedPatient = localStorage.getItem('patient');
    if (!storedPatient) {
      router.push('/patient-login');
      return;
    }

    const patient = JSON.parse(storedPatient);
    setPatientData(patient);
    loadAppointments(patient.id);
  }, []);

  const loadAppointments = async (patientId: string) => {
    try {
      setLoading(true);
      const appointmentData = await appointmentAPI.getByPatientId(patientId);
      setAppointments(appointmentData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'upcoming') return appointment.status === 'confirmed';
    if (activeTab === 'completed') return appointment.status === 'completed';
    if (activeTab === 'cancelled') return appointment.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReschedule = (appointmentId: string) => {
    router.push(`/book-appointment?reschedule=${appointmentId}`);
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentAPI.cancelAppointment(appointmentId);
      if (patientData) {
        loadAppointments(patientData.id);
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleBookAgain = (appointment: any) => {
    router.push(`/book-appointment?doctorId=${appointment.doctorId}`);
  };

  const handleViewReport = (appointmentId: string) => {
    router.push(`/medical-report/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/patient-dashboard" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Appointment History</h1>
              <p className="text-sm text-gray-500">View and manage your appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <div className="flex space-x-8">
            {['upcoming', 'completed', 'cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-calendar-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'cancelled' ? 'No cancelled appointments' : 'No appointments found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'cancelled'
                ? 'You haven\'t cancelled any appointments yet.'
                : `You don't have any ${activeTab} appointments.`}
            </p>
            <Link 
              href="/book-appointment"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors !rounded-button"
            >
              Book New Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-blue-600 text-xl"></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-blue-600 font-medium">{appointment.specialty}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {appointment.tokenNumber && (
                          <p className="text-xs text-gray-500 mt-1">Token: {appointment.tokenNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <i className="ri-calendar-line text-gray-400"></i>
                        <span>{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="ri-time-line text-gray-400"></i>
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="ri-file-text-line text-gray-400"></i>
                        <span>{appointment.appointmentType}</span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                        {appointment.notes}
                      </p>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReschedule(appointment.id)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors !rounded-button"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors !rounded-button"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewReport(appointment.id)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors !rounded-button"
                        >
                          View Report
                        </button>
                        <button
                          onClick={() => handleBookAgain(appointment)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors !rounded-button"
                        >
                          Book Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
