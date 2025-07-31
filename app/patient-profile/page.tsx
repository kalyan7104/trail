'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const BASE_URL = 'https://mock-apis-pgcn.onrender.com';

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
        const res = await fetch(`${BASE_URL}/patient-profile/${patient.id}`);
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

      const res = await fetch(`${BASE_URL}/patient-profile/${patientData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      if (!res.ok) throw new Error('Failed to update patient-profile');

      if (formData.email !== patientData.email) {
        const loginRes = await fetch(`${BASE_URL}/patient-login?email=${patientData.email}`);
        const loginData = await loginRes.json();
        if (loginData.length > 0) {
          await fetch(`${BASE_URL}/patient-login/${loginData[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
          });
        }
      }

      setPatientData(updatedPayload);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!patient || !patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-gray-200">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <i className="ri-user-line text-gray-400 text-3xl flex items-center justify-center h-full"></i>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
              <i className="ri-camera-line text-white text-sm"></i>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {Object.entries(formData).map(([field, value]) => (
        <div className="mb-4" key={field}>
          <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
          <input
            value={value}
            disabled={!isEditing}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      ))}

      <div className="flex justify-between mt-6">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit</button>
        ) : (
          <>
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
          </>
        )}
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>
    </div>
  );
}
