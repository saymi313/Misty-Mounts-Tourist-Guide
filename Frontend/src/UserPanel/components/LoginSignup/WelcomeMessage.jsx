import React from 'react';
import { Typography } from '@mui/material';

const WelcomeMessage = ({ isLogin }) => {
  return (
    <div className="text-white text-center">
      <Typography variant="h4" className="mb-4">
        {isLogin ? 'خوش آمدید' : 'شامل ہوں'}
      </Typography>
      <Typography variant="body1">
        {isLogin
          ? 'مسٹی ماؤنٹس میں واپس آنے پر خوش آمدید۔ اپنے سفر کی مہم جوئی جاری رکھیں!'
          : 'مسٹی ماؤنٹس کے ساتھ اپنے نئے سفر کی شروعات کریں۔ آج ہی رجسٹر کریں!'}
      </Typography>
    </div>
  );
};

export default WelcomeMessage;
