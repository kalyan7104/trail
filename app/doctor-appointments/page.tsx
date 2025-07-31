'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorData, setDoctorData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('doctorData');
    if (!userData) {
      router.push('/doctor-login');
      return;
    }
    
    setDoctorData(JSON.parse(userData));
    
    // Mock appointments data
    setAppointments([
      {
        id: 'A001',
        patientName: 'John Smith',
        patientId: 'P001',
        time: '9:00 AM',
        duration: '30 min',
        type: 'Consultation',
        status: 'confirmed',
        notes: 'Routine cardiac check-up',
        phone: '+1 (555) 123-4567',
        avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20middle-aged%20man%20with%20friendly%20smile%2C%20casual%20attire%2C%20clean%20background%2C%20portrait%20photography%20style&width=50&height=50&seq=patient1&orientation=squarish'
      },
      {
        id: 'A002',
        patientName: 'Emily Johnson',
        patientId: 'P002',
        time: '10:30 AM',
        duration: '15 min',
        type: 'Follow-up',
        status: 'waiting',
        notes: 'Blood pressure monitoring',
        phone: '+1 (555) 234-5678',
        avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20young%20woman%20with%20brown%20hair%2C%20warm%20smile%2C%20business%20casual%2C%20studio%20lighting%2C%20clean%20background&width=50&height=50&seq=patient2&orientation=squarish'
      },
      {
        id: 'A003',
        patientName: 'Michael Brown',
        patientId: 'P003',
        time: '2:00 PM',
        duration: '45 min',
        type: 'Consultation',
        status: 'confirmed',
        notes: 'Chest pain evaluation',
        phone: '+1 (555) 345-6789',
        avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20man%20with%20beard%2C%20confident%20expression%2C%20casual%20shirt%2C%20studio%20lighting%2C%20clean%20background&width=50&height=50&seq=patient3&orientation=squarish'
      },
      {
        id: 'A004',
        patientName: 'Sarah Davis',
        patientId: 'P004',
        time: '3:30 PM',
        duration: '30 min',
        type: 'Check-up',
        status: 'completed',
        notes: 'Annual physical examination',
        phone: '+1 (555) 456-7890',
        avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20middle-aged%20woman%20with%20short%20hair%2C%20professional%20attire%2C%20warm%20expression%2C%20clean%20background&width=50&height=50&seq=patient4&orientation=squarish'
      }
    ]);
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const getNext7Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    
    return dates;
  };

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/doctor-dashboard" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">My Schedule</h1>
              <p className="text-sm text-gray-500">Manage your appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {getNext7Days().map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`px-4 py-3 rounded-lg border text-center whitespace-nowrap transition-colors !rounded-button ${
                  selectedDate === date.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                } ${date.isToday ? 'ring-2 ring-indigo-200' : ''}`}
              >
                <div className="text-sm font-medium">{date.label}</div>
                {date.isToday && <div className="text-xs text-indigo-600">Today</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-check-line text-green-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'confirmed').length}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-time-line text-yellow-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'waiting').length}</p>
            <p className="text-sm text-gray-600">Waiting</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-user-check-line text-blue-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointments - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={appointment.avatar} 
                    alt={appointment.patientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                        <p className="text-sm text-gray-600">ID: {appointment.patientId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <i className="ri-time-line text-gray-400"></i>
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="ri-hourglass-line text-gray-400"></i>
                        <span>{appointment.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="ri-file-text-line text-gray-400"></i>
                        <span>{appointment.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="ri-phone-line text-gray-400"></i>
                        <span>{appointment.phone}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'waiting')}
                            className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors !rounded-button"
                          >
                            Mark Waiting
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors !rounded-button"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'waiting' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors !rounded-button"
                        >
                          Complete Appointment
                        </button>
                      )}
                      
                      {appointment.status === 'completed' && (
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors !rounded-button">
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}