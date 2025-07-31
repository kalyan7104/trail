'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = ['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Oncology'];

  const doctors = [
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
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20male%20pediatric%20doctor%20with%20kind%20expression%2C%20white%20coat%2C%20stethoscope%2C%20children%20hospital%20background%2C%20medical%20photography%20style&width=80&height=80&seq=doc4&orientation=squarish'
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

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/patient-dashboard" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-arrow-left-line text-gray-600"></i>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Find Doctors</h1>
                <p className="text-sm text-gray-500">Book appointments with specialists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search doctors or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          />
        </div>

        {/* Specialty Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors !rounded-button ${
                selectedSpecialty === specialty
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredDoctors.length} doctors found
          </p>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <i className="ri-filter-line text-gray-600"></i>
            </button>
            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <i className="ri-sort-desc text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <img 
                  src={doctor.avatar} 
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <i className="ri-star-fill text-yellow-400 text-sm"></i>
                        <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <i className="ri-hospital-line text-gray-400"></i>
                      <span>{doctor.hospital}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-time-line text-gray-400"></i>
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-money-dollar-circle-line text-gray-400"></i>
                      <span>{doctor.consultationFee}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.availability === 'Available Today' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.availability}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/doctor-profile/${doctor.id}`}
                        className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors !rounded-button"
                      >
                        View Profile
                      </Link>
                      <Link 
                        href={`/book-appointment?doctorId=${doctor.id}`}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors !rounded-button"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
