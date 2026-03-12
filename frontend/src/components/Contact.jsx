import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // State variables to hold what the user types
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        // THE MAGIC: Grab the currently logged-in user's email from memory
        const userString = localStorage.getItem('user');
        let userEmail = "unknown@guest.com";

        if (userString) {
            const currentUser = JSON.parse(userString);
            if (currentUser && currentUser.email) {
                userEmail = currentUser.email;
            }
        }

        // Bundle everything up for Spring Boot
        const payload = {
            name: name,
            email: userEmail,
            subject: subject,
            message: message
        };

        try {
            // 1. Grab the token from memory
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/users/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- 2. The token is now attached!
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitted(true);
                setName('');
                setSubject('');
                setMessage('');
            } else {
                alert("Failed to send the message. Please ensure the backend is running.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("A network error occurred. Please check your connection.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen text-white pt-24 pb-12 flex flex-col items-center">
            <div className="max-w-2xl w-full px-6">
                <h1 className="text-4xl font-bold mb-2 text-center">{t('contact_title')}</h1>
                <p className="text-gray-400 text-center mb-8">{t('contact_subtitle')}</p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('name_label')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:outline-none text-white focus:bg-black/40 transition-colors"
                                    placeholder={t('name_placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('subject_label')}</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:outline-none text-white focus:bg-black/40 transition-colors"
                                    placeholder={t('subject_placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('message_label')}</label>
                                <textarea
                                    rows="4"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:outline-none text-white focus:bg-black/40 transition-colors"
                                    placeholder={t('message_placeholder')}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full py-3 px-6 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-lg shadow-green-900/30 flex justify-center items-center"
                            >
                                {isSending ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                ) : (
                                    t('send_message_btn')
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{t('message_sent_title')}</h3>
                            <p className="text-gray-300">{t('message_sent_desc')}</p>
                            <button onClick={() => setSubmitted(false)} className="mt-6 text-green-400 hover:text-green-300 font-medium">
                                {t('send_another_btn')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;