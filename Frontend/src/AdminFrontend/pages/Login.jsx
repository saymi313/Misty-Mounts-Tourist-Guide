import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate(); // Use for navigation

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/api/admin/auth/login",
                { username, password }
            );

            console.log("Login success:", response.data);

            // Save token (e.g., in localStorage)
            localStorage.setItem("adminToken", response.data.token); // Save token

            // Navigate to the admin dashboard
            navigate("/admin/dashboard");
        } catch (error) {
            setErrorMessage(error.response?.data?.error || error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>

            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
};

export default Login;
