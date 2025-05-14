import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContex/AuthContex';
import axios from 'axios';
import { useApiErrorHandler } from '../HandleApiError/HandleApiError';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Profile.css';

function Profile() {
    const { token } = useAuth();
    const handleError = useApiErrorHandler();
    const [userData, setUserData] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    const axiosAuth = axios.create({
        baseURL: 'http://localhost:9000',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axiosAuth.get('/profile');
            setUserData(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('Die Passwörter stimmen nicht überein');
            return;
        }

        try {
            await axiosAuth.put('/user', {
                password: currentPassword,
                newPassword: newPassword
            });
            setMessage('Passwort erfolgreich geändert');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                handleError(error);
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h2>Profil</h2>
                {userData && (
                    <div className="user-info">
                        <p>Benutzername: {userData.username}</p>
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="password-form">
                    <h3>Passwort ändern</h3>
                    <TextField
                        required
                        type="password"
                        label="Aktuelles Passwort"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        required
                        type="password"
                        label="Neues Passwort"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        required
                        type="password"
                        label="Neues Passwort bestätigen"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 2 }}
                    >
                        Passwort ändern
                    </Button>
                </form>
                {message && <p className={message.includes('erfolgreich') ? 'success-message' : 'error-message'}>{message}</p>}
            </div>
        </div>
    );
}

export default Profile;