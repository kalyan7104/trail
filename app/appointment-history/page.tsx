'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

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
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
}
const BASE_URL="https://mock-apis-pgcn.onrender.com";
export default function AppointmentHistory() {
  const { patient } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }

    loadAppointments();
  }, [patient]);

  const loadAppointments = async () => {
  if (!patient || !patient.id) return; // Guard clause
  try {
    setLoading(true);
    const response = await fetch(`${BASE_URL}/appointments?patientId=${patient.id}`);
    const appointmentsData = await response.json();
    setAppointments(appointmentsData);
  } catch (error) {
    console.error('Failed to load appointments:', error);
  } finally {
    setLoading(false);
  }
};

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentType.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleReschedule = (appointment: Appointment) => {
    router.push(`/book-appointment?doctorId=${appointment.doctorId}&reschedule=${appointment.id}`);
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment history...</p>
        </div>
      </div>
    );
  }

  // ...existing code...

const confirmCancel = async () => {
  if (!selectedAppointment || !patient || !patient.id) return; // Guard clause

  try {
    // Cancel the appointment
    const response = await fetch(`${BASE_URL}/appointments/${selectedAppointment.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (response.ok) {
      // Optionally, send a notification (if your API supports it)
      // const notificationData = {
      //   patientId: patient.id,
      //   title: 'Appointment Cancelled',
      //   message: `Your appointment with ${selectedAppointment.doctorName} on ${selectedAppointment.date} at ${selectedAppointment.time} has been cancelled.`,
      //   type: 'appointment_cancelled',
      //   read: false,
      //   createdAt: new Date().toISOString()
      // };
      // await fetch(`${BASE_URL}/notifications`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationData),
      // });

      // Refresh appointments and close modal
      loadAppointments();
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  } catch (error) {
    console.error('Failed to cancel appointment:', error);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
      >
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/patient-dashboard"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
              <p className="text-gray-600">View all your past and upcoming appointments</p>
            </div>
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
                placeholder="Search by doctor name, specialty, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white"
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
                  : 'You haven\'t booked any appointments yet'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <Link
                  href="/book-appointment"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Book Your First Appointment</span>
                </Link>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{appointment.doctorName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                        </span>
                      </div>
                      <p className="text-blue-600 font-medium mb-1">{appointment.specialty}</p>
                      <p className="text-gray-600 text-sm mb-3">{appointment.appointmentType}</p>
                      
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
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Token: {appointment.tokenNumber}</span>
                        </div>
                      </div>

                                             {appointment.notes && (
                         <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                           <p className="text-sm text-gray-700">
                             <strong>Notes:</strong> {appointment.notes}
                           </p>
                         </div>
                       )}

                       {/* Action Buttons for Confirmed Appointments */}
                       {appointment.status === 'confirmed' && (
                         <div className="mt-4 flex space-x-3">
                           <button
                             onClick={() => handleReschedule(appointment)}
                             className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                           >
                             <Edit className="h-4 w-4" />
                             <span>Reschedule</span>
                           </button>
                           <button
                             onClick={() => handleCancel(appointment)}
                             className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                           >
                             <Trash2 className="h-4 w-4" />
                             <span>Cancel</span>
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </motion.div>
             ))
           )}
        </motion.div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your appointment with{' '}
                <strong>{selectedAppointment.doctorName}</strong> on{' '}
                {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
