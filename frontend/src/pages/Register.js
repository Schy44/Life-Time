import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import Logo from '../assets/images/Logo.png'; // Import the logo

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            alert('Passwords do not match!');
            return;
        }
        try {
            const token = await registerUser(email, username, password, password2);
            setToken(token);
            navigate('/profile');
        } catch (error) {
            console.error('Registration failed', error);
            alert('Registration failed. Please check your details and try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* Reverted to gray background */}
            <div className="flex bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
                <div className="w-1/2 hidden md:block">
                    <img src={Logo} alt="Life Time Logo" className="object-cover h-full w-full" />
                </div>
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Create Account</h2> {/* Reverted to gray text */}
                    <p className="text-gray-600 mb-6 text-center">Begin your journey to find your eternal partner</p> {/* Reverted to gray text */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 rounded-lg bg-lavender-600 text-white font-bold text-lg hover:bg-lavender-700 transition duration-300 shadow-md"
                        >
                            Create Account
                        </button>
                    </form>
                    <p className="text-gray-500 mt-6 text-center">
                        Already have an account? <Link to="/login" className="font-bold text-lavender-600 hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;