'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDoctorAuth } from '@/contexts/DoctorAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  User,
  SortAsc,
  SortDesc
} from 'lucide-react';
const BASE_URL="https://mock-apis-pgcn.onrender.com";
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

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export default function DoctorReviews() {
  const { doctor } = useDoctorAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (doctor === undefined) return;
    if (!doctor) {
      router.push('/doctor-login');
    } else {
      loadReviews();
    }
  }, [doctor]);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchTerm, ratingFilter, sortBy, sortOrder]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/reviews`);
      const allReviews = await response.json();
      
      // Filter reviews for this doctor
      const doctorReviews = allReviews.filter((review: Review) => review.doctorId === doctor?.id);
      setReviews(doctorReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Sort reviews
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredReviews(filtered);
  };

  const calculateStats = () => {
    if (reviews.length === 0) return null;

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution: RatingDistribution[] = [];

    // Calculate rating distribution
    for (let i = 1; i <= 5; i++) {
      const count = reviews.filter(review => review.rating === i).length;
      const percentage = (count / totalReviews) * 100;
      ratingDistribution.push({ rating: i, count, percentage });
    }

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  };

  const stats = calculateStats();

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

  if (!doctor) {
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
                href="/doctor-dashboard"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
                <p className="text-gray-600">View feedback from your patients</p>
              </div>
            </div>
            <button
              onClick={loadReviews}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Statistics */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Average Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>

              {/* Total Reviews */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>

              {/* Rating Trend */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {stats.ratingDistribution[4]?.percentage.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Rating Distribution</h3>
              {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name or review content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              >
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="patient">Patient Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reviews List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredReviews.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {searchTerm || ratingFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You don\'t have any reviews yet'
                }
              </p>
            </div>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.patientName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({review.rating}/5)</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{review.review}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.updatedAt !== review.createdAt && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>Updated on {new Date(review.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
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
