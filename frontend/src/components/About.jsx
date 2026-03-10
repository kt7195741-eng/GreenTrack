import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen text-white pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-8 text-center">{t('about_title')}</h1>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl transition-all duration-500 hover:bg-white/15 hover:shadow-[0_0_40px_rgba(74,222,128,0.2)] hover:-translate-y-2 hover:border-green-400/30 group">
                    <p className="text-lg text-gray-300 leading-relaxed mb-6 group-hover:text-white transition-colors duration-300">
                        {t('about_mission')}
                    </p>
                    <p className="text-lg text-gray-300 leading-relaxed mb-6 group-hover:text-white transition-colors duration-300">
                        {t('about_vision_desc')}
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-green-300 group-hover:text-green-200 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] transition-all duration-300">{t('our_vision_title')}</h2>
                    <p className="text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                        {t('our_vision_statement')}
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-900/40 p-6 rounded-xl border border-green-800/50 transition-all duration-500 hover:-translate-y-2 hover:bg-green-800/60 hover:shadow-[0_0_30px_rgba(74,222,128,0.2)] hover:border-green-500/40 cursor-pointer group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-400/30 group-hover:scale-110 transition-all duration-300">
                            <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-green-200 group-hover:text-green-100 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.3)] transition-all duration-300">{t('sustainability_first')}</h3>
                        <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300">{t('sustainability_desc')}</p>
                    </div>
                    <div className="bg-green-900/40 p-6 rounded-xl border border-green-800/50 transition-all duration-500 hover:-translate-y-2 hover:bg-green-800/60 hover:shadow-[0_0_30px_rgba(74,222,128,0.2)] hover:border-green-500/40 cursor-pointer group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-400/30 group-hover:scale-110 transition-all duration-300">
                            <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-green-200 group-hover:text-green-100 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.3)] transition-all duration-300">{t('community_driven')}</h3>
                        <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300">{t('community_desc')}</p>
                    </div>
                </div>

                {/* Designers Section */}
                <h2 className="text-3xl font-bold mt-16 mb-8 text-center text-green-300">{t('meet_designers')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {/* Designer 1 (Muhammed - Advisor) */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center hover:bg-white/10 transition-colors group">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-cyan-500 shadow-lg shadow-cyan-900/50 group-hover:scale-105 transition-transform duration-300">
                            <img
                                src="/images/muhammed.png"
                                alt="Muhammed Şerif"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Muhammed Şerif</h3>
                        <p className="text-cyan-300 text-sm font-medium mb-4">{t('advisor')}</p>
                        <div className="flex space-x-4">
                            <a href="http://heentechnology.co.uk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 01 9-9" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/m-serif-yilmaz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Designer 2 (Khaled) */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center hover:bg-white/10 transition-colors group">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-emerald-500 shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform duration-300">
                            <img
                                src="/images/Khaled.jpeg"
                                alt="Khaled Tarek Elreweny"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Khaled Tarek Elreweny</h3>
                        <p className="text-emerald-300 text-sm font-medium mb-4">{t('creative_director')}</p>
                        <div className="flex space-x-4">
                            <a href="mailto:kt7195741@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/khaled-tarek-93041b263" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Designer 3 (Yusuf) */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center hover:bg-white/10 transition-colors group">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-green-500 shadow-lg shadow-green-900/50 group-hover:scale-105 transition-transform duration-300">
                            <img
                                src="/images/Yusuf.jpeg"
                                alt="M. Yusuf Karadoğan"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">M. Yusuf Karadoğan</h3>
                        <p className="text-green-300 text-sm font-medium mb-4">{t('lead_designer')}</p>
                        <div className="flex space-x-4">
                            <a href="mailto:mmyykk1998@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/myusuf-karadogan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
