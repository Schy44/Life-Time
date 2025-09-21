import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Register = ({ setToken }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

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
        if (password !== password2) {
            alert('Passwords do not match!');
            return;
        }
        try {
            const response = await axios.post('/api/register/', { name, email, username, password, password2 });
            setToken(response.data.token);
        } catch (error) {
            console.error('Registration failed', error);
            alert('Registration failed. Please check your details and try again.');
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
                        <h2>Create Account</h2>
                        <p>Begin your journey to find your eternal partner</p>
                    </div>
                    <form id="registerForm" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-with-icon"><i className="fas fa-user"></i><input type="text" id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <div className="input-with-icon"><i className="fas fa-at"></i><input type="text" id="username" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-with-icon"><i className="fas fa-envelope"></i><input type="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-with-icon"><i className="fas fa-lock"></i><input type="password" id="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password2">Confirm Password</label>
                                <div className="input-with-icon"><i className="fas fa-lock"></i><input type="password" id="password2" placeholder="Confirm your password" value={password2} onChange={(e) => setPassword2(e.target.value)} required /></div>
                            </div>
                        </div>
                        <div className="terms">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
                        </div>
                        <button type="submit" className="submit-btn">Create Account</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
