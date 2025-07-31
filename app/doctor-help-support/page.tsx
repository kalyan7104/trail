'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorHelpSupport() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'contact'>('faqs');
  const router = useRouter();

  useEffect(() => {
    const doctorData = localStorage.getItem('doctorData');
    if (!doctorData) {
      router.push('/doctor-login');
      return;
    }
  }, [router]);

  const faqs = [
    {
      question: 'How do I manage my appointment schedule?',
      answer: 'You can view and manage your appointments through the Doctor Appointments section. You can update appointment status, reschedule, or cancel appointments as needed.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to your profile page and click the "Edit" button. You can update your personal information, add your photo, and modify your professional details.'
    },
    {
      question: 'How do I view patient information?',
      answer: 'Patient information is available in the appointment details. You can see basic patient details and appointment history for better consultation preparation.'
    },
    {
      question: 'Can I set my availability hours?',
      answer: 'Yes, you can set your working hours and availability through your profile settings. This helps patients book appointments only during your available hours.'
    },
    {
      question: 'How do I handle emergency appointments?',
      answer: 'Emergency appointments are marked with a special indicator. You can prioritize these appointments and adjust your schedule accordingly.'
    },
    {
      question: 'What if I need to cancel multiple appointments?',
      answer: 'You can cancel multiple appointments from your schedule page. Select the appointments you want to cancel and use the bulk actions feature.'
    },
    {
      question: 'How do I communicate with patients?',
      answer: 'You can leave notes for patients through the appointment system. For urgent matters, use the contact information provided in the patient details.'
    },
    {
      question: 'How do I track my patient statistics?',
      answer: 'Your dashboard provides an overview of your patient statistics including total patients, appointments completed, and performance metrics.'
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
            <Link href="/doctor-profile" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
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
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-indigo-500 text-indigo-600'
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
                {/* Technical Support */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <i className="ri-phone-line text-indigo-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Technical Support</h3>
                    <p className="text-gray-600 text-sm mb-2">For system and technical issues</p>
                    <a 
                      href="tel:+1-800-DOCHELP" 
                      className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      +1 (800) 362-4357
                    </a>
                  </div>
                </div>

                {/* Emergency Line */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <i className="ri-emergency-phone-line text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Emergency Line</h3>
                    <p className="text-gray-600 text-sm mb-2">For urgent medical emergencies</p>
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
                    <p className="text-gray-600 text-sm mb-2">For general inquiries and support</p>
                    <a 
                      href="mailto:doctors@healthapp.com" 
                      className="text-green-600 font-medium hover:text-green-700"
                    >
                      doctors@healthapp.com
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
                    <p className="text-gray-600 text-sm mb-2">Available Mon-Fri, 8 AM - 8 PM</p>
                    <button className="text-purple-600 font-medium hover:text-purple-700">
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-900">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-900">12:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Support</span>
                  <span className="text-gray-900">24/7</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <i className="ri-feedback-line text-indigo-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-indigo-600">Send Feedback</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <i className="ri-bug-line text-green-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-green-600">Report Issue</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <i className="ri-book-line text-blue-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-blue-600">User Guide</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <i className="ri-question-answer-line text-yellow-600 text-xl mb-2"></i>
                  <span className="text-sm font-medium text-yellow-600">Training</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}