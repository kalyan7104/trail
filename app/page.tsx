'use client';

import Link from 'next/link';
import { Stethoscope, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-10 text-center">
        <div>
          <Stethoscope className="mx-auto h-14 w-14 text-indigo-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-800">Welcome to HealthCare Portal</h1>
          <p className="mt-2 text-gray-600 text-lg">
            Book appointments, manage your medical visits, and consult with certified doctors.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/patient-login">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
              <LogIn className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">Patient Login</h2>
              <p className="text-sm text-gray-500 mt-1">Book appointments and view your history.</p>
            </div>
          </Link>
          <Link href="/doctor-login">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
              <UserPlus className="h-8 w-8 text-green-600 mb-3 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">Doctor Login</h2>
              <p className="text-sm text-gray-500 mt-1">Manage patient appointments and profile.</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
