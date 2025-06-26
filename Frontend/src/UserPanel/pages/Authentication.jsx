import React, { useState, useEffect } from 'react';
import Login from '../components/LoginSignup/Login';
import Signup from '../components/LoginSignup/Signup';
import { Tabs, Tab } from '@mui/material';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
    setIsLogin(newValue === 0);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 rounded-2xl shadow-2xl border border-gray-700/60 backdrop-blur-xl">
          <div className="p-8">
            <div className="flex justify-center mb-8">
          <Tabs
                value={activeTab}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
                className="mb-2"
                sx={{
                  '& .MuiTab-root': {
                    color: '#e5e7eb',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#c0c0c0',
                  },
                }}
          >
                <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>
            </div>
            <div className="w-full">
          {isLogin ? <Login /> : <Signup />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;