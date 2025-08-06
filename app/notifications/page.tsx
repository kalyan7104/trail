'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { redirectToPatientLogin } from '@/lib/authGuard';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { patient } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!patient) {
      redirectToPatientLogin();
      return;
    }

    loadNotifications(patient.id);
  }, [patient]);

  const loadNotifications = async (patientId: string) => {
    try {
      setLoading(true);
      const data = await notificationAPI.getByPatientId(patientId);
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:3001/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return 'ri-calendar-check-line';
      case 'appointment_cancelled':
        return 'ri-calendar-close-line';
      case 'appointment_reminder':
        return 'ri-alarm-line';
      case 'lab_results':
        return 'ri-test-tube-line';
      case 'prescription_refill':
        return 'ri-capsule-line';
      case 'health_tip':
        return 'ri-heart-pulse-line';
      default:
        return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return 'bg-blue-100 text-blue-600';
      case 'appointment_cancelled':
        return 'bg-red-100 text-red-600';
      case 'appointment_reminder':
        return 'bg-yellow-100 text-yellow-600';
      case 'lab_results':
        return 'bg-green-100 text-green-600';
      case 'prescription_refill':
        return 'bg-purple-100 text-purple-600';
      case 'health_tip':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return `${Math.floor(diffMin / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/patient-dashboard"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <i className="ri-arrow-left-line text-gray-600"></i>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">Stay updated with your health</p>
              </div>
            </div>
            {notifications.some((n) => !n.read) && (
              <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                {notifications.filter((n) => !n.read).length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-notification-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">You’ll get updates about appointments and health alerts here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`bg-white rounded-xl p-4 shadow-sm border transition ${
                  n.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                      n.type
                    )}`}
                  >
                    <i className={`${getNotificationIcon(n.type)} text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{n.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <i className="ri-close-line text-gray-500 text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
