import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.css';

const Home = ({ token, setToken }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/user/', {
                    headers: { Authorization: `Token ${token}` }
                });
                setName(response.data.name);
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };

        if (token) {
            fetchUser();
        }
    }, [token]);

    const handleLogout = () => {
        setToken(null);
        setName('');
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h2>Home</h2>
                {name ? <p>Hello, {name}</p> : <p>Please login or register.</p>}
                {token && <button onClick={handleLogout}>Logout</button>}
            </div>
        </div>
    );
};

export default Home;