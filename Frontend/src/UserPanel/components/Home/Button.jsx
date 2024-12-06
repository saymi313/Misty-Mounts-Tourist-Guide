import React from 'react';

const Button = ({ text, href, variant }) => {
  const baseStyle = "px-6 py-2 rounded-md text-lg font-semibold shadow-md";
  const styles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <a href={href} className={`${baseStyle} ${styles[variant]}`}>
      {text}
    </a>
  );
};

export default Button;
