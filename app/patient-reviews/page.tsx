'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Send,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  appointmentType: string;
  notes: string;
}

interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

export default function PatientReviews() {
  const { patient } = useAuth();
  const router = useRouter();
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (patient === undefined) return;
    if (!patient) {
      router.push('/patient-login');
    } else {
      loadData();
    }
  }, [patient]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCompletedAppointments(),
        loadExistingReviews()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3001/appointments');
      const appointments = await response.json();
      
      const completed = appointments.filter((apt: Appointment) => 
        apt.patientId === patient?.id && apt.status === 'completed'
      );
      
      setCompletedAppointments(completed);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadExistingReviews = async () => {
    try {
      const response = await fetch('http://localhost:3001/reviews');
      const reviews = await response.json();
      
      const patientReviews = reviews.filter((rev: Review) => 
        rev.patientId === patient?.id
      );
      
      setExistingReviews(patientReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || rating === 0 || !reviewText.trim()) {
      setErrorMessage('Please provide both rating and review text');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const reviewData = {
        appointmentId: selectedAppointment.id,
        patientId: patient?.id,
        patientName: patient?.name,
        doctorId: selectedAppointment.doctorId,
        doctorName: selectedAppointment.doctorName,
        rating,
        review: reviewText.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setSuccessMessage('Review submitted successfully!');
        setRating(0);
        setReviewText('');
        setShowReviewForm(false);
        setSelectedAppointment(null);
        
        // Reload data to show the new review
        await loadData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviewedAppointment = (appointmentId: string) => {
    return existingReviews.some(review => review.appointmentId === appointmentId);
  };

  const getReviewForAppointment = (appointmentId: string) => {
    return existingReviews.find(review => review.appointmentId === appointmentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/patient-dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
                <p className="text-gray-600">Rate and review your completed appointments</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Completed Appointments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Appointments</h2>
          
          {completedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed appointments</h3>
              <p className="text-gray-600">You need to complete appointments before you can review them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAppointments.map((appointment) => {
                const hasReviewed = hasReviewedAppointment(appointment.id);
                const existingReview = getReviewForAppointment(appointment.id);
                
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {appointment.specialty}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{appointment.appointmentType}</span>
                          </div>
                        </div>

                        {hasReviewed && existingReview && (
                          <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-semibold text-green-800">Review Submitted</span>
                            </div>
                            <div className="flex items-center space-x-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= existingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">({existingReview.rating}/5)</span>
                            </div>
                            <p className="text-gray-700 text-sm">{existingReview.review}</p>
                          </div>
                        )}
                      </div>
                      
                      {!hasReviewed && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowReviewForm(true);
                            setRating(0);
                            setReviewText('');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Star className="h-4 w-4" />
                          <span>Review</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900">{selectedAppointment.doctorName}</h4>
                  <p className="text-sm text-gray-600">{selectedAppointment.specialty}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rate your experience (1-5 stars)
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Share your experience
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your appointment experience..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reviewText.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || rating === 0 || !reviewText.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 