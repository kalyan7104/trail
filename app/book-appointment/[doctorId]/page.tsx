'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText,
  CheckCircle,
  User,
  Stethoscope,
  Building,
  Phone,
  Mail,
  Award,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  experience: string;
  license: string;
  education: string;
  about: string;
  profilePicture?: string;
}

export default function BookAppointmentPage() {
  const { patient } = useAuth();
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId as string;

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }

    if (doctorId) {
      loadDoctorDetails();
    }
  }, [patient, doctorId]);

  const loadDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/doctor-profile/${doctorId}`);
      if (response.ok) {
        const doctorProfile = await response.json();
        setSelectedDoctor(doctorProfile);
      } else {
        // Fallback to hardcoded data if API fails
        const fallbackDoctor: DoctorProfile = {
          id: doctorId,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          phone: '+1 (555) 123-4567',
          specialty: 'Cardiology',
          hospital: 'City General Hospital',
          experience: '12 years',
          license: 'MD-12345',
          education: 'Harvard Medical School',
          about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and has helped thousands of patients maintain heart health.',
          profilePicture: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20female%20cardiologist%20doctor%20with%20stethoscope%2C%20medical%20coat%2C%20confident%20smile%2C%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc1&orientation=squarish'
        };
        setSelectedDoctor(fallbackDoctor);
      }
    } catch (error) {
      console.error('Failed to load doctor details:', error);
      // Use fallback data
      const fallbackDoctor: DoctorProfile = {
        id: doctorId,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+1 (555) 123-4567',
        specialty: 'Cardiology',
        hospital: 'City General Hospital',
        experience: '12 years',
        license: 'MD-12345',
        education: 'Harvard Medical School',
        about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and has helped thousands of patients maintain heart health.',
        profilePicture: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20female%20cardiologist%20doctor%20with%20stethoscope%2C%20medical%20coat%2C%20confident%20smile%2C%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc1&orientation=squarish'
      };
      setSelectedDoctor(fallbackDoctor);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !patient) return;

    setBookingLoading(true);
    try {
      // Create new appointment
      const appointmentData = {
        patientId: patient.id,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedTime,
        appointmentType: 'Consultation',
        notes: notes,
        tokenNumber: `T${Date.now()}`,
        status: 'confirmed'
      };

      const response = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        // Create notification for patient
        const patientNotificationData = {
          id: `notif-${Date.now()}`,
          patientId: patient.id,
          title: 'Appointment Confirmed',
          message: `Your appointment with ${selectedDoctor.name} on ${selectedDate} at ${selectedTime} has been confirmed.`,
          type: 'appointment_confirmed',
          read: false,
          createdAt: new Date().toISOString()
        };

        await fetch('http://localhost:3001/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientNotificationData),
        });

        // Create notification for doctor
        const doctorNotificationData = {
          id: `notif-doc-${Date.now()}`,
          doctorId: selectedDoctor.id,
          title: 'New Appointment Booked',
          message: `New appointment booked by ${patient.name} on ${selectedDate} at ${selectedTime}.`,
          type: 'new_appointment',
          read: false,
          createdAt: new Date().toISOString()
        };

        await fetch('http://localhost:3001/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doctorNotificationData),
        });

        setShowSuccess(true);
        setTimeout(() => {
          router.push('/patient-dashboard?booking=success');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor not found</h3>
          <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist.</p>
          <Link 
            href="/doctors"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h3>
              <p className="text-gray-600 mb-4">Your appointment has been confirmed. Redirecting to dashboard...</p>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
      >
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/doctors"
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-gray-600">Schedule your appointment with {selectedDoctor.name}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Details */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                  {selectedDoctor.profilePicture ? (
                    <img src={selectedDoctor.profilePicture} alt={selectedDoctor.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Stethoscope className="h-12 w-12 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDoctor.name}</h2>
                <p className="text-lg text-green-600 font-semibold mb-4">{selectedDoctor.specialty}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{selectedDoctor.hospital}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{selectedDoctor.experience} experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{selectedDoctor.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{selectedDoctor.email}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span>Education</span>
                </h3>
                <p className="text-gray-700 text-sm">{selectedDoctor.education}</p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 text-sm">{selectedDoctor.about}</p>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Appointment</h2>

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Select Date</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        selectedDate === date
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Select Time</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes/Reason for Appointment */}
              {selectedDate && selectedTime && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Reason for Appointment</span>
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                    rows={4}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
                  />
                </div>
              )}

              {/* Appointment Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="font-medium">{selectedDoctor.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    {notes && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reason:</span>
                          <span className="font-medium text-sm">{notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <div className="flex space-x-4">
                <Link
                  href="/doctors"
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-center"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || bookingLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 