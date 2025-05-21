import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContex/AuthContex';
import axios from 'axios';
import { useApiErrorHandler } from '../HandleApiError/HandleApiError';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './profile.css';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
function Profile() {
    const { token, logout } = useAuth();
    const handleError = useApiErrorHandler();
    const [userData, setUserData] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const handleDeleteClick = async () => {
        try {
            await axiosAuth.delete('/user');
            alert("Your profile has been successfully deleted!");

            logout();
            navigate('/');
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("An unexpected error occurred");
                console.error(error);
            }
        }
    };

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

    const handleProfileChange = async (event) => {
        event.preventDefault();

        if (newUsername === userData.username && !newPassword) {
            setMessage("No changes have been entered.");
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setMessage('The passwords do not match');
            setNewPassword('');
            setConfirmPassword('');
            return;
        }

        try {
            await axiosAuth.put('/user', {
                newUsername: newUsername !== userData.username ? newUsername : undefined,
                password: currentPassword,
                newPassword: newPassword || undefined,
            });

            setMessage('Profile has been successfully changed!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setNewUsername('');
            fetchUserData();

        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                handleError(error);
            }
        }
    };
    const toggleShowCurrentPassword = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const toggleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();

    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                {userData && (<>
                    <h1>{userData.username}'s profile</h1>
                </>)}

                <form onSubmit={handleProfileChange} className="password-form">
                    <h3>Edit Username</h3>
                    <TextField
                        label="Enter new username"
                        value={newUsername}
                        onChange={(event) => setNewUsername(event.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <h3>Change Password</h3>
                    <TextField
                        required
                        type={showCurrentPassword ? "text" : "password"}
                        label="enter your current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle current password visibility"
                                        onClick={toggleShowCurrentPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        type={showNewPassword ? "text" : "password"}
                        label="enter your new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle new password visibility"
                                        onClick={toggleShowNewPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        type={showConfirmPassword ? "text" : "password"}
                        label="verify your new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={toggleShowConfirmPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Button sx={{ backgroundColor: "#8B0000", ":hover": { backgroundColor: "#b84545" } }} variant="contained" color="primary" type="submit">
                            confirm change
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => setConfirmDeleteVisible(true)}>
                            Delete profile
                        </Button>
                    </Box>
                    {confirmDeleteVisible && (
                        <div className="confirm-box">
                            <p>Are you sure you want to delete your profile?</p>
                            <div className="confirm-buttons">
                                <Button onClick={() => setConfirmDeleteVisible(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    color="error"
                                    onClick={async () => {
                                        await handleDeleteClick();
                                        setConfirmDeleteVisible(false);
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
                {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
            </div>
        </div>
    );
}

export default Profile;