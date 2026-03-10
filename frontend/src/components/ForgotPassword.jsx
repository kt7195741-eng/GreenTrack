import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        // After showing the confirmation briefly, navigate to the verify-code page
        setTimeout(() => {
          navigate('/verify-code', { state: { email } });
        }, 1500);
      } else {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || 'Something went wrong.');
        } catch {
          setError(text || 'Something went wrong.');
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
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              {t('reset_password_title')}
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              {t('reset_password_subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
              {error}
            </div>
          )}

          {!submitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder={t('email_address_label')}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    t('send_reset_link_btn')
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 text-center bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-200">{t('check_email_title')}</h3>
              <p className="mt-2 text-sm text-green-100">
                {t('check_email_desc')}
              </p>
            </div>
          )}

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

export default ForgotPassword;
