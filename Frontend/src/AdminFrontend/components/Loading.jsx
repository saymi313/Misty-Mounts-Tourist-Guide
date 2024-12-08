import React from 'react';
import PropTypes from 'prop-types';

const LoadingComponent = ({ message = "Loading...", size = "medium", color = "#3498db" }) => {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-4",
    large: "w-12 h-12 border-6",
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* Spinner */}
      <div
        className={`${spinnerClass} border-solid border-t-transparent rounded-full animate-spin`}
        style={{
          borderColor: `${color}`,
          borderTopColor: "transparent", // Make top border explicitly transparent
        }}
      ></div>
      {/* Message */}
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
};

LoadingComponent.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.string,
};

export default LoadingComponent;
