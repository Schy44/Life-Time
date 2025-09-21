import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Auth.css';
import { Link } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const heartsContainer = document.getElementById('hearts-container');
        if (heartsContainer) {
            const heartSymbols = ['❤', '💕', '💖', '💗', '💓', '💘'];
            for (let i = 0; i < 15; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.innerHTML = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
                heart.style.left = Math.random() * 100 + '%';
                heart.style.animationDelay = Math.random() * 5 + 's';
                heart.style.fontSize = Math.random() * 15 + 15 + 'px';
                heartsContainer.appendChild(heart);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login/', { username, password });
            setToken(response.data.token);
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="scene">
            <div className="card-front">
                <div className="floating-hearts" id="hearts-container"></div>
                <div className="logo"><i className="fas fa-infinity"></i>Life-Time</div>
                <div className="tagline">Where Forever Begins</div>
                <ul className="benefits">
                    <li><i className="fas fa-heart"></i><span>Advanced compatibility matching</span></li>
                    <li><i className="fas fa-shield-alt"></i><span>Verified profiles with premium security</span></li>
                    <li><i className="fas fa-users"></i><span>Community of serious relationship seekers</span></li>
                    <li><i className="fas fa-hand-holding-heart"></i><span>Personalized matchmaking assistance</span></li>
                </ul>
            </div>
            <div className="card-back">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Login to continue your journey</p>
                    </div>
                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-with-icon"><i className="fas fa-at"></i><input type="text" id="username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon"><i className="fas fa-lock"></i><input type="password" id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        </div>
                        <button type="submit" className="submit-btn">Login</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
