'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Pill, 
  AlertTriangle, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  LogOut,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function PatientProfile() {
  const { patient, logout } = useAuth();
  const router = useRouter();

  const [patientData, setPatientData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    medications: ''
  });

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/patient-profile/${patient.id}`);
        if (!res.ok) throw new Error('Patient profile not found');

        const data = await res.json();
        setPatientData(data);
        setProfilePicture(data.profilePicture || null);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          bloodType: data.bloodType || '',
          allergies: data.allergies || '',
          medications: data.medications || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/patient-login');
      }
    };

    fetchProfile();
  }, [patient, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!patientData?.id) return;
    setIsSaving(true);

    try {
      const updatedPayload = {
        ...formData,
        profilePicture,
        id: patientData.id
      };

      // Update patient-profile
      const res = await fetch(`http://localhost:3001/patient-profile/${patientData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      if (!res.ok) throw new Error('Failed to update patient-profile');

      // If email changed, sync in patient-login
      if (formData.email !== patientData.email) {
        const loginRes = await fetch(`http://localhost:3001/patient-login?email=${patientData.email}`);
        const loginData = await loginRes.json();
        if (loginData.length > 0) {
          await fetch(`http://localhost:3001/patient-login/${loginData[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
          });
        }
      }

      setPatientData(updatedPayload);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
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
                href="/patient-dashboard"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
            >
              <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-8">
        {/* Profile Picture Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-2 right-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors shadow-lg">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? formData.name : patientData.name}
          </h2>
          <p className="text-gray-600 mb-6">Patient ID: {patientData.id}</p>
          
          <div className="flex justify-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-70"
                >
                  <Save className="h-5 w-5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Edit3 className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <span>Personal Information</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.dateOfBirth}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.address}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Medical Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-600" />
            <span>Medical Information</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type</label>
              {isEditing ? (
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="text-gray-900">{patientData.bloodType || 'Not specified'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.emergencyContact || 'Not specified'}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
              {isEditing ? (
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={3}
                  placeholder="List any allergies..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.allergies || 'None reported'}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
              {isEditing ? (
                <textarea
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  rows={3}
                  placeholder="List current medications..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{patientData.medications || 'None reported'}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
