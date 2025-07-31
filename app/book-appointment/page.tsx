'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BASE_URL = 'https://mock-apis-pgcn.onrender.com'; // ✅ Use deployed backend

function BookAppointmentContent() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  useEffect(() => {
    const stored = localStorage.getItem('patient');
    if (!stored) {
      router.push('/patient-login');
      return;
    }
    setPatientData(JSON.parse(stored));

    const fetchDoctors = async () => {
      const res = await fetch(`${BASE_URL}/doctors`);
      const data = await res.json();
      setDoctors(data);

      if (doctorId) {
        const doc = data.find((d: any) => d.id === doctorId);
        if (doc) setSelectedDoctor(doc);
      }
    };
    fetchDoctors();
  }, [doctorId, router]);

  const generateTokenNumber = () => 'T' + Math.floor(Math.random() * 9000 + 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientData) return;

    setIsSubmitting(true);

    const appointmentData = {
      patientId: patientData.id,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: selectedTime,
      appointmentType,
      notes,
      tokenNumber: generateTokenNumber(),
      status: 'confirmed',
    };

    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const result = await res.json();
      setAppointmentDetails(result);
      setShowSuccess(true);

      const notification = {
        patientId: patientData.id,
        type: 'appointment_booked',
        title: 'Appointment Confirmed',
        message: `Your appointment with ${selectedDoctor.name} on ${selectedDate} at ${selectedTime} has been confirmed.`,
        read: false,
        createdAt: new Date().toISOString()
      };

      await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      setTimeout(() => {
        router.push('/patient-dashboard');
      }, 3000);
    } catch (err) {
      console.error('Failed to book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextDays = (count: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDate: date
      });
    }
    return dates;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Appointment Confirmed</h2>
          <p className="text-sm text-gray-600 mb-4">Thank you! We'll see you soon.</p>
          <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {selectedTime}</p>
          <p><strong>Token:</strong> {appointmentDetails?.tokenNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Book Appointment</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        {!doctorId && (
          <div>
            <h3 className="font-semibold mb-2">Select a Doctor:</h3>
            <div className="space-y-2">
              {doctors.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`w-full flex items-center p-3 border rounded-xl space-x-4 ${
                    selectedDoctor?.id === doc.id ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-full" />
                  <div className="text-left">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDoctor && (
          <div className="p-3 border rounded-xl bg-blue-50 border-blue-200">
            <p className="font-semibold">Doctor: {selectedDoctor.name}</p>
            <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Select Date:</h3>
          <div className="grid grid-cols-3 gap-2">
            {getNextDays(6).map((date) => (
              <button
                key={date.value}
                type="button"
                onClick={() => handleDateSelect(date.value)}
                className={`p-2 border rounded ${
                  selectedDate === date.value ? 'bg-blue-500 text-white' : 'border-gray-300'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Select Time:</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              '9:00 AM', '9:30 AM', '10:00 AM',
              '10:30 AM', '11:00 AM', '11:30 AM',
              '2:00 PM', '2:30 PM', '3:00 PM'
            ].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`p-2 border rounded ${
                  selectedTime === time ? 'bg-blue-500 text-white' : 'border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Type of Appointment:</label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="checkup">Regular Check-up</option>
            <option value="urgent">Urgent Care</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Additional Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border px-4 py-2 rounded"
            placeholder="Any symptoms or details..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-50"
          disabled={!selectedDoctor || !selectedDate || !selectedTime || isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}

export default function BookAppointment() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Loading...</div>}>
      <BookAppointmentContent />
    </Suspense>
  );
}
