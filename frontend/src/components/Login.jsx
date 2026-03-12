import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Login = ({ onLogin }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // ADDED STATE: To store user input and server errors
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UPDATED LOGIC: Connects to the Spring Boot Login Endpoint
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            if (response.ok) {
                // Success! The database confirmed the user exists and the password matches.
                const userData = await response.json();

                // Store token and user in localStorage so logout and other features can use them
                localStorage.setItem('token', userData.token);
                localStorage.setItem('user', JSON.stringify(userData.user));

                onLogin(); // Update your React app's global auth state
                navigate('/dashboard');
            } else {
                // Failure! The backend returned a 400 Bad Request (wrong password or email not found)
                const errorText = await response.text();
                try {
                    const json = JSON.parse(errorText);
                    setError(json.message || errorText);
                } catch {
                    setError(errorText);
                }
            }
        } catch (err) {
            setError("Could not connect to the server. Is Spring Boot running?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent text-white pt-20">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">

                <h2 className="text-3xl font-bold text-center mb-2">{t('welcome_back')}</h2>
                <p className="text-center text-gray-300 mb-6">{t('sign_in_subtitle')}</p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">{t('email_address_label')}</label>
                        <input
                            type="email"
                            required
                            value={email} // ADDED: Connects to state
                            onChange={(e) => setEmail(e.target.value)} // ADDED: Updates state as you type
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">{t('password_label')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password} // ADDED
                                onChange={(e) => setPassword(e.target.value)} // ADDED
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-600 bg-white/10 text-green-500 focus:ring-green-500" />
                            <span className="text-gray-300">{t('remember_me')}</span>
                        </label>
                        <Link to="/forgot-password" className="text-green-400 hover:text-green-300 transition-colors">
                            {t('forgot_password')}
                        </Link>
                    </div>

                    <button type="submit" className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold transition-all shadow-lg shadow-green-900/50">
                        {t('sign_in_btn')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">{t('no_account')} </span>
                    <Link to="/signup" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                        {t('sign_up')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;