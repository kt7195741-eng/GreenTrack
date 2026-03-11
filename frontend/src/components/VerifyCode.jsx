import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const VerifyCode = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password', { replace: true });
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move back on Backspace when field is empty
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || '';
        }
        setCode(newCode);

        // Focus the last filled input or the next empty one
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');

        if (fullCode.length < 6) {
            setError(t('verify_code_incomplete') || 'Please enter all 6 digits.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://greentrack-i2d7.onrender.com/api/users/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: fullCode }),
            });

            if (response.ok) {
                navigate('/new-password', { state: { email, code: fullCode } });
            } else {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    setError(json.message || 'Invalid code !');
                } catch {
                    setError(text || 'Invalid code !');
                }
            }
        } catch (err) {
            setError("Could not connect to the server. Is Spring Boot running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden transition-all duration-500 ease-in-out">

                <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-white">
                            {t('verify_code_title')}
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                            {t('verify_code_subtitle')}
                        </p>
                        {email && (
                            <p className="mt-1 text-sm text-green-300 font-medium">{email}</p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
                            {error}
                        </div>
                    )}

                    {/* Code Input */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 caret-green-400"
                                    autoFocus={index === 0}
                                />
                            ))}
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
                                    t('verify_btn')
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
            </div>
        </div>
    );
};

export default VerifyCode;
