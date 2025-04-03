import { useState, useEffect } from 'react';
import styles from '../CSS/myStyles.module.css';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("userName");

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            console.log(`username: ${username}`);
            const response = await fetch(`http://localhost:8000/userAct/user/${username}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            
            // Remove _id and __v from the data
            const { _id, __v, password, ...cleanData } = data;
            setUserData(cleanData);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const validatePassword = (password) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        
        if (!hasMinLength) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (!hasUpperCase || !hasLowerCase) {
            setError('Password must contain at least one uppercase and one lowercase letter');
            return false;
        }
        return true;
    };

    const handlePasswordConfirm = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/verify-password', {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: userData.username,
                    password: passwordConfirm 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password verification failed');
            }

            // If verification successful, show new password input
            setIsVerified(true);
            setShowPasswordModal(true);
            setPasswordConfirm('');
            setError('');
        } catch (error) {
            setError(error.message || 'Failed to verify current password');
            setPasswordConfirm('');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/auth/updatepass', {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    password: newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update password');
            }

            setShowPasswordModal(false);
            setNewPassword('');
            setError('');
            alert('Password updated successfully');
        } catch (error) {
            setError(error.message || 'Failed to update password');
        }
    };

    const renderPasswordModal = () => (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h3>Change Password</h3>
                {!isVerified ? (
                    // First step: Verify current password
                    <form onSubmit={handlePasswordConfirm}>
                        <div className={styles.formGroup}>
                            <label>Current Password:</label>
                            <input
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.submitButton}>
                                Verify Password
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordConfirm('');
                                    setError('');
                                }}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    // Second step: Enter new password
                    <form onSubmit={handlePasswordChange}>
                        <p className={styles.usernameDisplay}>
                            Username: {userData.username}
                        </p>
                        <div className={styles.formGroup}>
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                            <small className={styles.passwordRequirements}>
                                Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter
                            </small>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.submitButton}>
                                Update Password
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword('');
                                    setError('');
                                    setIsVerified(false); // Reset verification state
                                }}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    );

    if (!userData) return <div>Loading...</div>;

    return (
        <div className={styles.profileContainer}>
            <h2>My Profile</h2>
            
            <div className={styles.profileDetails}>
                {Object.entries(userData).map(([key, value]) => (
                    <div key={key} className={styles.profileRow}>
                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                ))}
            </div>

            <div className={styles.profileActions}>
                <button 
                    onClick={() => window.location.href = `/userAct/user?username=${userData.username}`}
                    className={styles.updateButton}
                >
                    Update Profile
                </button>
                
                {!showPasswordModal && (
                    <button 
                        onClick={() => {
                            setShowPasswordModal(true);
                            setIsVerified(false); // Ensure verification state is reset
                        }}
                        className={styles.changePasswordButton}
                    >
                        Change Password
                    </button>
                )}
            </div>

            {(showPasswordModal || passwordConfirm) && renderPasswordModal()}
        </div>
    );
};

export default Profile; 