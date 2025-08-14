// api.ts (converted to fetch-based API for JSON Server, no localStorage)

const BASE_URL="https://mock-apis-pgcn.onrender.com";

// Helper function
const handleResponse = async (res: Response) => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Doctor API
export const doctorAPI = {
  async register(data: any) {
    const res = await fetch(`${BASE_URL}/doctor-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(email: string, password: string) {
  // Step 1: Authenticate using /doctor-login
  const res = await fetch(`${BASE_URL}/doctor-login?email=${email}&password=${password}`);
  const users = await handleResponse(res);

  if (!users.length) throw new Error('Invalid credentials');
  const loginUser = users[0];

  // Step 2: Fetch doctor profile using the same ID
  const profileRes = await fetch(`${BASE_URL}/doctor-profile/${loginUser.id}`);
  if (!profileRes.ok) throw new Error('Doctor profile not found');

  const profile = await profileRes.json();

  // Step 3: Return merged data
  return { ...loginUser, ...profile };
}
,

  async updateProfile(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/doctor-profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async resetPassword(email: string, newPassword: string) {
    const res = await fetch(`${BASE_URL}/doctor-login?email=${email}`);
    const users = await handleResponse(res);
    if (!users.length) throw new Error('Email not found');
    const doctor = users[0];

    const patchRes = await fetch(`${BASE_URL}/doctor-login/${doctor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });
    return handleResponse(patchRes);
  },

  async getById(id: string) {
    const res = await fetch(`${BASE_URL}/doctor-profile/${id}`);
    return handleResponse(res);
  }
};

// Patient API
export const patientAPI = {
  async register(data: any) {
    const res = await fetch(`${BASE_URL}/patient-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/patient-login?email=${email}&password=${password}`);
    const users = await handleResponse(res);
    if (!users.length) throw new Error('Invalid credentials');
    return users[0];
  },

  async updateProfile(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/patient-profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async resetPassword(email: string, newPassword: string) {
    const res = await fetch(`${BASE_URL}/patient-login?email=${email}`);
    const users = await handleResponse(res);
    if (!users.length) throw new Error('Email not found');

    const patchRes = await fetch(`${BASE_URL}/patient-login/${users[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });
    return handleResponse(patchRes);
  },

  async getById(id: string) {
    const res = await fetch(`${BASE_URL}/patient-profile/${id}`);
    return handleResponse(res);
  }
};

// Notification API
export const notificationAPI = {
  async createNotification(data: any) {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getByPatientId(patientId: string) {
    const res = await fetch(`${BASE_URL}/notifications?patientId=${patientId}`);
    return handleResponse(res);
  },

  async markAsRead(notificationId: string) {
    const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    });
    return handleResponse(res);
  }
};

// Appointment API
export const appointmentAPI = {
 async bookAppointment(data: any) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const appointment = await handleResponse(res);

  // Create a notification
  const notification = {
    patientId: data.patientId,
    title: 'Appointment Booked',
    message: `Your appointment with ${data.doctorName} on ${data.date} at ${data.time} has been confirmed.`,
    type: 'appointment_booked',
    read: false,
    createdAt: new Date().toISOString()
  };

  await fetch(`${BASE_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification)
  });

  return appointment;
}
,

  async getByPatientId(patientId: string) {
    const res = await fetch(`${BASE_URL}/appointments?patientId=${patientId}`);
    return handleResponse(res);
  },

  async getByDoctorId(doctorId: string) {
    const res = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}`);
    return handleResponse(res);
  },

  async updateStatus(id: string, status: string) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

 cancelAppointment: async (id: string) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' })
  });
  return handleResponse(res);
}

};

// Medical History API
export const medicalHistoryAPI = {
  async getPatientMedicalHistory(patientId: string) {
    try {
      // Fetch patient profile
      const patientRes = await fetch(`${BASE_URL}/patient-profile/${patientId}`);
      const patient = patientRes.ok ? await patientRes.json() : null;

      // Fetch all appointments for the patient
      const appointmentsRes = await fetch(`${BASE_URL}/appointments?patientId=${patientId}`);
      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];

      // Fetch all prescriptions for the patient
      const prescriptionsRes = await fetch(`${BASE_URL}/prescriptions?patientId=${patientId}`);
      const prescriptions = prescriptionsRes.ok ? await prescriptionsRes.json() : [];

      return {
        patient,
        appointments: appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        prescriptions: prescriptions.sort((a: any, b: any) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime())
      };
    } catch (error) {
      console.error('Error fetching medical history:', error);
      throw error;
    }
  },

  async getPatientById(patientId: string) {
    const res = await fetch(`${BASE_URL}/patient-profile/${patientId}`);
    return handleResponse(res);
  },

  async getAppointmentsByPatientId(patientId: string) {
    const res = await fetch(`${BASE_URL}/appointments?patientId=${patientId}`);
    return handleResponse(res);
  },

  async getPrescriptionsByPatientId(patientId: string) {
    const res = await fetch(`${BASE_URL}/prescriptions?patientId=${patientId}`);
    return handleResponse(res);
  }
};
