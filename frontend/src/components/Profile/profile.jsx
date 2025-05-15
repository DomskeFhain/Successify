import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContex/AuthContex';
import axios from 'axios';
import { useApiErrorHandler } from '../HandleApiError/HandleApiError';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './profile.css';

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
            console.log(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('The passwords do not match');
            setNewPassword('');
            setConfirmPassword('');
            return;
        }

        try {
            await axiosAuth.put('/user', {
                password: currentPassword,
                newPassword: newPassword
            });
            setMessage('Password successfully changed');
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
                {userData && (<>
                    <h1>{userData.username}'s profile</h1>
                    <div className="user-info">
                        <p>Username: {userData.username}</p>
                    </div>
                </>)}

                <form onSubmit={handlePasswordChange} className="password-form">
                    <h3>Change Password</h3>
                    <TextField
                        required
                        type="password"
                        label="enter your current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <h3>New Password</h3>
                    <TextField
                        required
                        type="password"
                        label="enter your new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        required
                        type="password"
                        label="verify your new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 2, justifySelf: 'center', textAlign: 'center', display: 'flex' }}
                    >
                        confirm change
                    </Button>
                </form>
                {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
            </div>
        </div>
    );
}

export default Profile;