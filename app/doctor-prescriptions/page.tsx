'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
  X,
  RefreshCw,
  Printer,
  Download
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
  doctorId: string;
  doctorName: string;
  medicines: Medicine[];
  notes: string;
  prescribedDate: string;
  nextFollowUp: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  appointmentType: string;
  status: string;
}

export default function DoctorPrescriptions() {
  const { doctor } = useDoctorAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    patientName: '',
    medicines: [{ id: '', name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    nextFollowUp: ''
  });

  useEffect(() => {
    if (doctor === undefined) return;
    if (!doctor) {
      router.push('/doctor-login');
    } else {
      loadData();
    }
  }, [doctor]);

  useEffect(() => {
    // Check if we have URL parameters for pre-filling the form
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    
    if (appointmentId && patientId && patientName) {
      setFormData(prev => ({
        ...prev,
        appointmentId,
        patientId,
        patientName
      }));
      setShowForm(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch prescriptions for this doctor
      const prescriptionsResponse = await fetch('http://localhost:3001/prescriptions');
      const allPrescriptions = await prescriptionsResponse.json();
      const doctorPrescriptions = allPrescriptions.filter((presc: any) => presc.doctorId === doctor?.id);
      setPrescriptions(doctorPrescriptions);
      
      // Fetch appointments for this doctor
      const appointmentsResponse = await fetch('http://localhost:3001/appointments');
      const allAppointments = await appointmentsResponse.json();
      const doctorAppointments = allAppointments.filter((apt: any) => apt.doctorId === doctor?.id);
      
      // Fetch patient profiles to get patient information
      const patientsResponse = await fetch('http://localhost:3001/patient-profile');
      const patientsData = await patientsResponse.json();
      
      // Add patient information to appointments
      const appointmentsWithPatientInfo = doctorAppointments.map((apt: any) => {
        const patient = patientsData.find((p: any) => p.id === apt.patientId);
        return {
          ...apt,
          patientName: patient ? patient.name : 'Unknown Patient'
        };
      });
      
      setAppointments(appointmentsWithPatientInfo);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { id: '', name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setFormData(prev => ({
        ...prev,
        appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        ...formData,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        prescribedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        medicines: formData.medicines.filter(med => med.name && med.dosage)
      };

      const url = editingPrescription 
        ? `http://localhost:3001/prescriptions/${editingPrescription.id}`
        : 'http://localhost:3001/prescriptions';
      
      const method = editingPrescription ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (response.ok) {
        await loadData();
        setShowForm(false);
        setEditingPrescription(null);
        resetForm();
        setSuccessMessage(editingPrescription ? 'Prescription updated successfully!' : 'Prescription created successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save prescription:', error);
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      appointmentId: prescription.appointmentId,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      medicines: prescription.medicines,
      notes: prescription.notes,
      nextFollowUp: prescription.nextFollowUp
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!prescriptionToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3001/prescriptions/${prescriptionToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
        setShowDeleteModal(false);
        setPrescriptionToDelete(null);
        setSuccessMessage('Prescription deleted successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Failed to delete prescription:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      appointmentId: '',
      patientId: '',
      patientName: '',
      medicines: [{ id: '', name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '',
      nextFollowUp: ''
    });
  };

  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    if (filter !== 'all') {
      filtered = filtered.filter(presc => presc.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(presc => 
        presc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  if (!doctor) {
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
                href="/doctor-dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
                <p className="text-gray-600">Create and manage patient prescriptions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </button>
              <button
                onClick={() => {
                  setEditingPrescription(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Prescription</span>
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
                placeholder="Search by patient name or medicine..."
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
              <p className="text-gray-600 mb-6">Create your first prescription to get started</p>
              <button
                onClick={() => {
                  setEditingPrescription(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Prescription</span>
              </button>
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{prescription.patientName}</h3>
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
                      <button
                        onClick={() => handleEdit(prescription)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-yellow-600" />
                      </button>
                      <button
                        onClick={() => {
                          setPrescriptionToDelete(prescription);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPrescription(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Appointment Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Appointment
                  </label>
                  <select
                    value={formData.appointmentId}
                    onChange={(e) => handleAppointmentChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    required
                  >
                    <option value="">Select an appointment</option>
                    {appointments
                      .filter(apt => apt.status === 'completed')
                      .map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {appointment.patientName} - {appointment.date} {appointment.time} ({appointment.appointmentType})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Patient Info */}
                {formData.patientName && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
                    <p className="text-blue-700">{formData.patientName}</p>
                  </div>
                )}

                {/* Medicines */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Medicines</label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      + Add Medicine
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">Medicine {index + 1}</h5>
                          {formData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                            <input
                              type="text"
                              value={medicine.name}
                              onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                            <input
                              type="text"
                              value={medicine.dosage}
                              onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              placeholder="e.g., 500mg"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <input
                              type="text"
                              value={medicine.frequency}
                              onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                              placeholder="e.g., 3 times daily"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                              type="text"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              placeholder="e.g., 7 days"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                          <textarea
                            value={medicine.instructions}
                            onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            placeholder="Special instructions for taking this medicine..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or instructions for the patient..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    rows={3}
                  />
                </div>

                {/* Next Follow-up */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.nextFollowUp}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextFollowUp: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingPrescription ? 'Update' : 'Create'} Prescription</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPrescription(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Prescription Modal */}
      <AnimatePresence>
        {showViewModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Prescription Details</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Print functionality would go here
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-4">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Medical Prescription</h4>
                  <p className="text-gray-600">Prescribed by {selectedPrescription.doctorName}</p>
                  <p className="text-sm text-gray-500">Date: {selectedPrescription.prescribedDate}</p>
                </div>

                {/* Patient Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Patient Information</h5>
                  <p className="text-blue-700">{selectedPrescription.patientName}</p>
                </div>

                {/* Medicines */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Prescribed Medicines</h5>
                  <div className="space-y-4">
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="h-4 w-4 text-blue-500" />
                          <h6 className="font-semibold text-gray-900">{medicine.name}</h6>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Instructions:</span>
                            <p className="text-gray-600 mt-1">{medicine.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Notes</h5>
                    <p className="text-gray-700 bg-yellow-50 rounded-xl p-4">{selectedPrescription.notes}</p>
                  </div>
                )}

                {/* Follow-up */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">Next Follow-up:</span>
                    <span className="text-green-700">{selectedPrescription.nextFollowUp}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedPrescription.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedPrescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && prescriptionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Prescription</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the prescription for{' '}
                  <strong>{prescriptionToDelete.patientName}</strong>? This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPrescriptionToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 