import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const AdminDashboard = () => {
    const navigate = useNavigate(); // Initialize navigate

    // Function to navigate to Tourist Spot Management
    const goToTouristSpotManagement = () => {
        navigate("/admin/tourist-spots"); // Navigating to the tourist spots management page
    };

    const goToAccommodationManagement = () => {
        navigate("/admin/accommodation"); // Navigating to the tourist spots management page
    };
    return (
        <div>
            <h1>Welcome to the Admin Dashboard</h1>
            {/* Button for navigating to Tourist Spot Management */}
            <button onClick={goToTouristSpotManagement}>
                Tourist Spot Management
            </button>
            <button onClick={goToAccommodationManagement}>
                Accommodation Management
            </button>
        </div>
    );
};

export default AdminDashboard;
