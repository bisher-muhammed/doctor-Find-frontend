// validationSchema.js
import * as Yup from 'yup';

export const registrationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required')
        .matches(/^[a-zA-Z0-9]+$/, 'Only letters and numbers allowed')
        .min(4, 'Must be at least 4 characters'),

    email: Yup.string()
        .required('Email is required')
        .email('Enter a valid email address'),
        

    phone_number: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits'),

    password: Yup.string()
        .required('Password is required')
        .min(8, 'At least 8 characters required')
        .matches(/[A-Z]/, 'Must contain an uppercase letter')
        .matches(/[a-z]/, 'Must contain a lowercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),

    password_confirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords do not match')
        .required('Confirm your password'),
});
