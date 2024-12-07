import React, { useState } from 'react';
import { TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <form className="space-y-6">
      <Typography variant="h5" className="text-center mb-6">
        Welcome back to Misty Mounts
      </Typography>
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        type="email"
        required
      />
      <TextField
        fullWidth
        label="Password"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
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
      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        className="bg-navy-blue hover:bg-navy-blue-dark"
      >
        Login
      </Button>
    </form>
  );
};

export default Login;

