'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  User,
  Pill,
  RefreshCw,
  Printer,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';

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
  patientAge?: string;
  patientGender?: string;
  patientDiagnosis?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorLicense?: string;
  medicines: Medicine[];
  notes: string;
  prescribedDate: string;
  nextFollowUp: string;
  status: 'active' | 'completed' | 'cancelled';
}

export default function PatientPrescriptions() {
  const { patient } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }
    loadPrescriptions();
  }, [patient]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/prescriptions');
      const allPrescriptions = await response.json();
      const patientPrescriptions = allPrescriptions.filter((presc: any) => presc.patientId === patient?.id);
      setPrescriptions(patientPrescriptions);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    if (filter !== 'all') {
      filtered = filtered.filter(presc => presc.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(presc => 
        presc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presc.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const filteredPrescriptions = getFilteredPrescriptions();

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
                href="/patient-dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
                <p className="text-gray-600">View and manage your prescriptions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPrescriptions}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </button>
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
                placeholder="Search by doctor name or medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Prescriptions List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Prescriptions ({filteredPrescriptions.length})</h2>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600">You don't have any prescriptions yet. Contact your doctor to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPrescriptions.map((prescription) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Dr. {prescription.doctorName}</h3>
                          <p className="text-sm text-gray-600">Prescribed on {prescription.prescribedDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700">
                            {prescription.medicines.length} medicine(s)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            Follow-up: {prescription.nextFollowUp}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {prescription.status}
                          </span>
                        </div>
                      </div>

                      {prescription.notes && (
                        <p className="text-sm text-gray-600 mb-4">{prescription.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowViewModal(true);
                        }}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* View Prescription Modal - 4-Part Layout */}
      <AnimatePresence>
        {showViewModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Part 1: Header with Clinic Logo and Doctor Info */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Clinic Logo */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">HealthCare Clinic</h2>
                      <p className="text-blue-100">Excellence in Healthcare</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold">Dr. {selectedPrescription.doctorName}</h3>
                    <p className="text-blue-100">{selectedPrescription.doctorSpecialization || 'General Physician'}</p>
                    <p className="text-sm text-blue-200">License: {selectedPrescription.doctorLicense || 'MD12345'}</p>
                  </div>
                </div>
              </div>

              {/* Part 2: Patient Information */}
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900 font-semibold">{selectedPrescription.patientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="text-gray-900">{selectedPrescription.patientAge || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{selectedPrescription.patientGender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{selectedPrescription.prescribedDate}</p>
                  </div>
                </div>
                {selectedPrescription.patientDiagnosis && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">{selectedPrescription.patientDiagnosis}</p>
                  </div>
                )}
              </div>

              {/* Part 3: Medicines */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-green-600" />
                  Prescribed Medicines
                </h3>
                <div className="space-y-4">
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Dosage:</span> {medicine.dosage}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span> {medicine.frequency}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span> {medicine.duration}
                        </div>
                      </div>
                      {medicine.instructions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <span className="font-medium text-gray-700">Instructions:</span>
                          <p className="text-gray-600 mt-1">{medicine.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedPrescription.notes && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{selectedPrescription.notes}</p>
                  </div>
                )}

                {selectedPrescription.nextFollowUp && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Next Follow-up:</span>
                      <span className="text-blue-700">{selectedPrescription.nextFollowUp}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Part 4: Clinic Address Footer */}
              <div className="bg-gray-900 text-white p-6 rounded-b-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-gray-300">123 Healthcare Street, Medical District, City - 12345</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-300">info@healthcareclinic.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedPrescription.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedPrescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedPrescription.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        // Print functionality
                        window.print();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
