
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/profile_page';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        setToken(token);
    };

    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {token && (
                            <li><Link to="/profile">Profile</Link></li>
                        )}
                        {!token && (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<Home token={token} setToken={setAuthToken} />} />
                    <Route path="/login" element={!token ? <Login setToken={setAuthToken} /> : <Navigate to="/" />} />
                    <Route path="/register" element={!token ? <Register setToken={setAuthToken} /> : <Navigate to="/" />} />
                    <Route path="/profile" element={token ? <ProfilePage token={token} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
