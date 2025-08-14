'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Users,
  Heart,
  Stethoscope,
  MapPin,
  Clock,
  Plus
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  address?: string;
  profilePicture?: string;
  emergencyContact?: string;
  medicalHistory?: any[];
  prescriptions?: any[];
  totalAppointments?: number;
  completedAppointments?: number;
  upcomingAppointments?: number;
  lastVisit?: string | null;
}

export default function DoctorPatientList() {
  const { doctor } = useDoctorAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    if (doctor === undefined) return;
    if (!doctor) {
      router.push('/doctor-login');
    } else {
      loadPatients();
    }
  }, [doctor]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Fetch all patients
      const response = await fetch('http://localhost:3001/patient-profile');
      const patientsData = await response.json();
      
      // Fetch appointments to get patient statistics
      const appointmentsResponse = await fetch('http://localhost:3001/appointments');
      const allAppointments = await appointmentsResponse.json();
      
      // Filter appointments for this doctor
      const doctorAppointments = allAppointments.filter((apt: any) => apt.doctorId === doctor?.id);
      
      // Add appointment statistics to patients
      const patientsWithStats = patientsData.map((patient: Patient) => {
        const patientAppointments = doctorAppointments.filter((apt: any) => apt.patientId === patient.id);
        const completedAppointments = patientAppointments.filter((apt: any) => apt.status === 'completed');
        const upcomingAppointments = patientAppointments.filter((apt: any) => 
          apt.status === 'confirmed' && new Date(apt.date) > new Date()
        );
        
        return {
          ...patient,
          totalAppointments: patientAppointments.length,
          completedAppointments: completedAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          lastVisit: completedAppointments.length > 0 
            ? completedAppointments[completedAppointments.length - 1].date 
            : null
        };
      });
      
      setPatients(patientsWithStats);
      setFilteredPatients(patientsWithStats);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = patients;

    if (filter !== 'all') {
      switch (filter) {
        case 'recent':
          filtered = filtered.filter(patient => patient.lastVisit);
          break;
        case 'upcoming':
          filtered = filtered.filter(patient => (patient.upcomingAppointments || 0) > 0);
          break;
        case 'frequent':
          filtered = filtered.filter(patient => (patient.totalAppointments || 0) > 2);
          break;
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, filter]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
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
              <Link 
                href="/doctor-dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient List</h1>
                <p className="text-gray-600">Manage and view your patients</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPatients}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              >
                <option value="all">All Patients</option>
                <option value="recent">Recent Patients</option>
                <option value="upcoming">Upcoming Appointments</option>
                <option value="frequent">Frequent Patients</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Patient Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handlePatientClick(patient)}
            >
              {/* Patient Avatar */}
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {patient.profilePicture ? (
                    <img
                      src={patient.profilePicture}
                      alt={patient.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">{patient.email}</p>
              </div>

              {/* Patient Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{patient.phone}</span>
                </div>
                
                {patient.age && (
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{patient.age} years old</span>
                  </div>
                )}
                
                {patient.bloodType && (
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{patient.bloodType}</span>
                  </div>
                )}
                
                {patient.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-sm font-bold text-blue-600">{patient.totalAppointments}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-sm font-bold text-green-600">{patient.completedAppointments}</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600">Upcoming</p>
                  <p className="text-sm font-bold text-orange-600">{patient.upcomingAppointments}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  href={`/patient-medical-history/${patient.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>History</span>
                </Link>
                <Link
                  href={`/doctor-prescriptions?patientId=${patient.id}&patientName=${patient.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>Prescriptions</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You don\'t have any patients yet'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Patient Details Modal */}
      <AnimatePresence>
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Info */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {selectedPatient.profilePicture ? (
                        <img
                          src={selectedPatient.profilePicture}
                          alt={selectedPatient.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h4>
                    <p className="text-gray-600">{selectedPatient.email}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{selectedPatient.phone}</span>
                    </div>
                    
                    {selectedPatient.age && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{selectedPatient.age} years old</span>
                      </div>
                    )}
                    
                    {selectedPatient.gender && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{selectedPatient.gender}</span>
                      </div>
                    )}
                    
                    {selectedPatient.bloodType && (
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{selectedPatient.bloodType}</span>
                      </div>
                    )}
                    
                    {selectedPatient.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{selectedPatient.address}</span>
                      </div>
                    )}
                    
                    {selectedPatient.emergencyContact && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Emergency: {selectedPatient.emergencyContact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900">Appointment Statistics</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedPatient.totalAppointments}</p>
                      <p className="text-sm text-gray-600">Total Appointments</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedPatient.completedAppointments}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{selectedPatient.upcomingAppointments}</p>
                      <p className="text-sm text-gray-600">Upcoming</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Last Visit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/patient-medical-history/${selectedPatient.id}`}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Medical History</span>
                </Link>
                <Link
                  href={`/doctor-prescriptions?patientId=${selectedPatient.id}&patientName=${selectedPatient.name}`}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Prescriptions</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 