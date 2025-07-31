// Authentication guard utilities
export const checkPatientAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const patientData = localStorage.getItem('patientData');
  return !!patientData;
};

export const checkDoctorAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const doctorData = localStorage.getItem('doctorData');
  return !!doctorData;
};

export const redirectToPatientLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/patient-login';
  }
};

export const redirectToDoctorLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/doctor-login';
  }
};