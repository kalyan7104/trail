
import * as yup from 'yup';

// Doctor login validation
export const doctorLoginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Doctor registration validation
export const doctorRegistrationSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  specialty: yup
    .string()
    .required('Specialty is required'),
  hospital: yup
    .string()
    .required('Hospital/Clinic is required'),
  experience: yup
    .string()
    .required('Experience is required'),
  license: yup
    .string()
    .required('License number is required'),
  education: yup
    .string()
    .required('Education is required'),
  about: yup
    .string()
    .min(10, 'About must be at least 10 characters')
    .max(500, 'About must be less than 500 characters')
    .required('About is required'),
});

// Patient login validation
export const patientLoginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Patient registration validation
export const patientRegistrationSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required'),
  address: yup
    .string()
    .required('Address is required'),
  emergencyContact: yup
    .string()
    .required('Emergency contact is required'),
  bloodType: yup
    .string()
    .required('Blood type is required'),
  allergies: yup
    .string()
    .required('Allergies field is required (enter "None" if no allergies)'),
  medications: yup
    .string()
    .required('Medications field is required (enter "None" if no medications)'),
});

// Forgot password validation
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Profile update validation
export const doctorProfileUpdateSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  specialty: yup
    .string()
    .required('Specialty is required'),
  hospital: yup
    .string()
    .required('Hospital/Clinic is required'),
  experience: yup
    .string()
    .required('Experience is required'),
  license: yup
    .string()
    .required('License number is required'),
  education: yup
    .string()
    .required('Education is required'),
  about: yup
    .string()
    .min(10, 'About must be at least 10 characters')
    .max(500, 'About must be less than 500 characters')
    .required('About is required'),
});

export const patientProfileUpdateSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required'),
  address: yup
    .string()
    .required('Address is required'),
  emergencyContact: yup
    .string()
    .required('Emergency contact is required'),
  bloodType: yup
    .string()
    .required('Blood type is required'),
  allergies: yup
    .string()
    .required('Allergies field is required'),
  medications: yup
    .string()
    .required('Medications field is required'),
});
