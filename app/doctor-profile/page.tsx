'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorProfile() {
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
  const router = useRouter();

  useEffect(() => {
  const fetchDoctorProfile = async () => {
    const localData = localStorage.getItem('doctorData');
    if (!localData) {
      router.push('/doctor-login');
      return;
    }

    const doctorFromStorage = JSON.parse(localData);
    try {
      const response = await fetch(`http://localhost:3001/doctor-profile/${doctorFromStorage.id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');

      const freshDoctor = await response.json();
      setDoctorData(freshDoctor);
      setProfilePicture(freshDoctor.profilePicture || null);
      localStorage.setItem('doctorData', JSON.stringify(freshDoctor));

      setFormData({
        name: freshDoctor.name || '',
        email: freshDoctor.email || '',
        phone: freshDoctor.phone || '',
        specialty: freshDoctor.specialty || '',
        hospital: freshDoctor.hospital || '',
        experience: freshDoctor.experience || '',
        license: freshDoctor.license || '',
        education: freshDoctor.education || 'MD from Medical University',
        about: freshDoctor.about || 'Experienced medical professional dedicated to providing quality healthcare.'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  fetchDoctorProfile();
}, [router]);


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

    // Step 1: Update doctor-profile
    const res = await fetch(`http://localhost:3001/doctor-profile/${doctorData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload),
    });

    if (!res.ok) throw new Error('Failed to update profile');

    const updatedDoctor = await res.json();
    localStorage.setItem('doctorData', JSON.stringify(updatedDoctor));
    setDoctorData(updatedDoctor);

    // Step 2: PATCH doctor-login email if changed
    if (formData.email !== doctorData.email) {
      await fetch(`http://localhost:3001/doctor-login/${doctorData.id}`, {
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
    localStorage.removeItem('doctorData');
    localStorage.removeItem('userType');
    router.push('/');
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/doctor-dashboard" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-arrow-left-line text-gray-600"></i>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your information</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              <i className="ri-logout-box-line text-red-600"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <i className="ri-stethoscope-line text-indigo-600 text-2xl"></i>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
                <i className="ri-camera-line text-white text-xs"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{doctorData.name}</h2>
          <p className="text-indigo-600 font-medium mb-2">{doctorData.specialty}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <i className="ri-star-fill text-yellow-400"></i>
              <span>{doctorData.rating || '4.8'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-user-line text-gray-400"></i>
              <span>{doctorData.totalPatients || '156'} patients</span>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.specialty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.hospital}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.experience}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({...formData, license: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{doctorData.license}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-gray-900">{formData.education}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              {isEditing ? (
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({...formData, about: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-24 resize-none"
                  placeholder="Tell patients about yourself..."
                />
              ) : (
                <p className="text-gray-900">{formData.about}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-user-heart-line text-blue-600"></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-calendar-check-line text-green-600"></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-sm text-gray-600">Appointments</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h3>
          <Link 
            href="/doctor-help-support"
            className="flex items-center justify-between py-3 px-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="ri-question-line text-indigo-600"></i>
              </div>
              <div>
                <p className="font-medium text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-500">FAQs and contact information</p>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </Link>
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors !rounded-button disabled:opacity-70"
          >
            {isSaving ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        )}
      </div>
    </div>
  );
}