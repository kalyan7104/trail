'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PatientHelpSupport() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'contact'>('faqs');

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment by browsing our list of doctors, selecting a doctor, and choosing an available time slot that works for you.'
    },
    {
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your appointment history.'
    },
    {
      question: 'How do I update my medical information?',
      answer: 'You can update your medical information including allergies, medications, and emergency contact details in your profile settings.'
    },
    {
      question: 'What if I forget my password?',
      answer: 'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions.'
    },
    {
      question: 'Are my medical records secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal and medical information.'
    },
    {
      question: 'How do I find doctors by specialty?',
      answer: 'You can search for doctors by specialty using the search and filter options on the doctors page.'
    },
    {
      question: 'What should I do if I have a medical emergency?',
      answer: 'For medical emergencies, please call 911 immediately. This app is for scheduling regular appointments only.'
    },
    {
      question: 'Can I see my appointment history?',
      answer: 'Yes, you can view all your past, current, and upcoming appointments in the appointment history section.'
    }
  ];

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/patient-profile" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
              <p className="text-sm text-gray-500">Get help and contact us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faqs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'faqs' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <i className={`ri-arrow-${openFAQ === index ? 'up' : 'down'}-s-line text-gray-400`}></i>
                    </button>
                    {openFAQ === index && (
                      <div className="px-4 pb-4 text-gray-600 text-sm">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-6">
                {/* Phone Support */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className="ri-phone-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                    <p className="text-gray-600 text-sm mb-2">Available 24/7 for urgent matters</p>
                    <a 
                      href="tel:+1-800-HEALTH1" 
                      className="text-blue-600 font-medium hover:text-blue-700"
                    >
                      +1 (800) 432-5841
                    </a>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <i className="ri-emergency-phone-line text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Emergency Line</h3>
                    <p className="text-gray-600 text-sm mb-2">For medical emergencies only</p>
                    <a 
                      href="tel:911" 
                      className="text-red-600 font-medium hover:text-red-700"
                    >
                      911
                    </a>
                  </div>
                </div>

                {/* Email Support */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i className="ri-mail-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-gray-600 text-sm mb-2">We'll respond within 24 hours</p>
                    <a 
                      href="mailto:support@healthapp.com" 
                      className="text-green-600 font-medium hover:text-green-700"
                    >
                      support@healthapp.com
                    </a>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <i className="ri-chat-3-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-gray-600 text-sm mb-2">Available Mon-Fri, 9 AM - 6 PM</p>
                    <button className="text-purple-600 font-medium hover:text-purple-700">
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-900">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-900">Closed</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <i className="ri-feedback-line text-blue-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-blue-600">Send Feedback</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <i className="ri-bug-line text-green-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-green-600">Report Bug</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}