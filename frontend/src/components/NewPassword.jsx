import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NewPassword = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const code = location.state?.code || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Redirect if no email/code in state
    useEffect(() => {
        if (!email || !code) {
            navigate('/forgot-password', { replace: true });
        }
    }, [email, code, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwords_do_not_match') || 'Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            setError(t('password_too_short') || 'Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword: password }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2500);
            } else {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    setError(json.message || 'Failed to reset password.');
                } catch {
                    setError(text || 'Failed to reset password.');
                }
            }
        } catch (err) {
            setError("Could not connect to the server. Is Spring Boot running?");
        } finally {
            setLoading(false);
        }
    };

    // Eye icon for show/hide toggle
    const EyeIcon = ({ visible }) => (
        visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden transition-all duration-500 ease-in-out">

                {success ? (
                    /* ── Success State ── */
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="rounded-full bg-green-500/20 p-4 mb-4">
                            <svg className="w-16 h-16 text-green-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t('password_reset_success')}</h2>
                        <p className="text-gray-300">{t('redirecting_to_login')}</p>
                        <div className="mt-6 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-green-500 h-1.5 rounded-full animate-[progressBar_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
                        </div>
                        <style>{`
              @keyframes progressBar {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
                    </div>
                ) : (
                    /* ── Form State ── */
                    <div className="relative z-10">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-white">
                                {t('new_password_title')}
                            </h2>
                            <p className="mt-2 text-sm text-gray-300">
                                {t('new_password_subtitle')}
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
                                {error}
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* New Password */}
                                <div className="relative">
                                    <label htmlFor="new-password" className="sr-only">New Password</label>
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                        placeholder={t('new_password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer z-20 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <EyeIcon visible={showPassword} />
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <label htmlFor="confirm-new-password" className="sr-only">Confirm Password</label>
                                    <input
                                        id="confirm-new-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                        placeholder={t('confirm_password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer z-20 focus:outline-none"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <EyeIcon visible={showConfirmPassword} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        t('reset_password_btn')
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Back to Login */}
                        <div className="text-center mt-4">
                            <Link to="/login" className="font-medium text-green-400 hover:text-green-300 transition-colors flex items-center justify-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t('back_to_login')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewPassword;
