import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import Logo from '../assets/images/Logo.png'; // Import the logo

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await loginUser(username, password);
            setToken(token);
            navigate('/profile');
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* Reverted to gray background */}
            <div className="flex bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
                <div className="w-1/2 hidden md:block">
                    <img src={Logo} alt="Life Time Logo" className="object-cover h-full w-full" />
                </div>
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Welcome Back</h2> {/* Reverted to gray text */}
                    <p className="text-gray-600 mb-6 text-center">Login to continue your journey</p> {/* Reverted to gray text */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Username</label> {/* Reverted to gray label */}
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" // Reverted to gray border and focus ring
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label> {/* Reverted to gray label */}
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" // Reverted to gray border and focus ring
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 rounded-lg bg-lavender-600 text-white font-bold text-lg hover:bg-lavender-700 transition duration-300 shadow-md" // Keep lavender button
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-gray-500 mt-6 text-center">
                        Don't have an account? <Link to="/register" className="font-bold text-lavender-600 hover:underline">Register here</Link> {/* Keep lavender link */}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;