import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Signup = ({ onLogin }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(''); // base64 string
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(t('photoTooLarge') || 'Photo must be under 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result); // data:image/...;base64,...
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('error_passwords_not_match'));
      return;
    }

    try {
      const response = await fetch('https://greentrack-i2d7.onrender.com/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          profilePhoto: profilePhoto || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token and user data so profile photo is available in Navbar
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Fallback: store basic user data from form
          localStorage.setItem('user', JSON.stringify({ name, email, profilePhoto: profilePhoto || null }));
        }

        setSuccess(true);
        onLogin();

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          const msg = errorJson.message || errorText;
          // Map known backend messages to translation keys
          const errorMap = {
            'This email is already registered!': t('error_email_registered'),
          };
          setError(errorMap[msg] || msg);
        } catch {
          const errorMap = {
            'This email is already registered!': t('error_email_registered'),
          };
          setError(errorMap[errorText] || errorText);
        }
      }
    } catch (err) {
      setError(t('error_server_connection'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden transition-all duration-500 ease-in-out">

        {success ? (
          // SUCCESS STATE UI
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center">
            <div className="rounded-full bg-green-500/20 p-4 mb-4">
              <svg className="w-16 h-16 text-green-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('registration_success_title')}</h2>
            <p className="text-gray-300">{t('redirecting_to_dashboard')}</p>
            <div className="mt-6 w-full bg-gray-700 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
              <div className="bg-green-500 h-1.5 rounded-full animate-[width_2s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
            </div>
            <style>{`
               @keyframes width {
                 0% { width: 0%; }
                 100% { width: 100%; }
               }
             `}</style>
          </div>
        ) : (
          // NORMAL FORM UI
          <>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  {t('create_account_title')}
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  {t('join_today')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                <div className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center mb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-500 hover:border-green-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-gray-400 group-hover:text-green-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <span className="text-xs text-gray-400 mt-2">{t('uploadPhoto') || 'Upload Photo'}</span>
                  </div>

                  <div>
                    <label htmlFor="full-name" className="sr-only">Full Name</label>
                    <input
                      id="full-name"
                      name="name"
                      type="text"
                      required
                      value={name} // ADDED: Connects to state
                      onChange={(e) => setName(e.target.value)} // ADDED: Updates state as you type
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder={t('full_name_placeholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      value={email} // ADDED
                      onChange={(e) => setEmail(e.target.value)} // ADDED
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder={t('email_address_label')}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password} // ADDED
                      onChange={(e) => setPassword(e.target.value)} // ADDED
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder={t('password_placeholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer z-20 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword} // ADDED
                      onChange={(e) => setConfirmPassword(e.target.value)} // ADDED
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 bg-white/5 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder={t('confirm_password_placeholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer z-20 focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t('create_account_btn')}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-300">
                    {t('already_have_account')}{' '}
                    <Link to="/login" className="font-medium text-green-400 hover:text-green-300 transition-colors">
                      {t('sign_in_link')}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;