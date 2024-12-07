import React, { useState } from 'react';
import Login from '../components/LoginSignup/Login';
import Signup from '../components/LoginSignup/Signup';
import WelcomeMessage from '../components/LoginSignup/WelcomeMessage';
import { Paper, Tabs, Tab } from '@mui/material';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleChange = (event, newValue) => {
    setIsLogin(newValue === 0);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Paper elevation={3} className="m-auto w-full max-w-4xl flex overflow-hidden rounded-lg shadow-lg">
        <div className="w-2/5 bg-navy-blue p-8 flex items-center justify-center">
          <WelcomeMessage isLogin={isLogin} />
        </div>
        <div className="w-3/5 p-8">
          <Tabs
            value={isLogin ? 0 : 1}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            className="mb-6"
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
          {isLogin ? <Login /> : <Signup />}
        </div>
      </Paper>
    </div>
  );
};

export default Authentication;