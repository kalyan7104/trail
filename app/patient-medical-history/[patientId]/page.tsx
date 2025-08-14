'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { medicalHistoryAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Pill,
  Stethoscope,
  CalendarDays,
  Download,
  Filter,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Heart,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
const BASE_URL="https://mock-apis-pgcn.onrender.com";
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string;
  medications: string;
  profilePicture?: string;
}

interface Appointment {
  id: string;
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
  originalDate?: string;
  originalTime?: string;
  rescheduledAt?: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: Medicine[];
  notes: string;
  prescribedDate: string;
  nextFollowUp: string;
  status: string;
}

interface MedicalHistory {
  patient: Patient;
  appointments: Appointment[];
  prescriptions: Prescription[];
}

export default function PatientMedicalHistory() {
  const { patientId } = useParams();
  const router = useRouter();
  const { doctor } = useDoctorAuth();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'prescriptions'>('overview');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!doctor) {
      router.push('/doctor-login');
      return;
    }

    loadMedicalHistory();
  }, [patientId, doctor]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalHistoryAPI.getPatientMedicalHistory(patientId as string);
      setMedicalHistory(data);
    } catch (err) {
      setError('Failed to load medical history');
      console.error('Error loading medical history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'rescheduled':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filterData = () => {
    if (!medicalHistory) return { appointments: [], prescriptions: [] };

    let filteredAppointments = medicalHistory.appointments;
    let filteredPrescriptions = medicalHistory.prescriptions;

    // Date filter
    if (dateFilter.start || dateFilter.end) {
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
        const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
        
        if (startDate && aptDate < startDate) return false;
        if (endDate && aptDate > endDate) return false;
        return true;
      });

      filteredPrescriptions = filteredPrescriptions.filter(presc => {
        const prescDate = new Date(presc.prescribedDate);
        const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
        const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
        
        if (startDate && prescDate < startDate) return false;
        if (endDate && prescDate > endDate) return false;
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredAppointments = filteredAppointments.filter(apt =>
        apt.doctorName.toLowerCase().includes(term) ||
        apt.specialty.toLowerCase().includes(term) ||
        apt.notes.toLowerCase().includes(term) ||
        apt.appointmentType.toLowerCase().includes(term)
      );

      filteredPrescriptions = filteredPrescriptions.filter(presc =>
        presc.doctorName.toLowerCase().includes(term) ||
        presc.notes.toLowerCase().includes(term) ||
        presc.medicines.some(med => med.name.toLowerCase().includes(term))
      );
    }

    return { appointments: filteredAppointments, prescriptions: filteredPrescriptions };
  };

  const downloadPDF = () => {
    alert('PDF download feature would be implemented here');
  };

  const printHistory = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical history...</p>
        </div>
      </div>
    );
  }

  if (error || !medicalHistory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Medical History</h2>
          <p className="text-gray-600 mb-4">{error || 'Patient not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { appointments, prescriptions } = filterData();
  const totalAppointments = appointments.length;
  const totalPrescriptions = prescriptions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Patient Medical History</h1>
                <p className="text-sm text-gray-500">Comprehensive health records</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={printHistory}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{medicalHistory.patient.name}</h2>
                <p className="text-gray-500">Patient ID: {medicalHistory.patient.id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{medicalHistory.patient.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{medicalHistory.patient.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {new Date(medicalHistory.patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{medicalHistory.patient.address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium text-gray-900">{medicalHistory.patient.bloodType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                <p className="font-medium text-gray-900">
                  {medicalHistory.patient.allergies || 'None reported'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-500">Current Medications</p>
                <p className="font-medium text-gray-900">
                  {medicalHistory.patient.medications || 'None'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-3xl font-bold text-blue-600">{totalAppointments}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Prescriptions</p>
                <p className="text-3xl font-bold text-green-600">{totalPrescriptions}</p>
              </div>
              <Pill className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Appointments</p>
                <p className="text-3xl font-bold text-purple-600">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments, prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDateFilter({ start: '', end: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border mb-8"
        >
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Appointments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Prescriptions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
                  <div className="space-y-3">
                    {prescriptions.slice(0, 5).map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Pill className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{prescription.doctorName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(prescription.prescribedDate).toLocaleDateString()} - {prescription.medicines.length} medicines
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          {prescription.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments found</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.specialty} • {appointment.appointmentType}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Token Number</p>
                          <p className="font-medium text-gray-900">{appointment.tokenNumber}</p>
                        </div>
                        {appointment.notes && (
                          <div className="md:col-span-2">
                            <p className="text-gray-500">Notes</p>
                            <p className="text-gray-900">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No prescriptions found</p>
                  </div>
                ) : (
                  prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Pill className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{prescription.doctorName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(prescription.prescribedDate).toLocaleDateString()} • {prescription.medicines.length} medicines
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          {prescription.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Prescribed Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Next Follow-up</p>
                          <p className="font-medium text-gray-900">
                            {new Date(prescription.nextFollowUp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-2">Medicines</p>
                        <div className="space-y-2">
                          {prescription.medicines.map((medicine) => (
                            <div key={medicine.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-gray-900">{medicine.name}</p>
                                <span className="text-sm text-gray-500">{medicine.dosage}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p><strong>Frequency:</strong> {medicine.frequency}</p>
                                <p><strong>Duration:</strong> {medicine.duration}</p>
                              </div>
                              {medicine.instructions && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Instructions:</strong> {medicine.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {prescription.notes && (
                        <div className="mt-4">
                          <p className="text-gray-500">Notes</p>
                          <p className="text-gray-900">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
