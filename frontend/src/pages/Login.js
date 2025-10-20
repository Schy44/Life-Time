import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 p-4">
            <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 w-full max-w-md text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white mb-6">Login to continue your journey</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/50"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-lg hover:from-orange-500 hover:to-red-600 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <p className="text-white mt-6">
                    Don't have an account? <Link to="/register" className="font-bold hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;