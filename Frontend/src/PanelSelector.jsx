import React from "react";
import { useNavigate } from "react-router-dom";

const PanelSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Select Your Panel</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => navigate("/admin/login")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
        >
          Admin Panel
        </button>
        <button
          onClick={() => navigate("/user/login")}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"
        >
          User Panel
        </button>
        <button
          onClick={() => navigate("/local-guide")}  
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md"
        >
          Local Guide Panel
        </button>
      </div>
    </div>
  );
};

export default PanelSelector;
