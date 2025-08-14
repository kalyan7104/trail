'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pill, Clock, CheckCircle } from 'lucide-react';

interface Prescription {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  prescribedDate: string;
  patientName: string;
}

interface PrescriptionStatsProps {
  doctorId: string;
}

export default function PrescriptionStats({ doctorId }: PrescriptionStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    recentPrescriptions: [] as Prescription[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptionStats();
  }, [doctorId]);

  const loadPrescriptionStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/prescriptions');
      const allPrescriptions = await response.json();
      
      // Filter prescriptions for this doctor
      const doctorPrescriptions = allPrescriptions.filter((presc: any) => presc.doctorId === doctorId);
      
      // Calculate stats
      const total = doctorPrescriptions.length;
      const active = doctorPrescriptions.filter((presc: any) => presc.status === 'active').length;
      const completed = doctorPrescriptions.filter((presc: any) => presc.status === 'completed').length;
      const cancelled = doctorPrescriptions.filter((presc: any) => presc.status === 'cancelled').length;
      
      // Get recent prescriptions (last 5)
      const recentPrescriptions = doctorPrescriptions
        .sort((a: any, b: any) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime())
        .slice(0, 5);

      setStats({
        total,
        active,
        completed,
        cancelled,
        recentPrescriptions
      });
    } catch (error) {
      console.error('Failed to load prescription stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Prescription Overview</h2>
        <FileText className="h-6 w-6 text-blue-600" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <Pill className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <Clock className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
        {stats.recentPrescriptions.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No prescriptions yet</p>
            <p className="text-sm text-gray-400">Create your first prescription to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentPrescriptions.map((prescription) => (
              <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prescription.patientName}</p>
                    <p className="text-sm text-gray-600">{prescription.prescribedDate}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                  prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prescription.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 