import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Signup = () => {
  const [userType, setUserType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const validateFullName = (name) =>
    /^[a-zA-Z\s]+$/.test(name) || 'Full Name must contain only letters and spaces.';
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || 'Please enter a valid email address.';
  const validatePassword = (password) => {
    if (password.includes(' ')) return 'Password must not contain spaces.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character.';
    return true;
  };
  const validateConfirmPassword = (confirmPassword, password) =>
    confirmPassword === password || 'Passwords do not match.';
  const validateMobileNumber = (mobileNumber) =>
    /^[0-9]+$/.test(mobileNumber) || 'Mobile Number must contain only numeric digits.';

  const handleValidation = () => {
    const errors = {};
    const { fullName, email, password, confirmPassword, mobileNumber } = formValues;

    // Validate each field
    const fullNameError = validateFullName(fullName.trim());
    if (fullNameError !== true) errors.fullName = fullNameError;

    const emailError = validateEmail(email.trim());
    if (emailError !== true) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError !== true) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    if (confirmPasswordError !== true) errors.confirmPassword = confirmPasswordError;

    if (userType === 'localGuide') {
      const mobileNumberError = validateMobileNumber(mobileNumber);
      if (mobileNumberError !== true) errors.mobileNumber = mobileNumberError;

      if (!formValues.address.trim()) errors.address = 'Address is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      console.log('Form submitted:', formValues);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === 'mobileNumber' ? value.replace(/[^0-9]/g, '') : value.trimStart(), // Restrict mobile number to digits only
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h5" className="text-center mb-6">
        Join Misty Mounts Adventure
      </Typography>
      <TextField
        fullWidth
        label="Full Name"
        variant="outlined"
        name="fullName"
        value={formValues.fullName}
        onChange={handleChange}
        error={!!formErrors.fullName}
        helperText={formErrors.fullName}
        required
      />
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        name="email"
        value={formValues.email}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
        required
      />
      <TextField
        fullWidth
        label="Password"
        variant="outlined"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formValues.password}
        onChange={handleChange}
        error={!!formErrors.password}
        helperText={formErrors.password}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Confirm Password"
        variant="outlined"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formValues.confirmPassword}
        onChange={handleChange}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleClickShowConfirmPassword}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <RadioGroup
        row
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        className="justify-center"
      >
        <FormControlLabel value="user" control={<Radio />} label="User" />
        <FormControlLabel value="localGuide" control={<Radio />} label="Local Guide" />
      </RadioGroup>
      {userType === 'localGuide' && (
        <>
          <TextField
            fullWidth
            label="Mobile Number"
            variant="outlined"
            name="mobileNumber"
            value={formValues.mobileNumber}
            onChange={handleChange}
            error={!!formErrors.mobileNumber}
            helperText={formErrors.mobileNumber}
            required
          />
          <TextField
            fullWidth
            label="Address"
            variant="outlined"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
            multiline
            rows={3}
            required
          />
        </>
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        className="bg-navy-blue hover:bg-navy-blue-dark"
      >
        Sign Up
      </Button>
    </form>
  );
};

export default Signup;
