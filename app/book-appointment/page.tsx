'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Stethoscope,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function BookAppointment() {
  const { patient } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!patient) {
      router.push('/patient-login');
      return;
    }
  }, [patient]);

  if (!patient) {
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
          <div className="flex items-center space-x-4">
            <Link 
              href="/patient-dashboard"
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-gray-600">Select a doctor to schedule your appointment</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Stethoscope className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select a Doctor</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            To book an appointment, you need to select a doctor first. Browse through our list of qualified healthcare professionals and choose the one that best fits your needs.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Doctors</h3>
              <p className="text-gray-600 text-sm">View our list of qualified healthcare professionals</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Date & Time</h3>
              <p className="text-gray-600 text-sm">Choose from available appointment slots</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Notes</h3>
              <p className="text-gray-600 text-sm">Describe your symptoms or concerns</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/doctors"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Browse Doctors</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
