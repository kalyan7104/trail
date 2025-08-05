'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  User, 
  Stethoscope,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';
const BASE_URL = "https://mock-apis-pgcn.onrender.com";

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [apiDoctors, setApiDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { patient } = useAuth();
  const router = useRouter();

  const specialties = ['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Oncology'];

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }
    loadDoctors();
  }, [patient]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/doctors`);
      const doctorsData = await response.json();
      setApiDoctors(doctorsData);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    router.push(`/book-appointment/${doctorId}`);
  };

  // Fallback doctors data if API fails
  const fallbackDoctors = [
    {
      id: 'D001',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: '12 years',
      rating: 4.8,
      hospital: 'City General Hospital',
      availability: 'Available Today',
      consultationFee: '$150',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20female%20cardiologist%20doctor%20with%20stethoscope%2C%20medical%20coat%2C%20confident%20smile%2C%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc1&orientation=squarish'
    },
    {
      id: 'D002',
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      experience: '8 years',
      rating: 4.6,
      hospital: 'Metro Medical Center',
      availability: 'Available Tomorrow',
      consultationFee: '$120',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20Asian%20male%20orthopedic%20doctor%20with%20glasses%2C%20white%20coat%2C%20stethoscope%2C%20friendly%20expression%2C%20clinical%20setting&width=80&height=80&seq=doc2&orientation=squarish'
    },
    {
      id: 'D003',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      experience: '10 years',
      rating: 4.9,
      hospital: 'Skin Care Clinic',
      availability: 'Available Today',
      consultationFee: '$180',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20Hispanic%20female%20dermatologist%20doctor%2C%20medical%20coat%2C%20warm%20smile%2C%20modern%20clinic%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc3&orientation=squarish'
    },
    {
      id: 'D004',
      name: 'Dr. James Wilson',
      specialty: 'Pediatrics',
      experience: '15 years',
      rating: 4.7,
      hospital: 'Children\\\'s Hospital',
      availability: 'Available Today',
      consultationFee: '$100',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20male%20pediatric%20doctor%2C%20white%20coat%2C%20stethoscope%2C%20children%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc4&orientation=squarish'
    },
    {
      id: 'D005',
      name: 'Dr. Lisa Park',
      specialty: 'Neurology',
      experience: '11 years',
      rating: 4.8,
      hospital: 'Brain & Spine Center',
      availability: 'Available Tomorrow',
      consultationFee: '$200',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20Asian%20female%20neurologist%20doctor%2C%20medical%20coat%2C%20professional%20expression%2C%20modern%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc5&orientation=squarish'
    }
  ];

  // Use API data if available, otherwise use fallback
  const displayDoctors = apiDoctors.length > 0 ? apiDoctors : fallbackDoctors;

  const filteredDoctors = displayDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
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
              <Link href="/patient-dashboard" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
                <p className="text-gray-600">Book appointments with specialists</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search doctors or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm"
          />
        </motion.div>

        {/* Specialty Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-3 overflow-x-auto pb-2"
        >
          {specialties.map((specialty, index) => (
            <motion.button
              key={specialty}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedSpecialty === specialty
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:bg-white hover:shadow-md'
              }`}
            >
              {specialty}
            </motion.button>
          ))}
        </motion.div>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm font-medium text-gray-700">
            {filteredDoctors.length} doctors found
          </p>
        </motion.div>

        {/* Doctors List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredDoctors.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </motion.div>
          ) : (
            filteredDoctors.map((doctor, index) => (
              <motion.div 
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <img 
                    src={doctor.avatar} 
                    alt={doctor.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                        <p className="text-blue-600 font-semibold flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2" />
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{doctor.experience} experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{doctor.consultationFee}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                        doctor.availability === 'Available Today' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.availability}
                      </span>
                      
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/doctor-profile/${doctor.id}`}
                          className="px-4 py-2 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
                        >
                          View Profile
                        </Link>
                        <button 
                          onClick={() => handleDoctorSelect(doctor.id)}
                          className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
