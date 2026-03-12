import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ isAuthenticated, onLogout }) => {
    const { language, switchLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Core States
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Modal States
    const [showNameModal, setShowNameModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [nameError, setNameError] = useState('');
    const [nameSuccess, setNameSuccess] = useState('');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    // Get user data
    const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const profilePhoto = user?.profilePhoto || null;

    // Click outside listener for the dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global escape key listener for modals
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setShowLogoutConfirm(false);
                setShowNameModal(false);
                setShowPasswordModal(false);
                setShowDeleteConfirm(false);
                setShowProfileSettings(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleBackdropClick = (e) => {
        if (e.target === modalRef.current) {
            setShowLogoutConfirm(false);
            setShowNameModal(false);
            setShowPasswordModal(false);
            setShowDeleteConfirm(false);
            setShowProfileSettings(false);
        }
    };

    // --- API CALLS ---

    const handleLogout = async () => {
        setShowLogoutConfirm(false);
        if (user && user.email) {
            try {
                const token = localStorage.getItem('token');
                await fetch('http://localhost:8080/api/users/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ email: user.email })
                });
            } catch (error) {
                console.error("Failed to update status in database", error);
            }
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        onLogout();
        navigate('/');
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();

        // Validation
        if (!newName || newName.trim() === '') {
            setNameError('Please enter a new name');
            return;
        }

        if (newName.trim() === user.name) {
            setNameError('You are already using this name');
            return;
        }

        if (!user || !user.email) {
            setNameError('User information not found. Please log in again.');
            return;
        }

        setIsUpdatingName(true);
        setNameError('');

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setNameError('Authentication token not found. Please log in again.');
                setIsUpdatingName(false);
                return;
            }

            // Debug: Log what we're sending
            console.log('Updating name for:', user.email, 'New name:', newName);

            const response = await fetch(
                `http://localhost:8080/api/users/update-name?email=${encodeURIComponent(user.email)}&newName=${encodeURIComponent(newName)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Update user in localStorage
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Show success message
                setNameSuccess('Name updated successfully!');
                setNameError('');

                // Close the modal and reset states after a short delay
                setTimeout(() => {
                    setShowNameModal(false);
                    setShowProfileSettings(false);
                    setNewName('');
                    setNameSuccess('');
                }, 1500);
            } else {
                const err = await response.json();
                const errorMessage = err.message || `Failed to update name (Status: ${response.status})`;
                setNameError(errorMessage);
                console.error('Error response:', err);
            }
        } catch (error) {
            console.error('Error updating name:', error);
            setNameError(error.message || 'An error occurred while updating name. Please try again.');
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setIsUpdatingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/users/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email, oldPassword, newPassword })
            });
            if (response.ok) {
                setPasswordSuccess("Password successfully updated!");
                setPasswordError('');

                setTimeout(() => {
                    setShowPasswordModal(false);
                    setOldPassword('');
                    setNewPassword('');
                    setPasswordSuccess('');
                }, 1500);
            } else {
                const err = await response.json();
                setPasswordError(err.message || "Incorrect current password");
            }
        } catch (error) {
            console.error(error);
            setPasswordError("An error occurred. Please try again later.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/users/delete-account?email=${user.email}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Soft delete successful, log them out immediately
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                onLogout();
                navigate('/');
                setShowDeleteConfirm(false);
            } else {
                const err = await response.json();
                alert(err.message || "Failed to delete account");
            }
        } catch (error) {
            console.error(error);
        }
    };


    const getLinkClass = (path) => {
        const baseClasses = "px-3 py-2 rounded-md text-lg font-medium transition-colors";
        const isActive = location.pathname === path;
        const activeClasses = "text-white font-bold";
        const inactiveClasses = "text-gray-300 hover:text-white";
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="shrink-0">
                            <Link to="/" className="text-2xl font-bold bg-linear-to-r from-green-400 to-green-900 bg-clip-text text-transparent tracking-tight cursor-pointer flex items-center gap-2">
                                🌿 GreenTrack
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">

                                {!isAuthenticated ? (
                                    <>
                                        {['/about', '/contact'].includes(location.pathname) && (
                                            <Link to="/" className={getLinkClass('/')}>
                                                {t('home')}
                                            </Link>
                                        )}
                                        <Link to="/about" className={getLinkClass('/about')}>
                                            {t('aboutUs')}
                                        </Link>
                                        <Link to="/contact" className={getLinkClass('/contact')}>
                                            {t('contact')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/about" className={getLinkClass('/about')}>
                                            {t('aboutUs')}
                                        </Link>
                                        <Link to="/contact" className={getLinkClass('/contact')}>
                                            {t('contact')}
                                        </Link>
                                        <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                            {t('myPlants') || 'My Plants'}
                                        </Link>
                                    </>
                                )}

                                <div className="flex items-center ml-4 border-l border-gray-500 pl-4 space-x-2">
                                    <button
                                        onClick={() => switchLanguage('en')}
                                        className={`text-lg font-medium transition-colors duration-200 ${language === 'en' ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}
                                    >
                                        EN
                                    </button>
                                    <span className="text-gray-500">|</span>
                                    <button
                                        onClick={() => switchLanguage('tr')}
                                        className={`text-lg font-medium transition-colors duration-200 ${language === 'tr' ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}
                                    >
                                        TR
                                    </button>
                                </div>

                                {/* Profile Dropdown Menu */}
                                {isAuthenticated && (
                                    <div className="ml-3 relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="block focus:outline-none"
                                        >
                                            {profilePhoto ? (
                                                <img
                                                    src={profilePhoto}
                                                    alt="Profile"
                                                    className="w-9 h-9 rounded-full object-cover border-2 border-green-400/60 hover:border-green-400 transition-all duration-200 hover:scale-110 shadow-lg shadow-green-900/20"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-white/10 border-2 border-green-400/60 hover:border-green-400 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg shadow-green-900/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>

                                        {/* Dropdown Box */}
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-3 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-[fadeInUp_0.15s_ease-out]">
                                                <button
                                                    onClick={() => { setIsDropdownOpen(false); setShowProfileSettings(true); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                                                >
                                                    {t('profileSettings') || 'Profile Settings'}
                                                </button>
                                                <div className="border-t border-white/10 my-1"></div>
                                                <button
                                                    onClick={() => { setIsDropdownOpen(false); setShowDeleteConfirm(true); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                                >
                                                    {t('deleteAccount') || 'Delete Account'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MODALS --- */}

            {/* Profile Settings Modal */}
            {showProfileSettings && (
                <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{t('profileSettings') || 'Profile Settings'}</h3>
                            <button onClick={() => setShowProfileSettings(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">{t('signedInAs') || 'Signed in as'}</p>
                            <p className="text-lg font-bold text-white truncate">{user?.name}</p>
                            <p className="text-sm text-gray-400 truncate mt-1">{user?.email}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => { setShowProfileSettings(false); setShowNameModal(true); setNameError(''); setNewName(''); }}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                            >
                                <span className="font-medium">{t('changeName') || 'Change Name'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </button>

                            <button
                                onClick={() => { setShowProfileSettings(false); setShowPasswordModal(true); }}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                            >
                                <span className="font-medium">{t('changePassword') || 'Change Password'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </button>

                            <button
                                onClick={() => { setShowProfileSettings(false); setShowLogoutConfirm(true); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl transition-all font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {t('logout') || 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Name Modal */}
            {showNameModal && (
                <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">{t('changeName') || 'Change Name'}</h3>

                        {nameError && (
                            <div className="mb-4 w-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold px-4 py-3 rounded-lg">
                                {nameError}
                            </div>
                        )}

                        {nameSuccess && (
                            <div className="mb-4 w-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-3 rounded-lg flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {nameSuccess}
                            </div>
                        )}

                        <form onSubmit={handleUpdateName} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">New Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    disabled={isUpdatingName || !!nameSuccess}
                                    autoFocus
                                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-green-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your new name"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowNameModal(false); setShowProfileSettings(true); setNameError(''); setNameSuccess(''); setNewName(''); }}
                                    disabled={isUpdatingName || !!nameSuccess}
                                    className="flex-1 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingName || !!nameSuccess}
                                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUpdatingName ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">{t('changePassword') || 'Change Password'}</h3>

                        {passwordError && (
                            <div className="mb-4 w-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold px-4 py-3 rounded-lg">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mb-4 w-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-3 rounded-lg flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                                    disabled={isUpdatingPassword || !!passwordSuccess}
                                    autoFocus
                                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-green-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isUpdatingPassword || !!passwordSuccess}
                                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-green-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowPasswordModal(false); setShowProfileSettings(true); setPasswordError(''); setPasswordSuccess(''); }} disabled={isUpdatingPassword || !!passwordSuccess} className="flex-1 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                                <button type="submit" disabled={isUpdatingPassword || !!passwordSuccess} className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isUpdatingPassword ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm mx-4 bg-gray-900 border border-red-500/30 rounded-2xl shadow-2xl p-8 text-white text-center">
                        <div className="mx-auto mb-4 w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Delete Account?</h3>
                        <p className="text-sm text-gray-400 mb-6">Are you absolutely sure? This action will deactivate your account and you will be logged out.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/10">Cancel</button>
                            <button onClick={handleDeleteAccount} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/30">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Original Logout Modal */}
            {showLogoutConfirm && (
                <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">{t('logoutConfirmTitle') || 'Log Out?'}</h3>
                        <p className="text-sm text-gray-300 text-center mb-6">{t('logoutConfirmMessage') || 'Are you sure you want to log out?'}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/10">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-900/30">Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;