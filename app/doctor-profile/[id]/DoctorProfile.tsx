'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DoctorProfileProps {
  doctorId: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string; // changed from number to string since mock data uses '12 years'
  education: string;
  hospital: string;
  availability: string;
  consultationFee: string;
  languages: string[];
  rating: number;
  reviews: number;
  avatar: string;
  about: string;
  achievements: string[];
  workingHours: Record<string, string>;
}

export default function DoctorProfile({ doctorId }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const doctorData: Record<string, Doctor> = {
      D001: {
        id: 'D001',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        experience: '12 years',
        rating: 4.8,
        reviews: 156,
        hospital: 'City General Hospital',
        availability: 'Available Today',
        consultationFee: '$150',
        education: 'MD from Harvard Medical School',
        languages: ['English', 'Spanish'],
        avatar:
          'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20female%20cardiologist%20doctor%20with%20stethoscope%2C%20medical%20coat%2C%20confident%20smile%2C%20hospital%20background%2C%20medical%20photography%20style&width=120&height=120&seq=doc1&orientation=squarish',
        about:
          'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating heart conditions. She specializes in preventive cardiology and has published numerous research papers in cardiovascular medicine.',
        achievements: [
          'Board Certified in Cardiology',
          'Fellow of American College of Cardiology',
          'Published 25+ research papers',
          'Best Doctor Award 2023'
        ],
        workingHours: {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 3:00 PM',
          saturday: '10:00 AM - 2:00 PM',
          sunday: 'Closed'
        }
      },
      D002: {
        id: 'D002',
        name: 'Dr. Michael Chen',
        specialty: 'Orthopedics',
        experience: '8 years',
        rating: 4.6,
        reviews: 98,
        hospital: 'Metro Medical Center',
        availability: 'Available Tomorrow',
        consultationFee: '$120',
        education: 'MD from Johns Hopkins University',
        languages: ['English', 'Mandarin'],
        avatar:
          'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20Asian%20male%20orthopedic%20doctor%20with%20glasses%2C%20white%20coat%2C%20stethoscope%2C%20friendly%20expression%2C%20clinical%20setting&width=120&height=120&seq=doc2&orientation=squarish',
        about:
          'Dr. Michael Chen is an experienced orthopedic surgeon specializing in joint replacement and sports medicine. He has helped hundreds of patients recover from various orthopedic conditions.',
        achievements: [
          'Board Certified in Orthopedic Surgery',
          'Sports Medicine Fellowship',
          'Minimally Invasive Surgery Expert',
          'Excellence in Patient Care Award'
        ],
        workingHours: {
          monday: '8:00 AM - 4:00 PM',
          tuesday: '8:00 AM - 4:00 PM',
          wednesday: '8:00 AM - 4:00 PM',
          thursday: '8:00 AM - 4:00 PM',
          friday: '8:00 AM - 2:00 PM',
          saturday: 'Closed',
          sunday: 'Closed'
        }
      }
    };

    const currentDoctor = doctorData[doctorId];
    if (currentDoctor) {
      setDoctor(currentDoctor);
    }
  }, [doctorId]);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Doctor Profile</h1>
              <p className="text-sm text-gray-500">View details and book appointment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <img src={doctor.avatar} alt={doctor.name} className="w-20 h-20 rounded-full object-cover" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h2>
              <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <i className="ri-star-fill text-yellow-400"></i>
                  <span className="font-medium">{doctor.rating}</span>
                  <span>({doctor.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-time-line text-gray-400"></i>
                  <span>{doctor.experience}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-hospital-line text-gray-400"></i>
                <span>{doctor.hospital}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold text-gray-900">{doctor.consultationFee}</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  doctor.availability === 'Available Today'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {doctor.availability}
              </span>
            </div>
            <Link
              href={`/book-appointment?doctorId=${doctor.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            {['overview', 'schedule', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Experience</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <i className="ri-graduation-cap-line text-blue-600"></i>
                      <span className="text-gray-700">{doctor.education}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-briefcase-line text-blue-600"></i>
                      <span className="text-gray-700">{doctor.experience} of experience</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
                  <div className="space-y-2">
                    {doctor.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <i className="ri-award-line text-yellow-500"></i>
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                <div className="space-y-3">
                  {Object.entries(doctor.workingHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-700 font-medium capitalize">{day}</span>
                      <span
                        className={`text-sm ${
                          hours === 'Closed' ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <i className="ri-star-fill text-yellow-400"></i>
                      <span className="font-medium">{doctor.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({doctor.reviews} reviews)</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="border-b border-gray-100 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-user-line text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">Patient {r}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className="ri-star-fill text-yellow-400 text-sm"></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Excellent doctor! Very professional and caring. Highly recommended.
                          </p>
                          <span className="text-xs text-gray-400">2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
