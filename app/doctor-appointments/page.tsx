'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  Filter,
  Search,
  FileText,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { data } from 'framer-motion/client';
import DoctorsPage from '../doctors/page';

interface Appointment {
  id: string | number;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  appointmentType: string;
  notes: string;
  tokenNumber: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'rescheduled';
  patientName?: string;
  originalDate?: string;
  originalTime?: string;
  rescheduledAt?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType?: string;
  age?: number;
}

export default function DoctorAppointments() {
  const { doctor } = useDoctorAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

 useEffect(() => {
  if (doctor === undefined) return; // Wait for doctor to be defined
  if (!doctor) {
    router.push('/doctor-login');
  } else {
    loadData();
  }
}, [doctor]);


   

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(),
        loadPatients()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/appointments`);
      const appointmentsData = await response.json();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/patient-profile');
      const patientsData = await response.json();
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const getPatientDetails = (patientId: string) => {
    return patients.find(patient => patient.id === patientId);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const patient = getPatientDetails(appointment.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusCount = (status: string) => {
    return appointments.filter(apt => apt.status === status).length;
  };

  const handleStatusUpdate = async (appointmentId: string | number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadAppointments(); // Reload appointments
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleViewPatient = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPatientDetails(true);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return;
    
    try {
      const response = await fetch(`http://localhost:3001/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime,
          status: 'rescheduled',
          originalDate: selectedAppointment.date,
          originalTime: selectedAppointment.time,
          rescheduledAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        await loadAppointments();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        setRescheduleDate('');
        setRescheduleTime('');
      }
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
    setShowRescheduleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
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
                      <div className="flex items-center space-x-4">
              <Link 
                href="/doctor-dashboard"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">Manage your patient appointments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/doctor-calendar"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Calendar View
              </Link>
            </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 text-center">
            <div className="p-2 bg-blue-100 rounded-xl w-fit mx-auto mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('confirmed')}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 text-center">
            <div className="p-2 bg-green-100 rounded-xl w-fit mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('completed')}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 text-center">
            <div className="p-2 bg-yellow-100 rounded-xl w-fit mx-auto mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('pending')}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 text-center">
            <div className="p-2 bg-red-100 rounded-xl w-fit mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('cancelled')}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, appointment type, or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 appearance-none bg-white"
              >
                <option value="all">All Appointments</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredAppointments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You don\'t have any appointments scheduled yet'
                }
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => {
              const patient = getPatientDetails(appointment.patientId);
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{patient?.name || 'Unknown Patient'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                          </span>
                        </div>
                        <p className="text-green-600 font-medium mb-1">{appointment.appointmentType}</p>
                        <p className="text-gray-600 text-sm mb-3">Token: {appointment.tokenNumber}</p>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {new Date(appointment.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{patient?.phone || 'N/A'}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewPatient(appointment)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="View Patient Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                      
                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <>
                          <button
                            onClick={() => openRescheduleModal(appointment)}
                            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                            title="Reschedule Appointment"
                          >
                            <Edit className="h-4 w-4 text-purple-600" />
                          </button>
                          {appointment.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                title="Mark as Completed"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                title="Cancel Appointment"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Patient Details Modal */}
      {showPatientDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {(() => {
              const patient = getPatientDetails(selectedAppointment.patientId);
              return patient ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{patient.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{patient.phone}</span>
                    </div>
                    {patient.bloodType && (
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Blood Type: {patient.bloodType}</span>
                      </div>
                    )}
                    {patient.age && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Age: {patient.age} years</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-2">Appointment Details</h5>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedAppointment.time}</p>
                      <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                      <p><strong>Token:</strong> {selectedAppointment.tokenNumber}</p>
                      <p><strong>Status:</strong> {selectedAppointment.status}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/patient-medical-history/${selectedAppointment.patientId}`}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Medical History</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Patient details not found.</p>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Appointment</h3>
              <p className="text-gray-600">
                Reschedule appointment with <strong>{selectedAppointment.patientName}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRescheduleAppointment}
                disabled={!rescheduleDate || !rescheduleTime}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reschedule
              </button>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setRescheduleDate('');
                  setRescheduleTime('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}