'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Award, 
  GraduationCap, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  LogOut,
  Shield,
  Activity,
  Building,
  Clock
} from 'lucide-react';
const BASE_URL="https://mock-apis-pgcn.onrender.com";
export default function DoctorProfile() {
  const { doctor, logout } = useDoctorAuth();
  const router = useRouter();

  const [doctorData, setDoctorData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    hospital: '',
    experience: '',
    license: '',
    education: '',
    about: ''
  });

  useEffect(() => {
    if (!doctor) {
      router.push('/doctor-login');
      return;
    }

    const fetchDoctorProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/doctor-profile/${doctor.id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');

        const freshDoctor = await response.json();
        setDoctorData(freshDoctor);
        setProfilePicture(freshDoctor.profilePicture || null);

        setFormData({
          name: freshDoctor.name || '',
          email: freshDoctor.email || '',
          phone: freshDoctor.phone || '',
          specialty: freshDoctor.specialty || '',
          hospital: freshDoctor.hospital || '',
          experience: freshDoctor.experience || '',
          license: freshDoctor.license || '',
          education: freshDoctor.education || '',
          about: freshDoctor.about || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/doctor-login');
      }
    };

    fetchDoctorProfile();
  }, [doctor, router]);

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
    if (!doctorData?.id) return;
    setIsSaving(true);

    try {
      const updatedPayload = {
        ...formData,
        profilePicture: profilePicture || null,
        id: doctorData.id,
      };

      const res = await fetch(`${BASE_URL}/doctor-profile/${doctorData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedDoctor = await res.json();
      setDoctorData(updatedDoctor);

      if (formData.email !== doctorData.email) {
        await fetch(`${BASE_URL}/doctor-login/${doctorData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
      }

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

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/doctor-dashboard"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
                <p className="text-gray-600">Manage your professional information</p>
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
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Stethoscope className="h-16 w-16 text-white" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-2 right-2 p-3 bg-green-600 hover:bg-green-700 rounded-full cursor-pointer transition-colors shadow-lg">
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
            {isEditing ? formData.name : doctorData.name}
          </h2>
          <p className="text-gray-600 mb-2">{doctorData.specialty}</p>
          <p className="text-gray-500 mb-6">Doctor ID: {doctorData.id}</p>
          
          <div className="flex justify-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-70"
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
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
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
            <User className="h-6 w-6 text-green-600" />
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.license}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Professional Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <span>Professional Information</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
              {isEditing ? (
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                >
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Family Medicine">Family Medicine</option>
                </select>
              ) : (
                <p className="text-gray-900">{doctorData.specialty}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital/Clinic</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.hospital}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.experience} years</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.education}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">About</label>
              {isEditing ? (
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your expertise and experience..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{doctorData.about || 'No description available'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Professional Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
            <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorData.experience || 0}</p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
            <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorData.license ? 'Licensed' : 'Pending'}</p>
            <p className="text-sm text-gray-600">License Status</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
            <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-4">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorData.hospital ? 'Active' : 'Inactive'}</p>
            <p className="text-sm text-gray-600">Practice Status</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
