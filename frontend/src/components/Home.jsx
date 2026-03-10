import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const videos = [
    "https://assets.codepen.io/6093409/river.mp4",
    "https://vjs.zencdn.net/v/oceans.mp4"
];

const Home = ({ isAuthenticated }) => {
    const { t } = useLanguage();
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);

    // Placeholder top 3 savers — will come from backend later
    const topSavers = [
        { name: 'Khaled Tarek', carbonSaved: 78.3, profilePhoto: '/khaled.jpg' },
        { name: 'Youssef Adel', carbonSaved: 42.5, profilePhoto: '/youssef.jpg' },
        { name: 'Mahmoud Attia', carbonSaved: 31.2, profilePhoto: '/mahmoud.png' },
    ];
    const defaultAvatar = '/default-avatar.png';

    const handleVideoEnded = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load(); // Force reload for new source
            videoRef.current.play().catch(error => console.error("Video play error:", error));
        }
    }, [currentVideoIndex]);

    return (
        <div className="flex flex-col">

            {/* Section 1: The Full-Screen Hero (Video Only) */}
            <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
                {/* Video */}
                <video
                    ref={videoRef}
                    key={videos[currentVideoIndex]}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                    src={videos[currentVideoIndex]}
                />

                {/* Light Overlay to ensure it looks separated/cinematic */}
                <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce text-white/70">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            {/* Section 2: Welcome Text & Login (With Previous Plant Background) */}
            <div className="relative w-full py-32 flex flex-col items-center justify-center text-center overflow-hidden">

                {/* Background Image */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
                    style={{
                        backgroundImage: "url('/plant_background.png')",
                    }}
                ></div>

                {/* Gradient Overlay for Smooth Transition */}
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-emerald-950/80 to-emerald-950 z-0"></div>

                {/* Content */}
                <div className="relative z-10 px-4 max-w-5xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight drop-shadow-lg">
                        {t('welcome_title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                        {t('welcome_subtitle')}
                    </p>
                    <div className="flex justify-center gap-6">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-10 py-4 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-green-500/30"
                            >
                                {t('myPlants') || 'My Plants'}
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="px-10 py-4 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-green-500/30"
                            >
                                {t('login_btn')}
                            </Link>
                        )}
                        <Link
                            to="/about"
                            className="px-10 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-xl border border-white/40 hover:bg-white/20 transition-all shadow-xl"
                        >
                            {t('learn_more_btn')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section 3: Top Carbon Savers Leaderboard */}
            <div className="w-full bg-emerald-950 py-24 relative z-20 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-4xl mb-4">🏆</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            {t('topSaversTitle')}
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            {t('topSaversSubtitle')}
                        </p>
                    </div>

                    {/* Podium Layout — 2nd, 1st, 3rd */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto">

                        {/* 2nd Place — Silver */}
                        <div className="order-2 md:order-1 w-full md:w-1/3 group">
                            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-gray-400/10 hover:scale-105 text-center h-full">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-800 font-bold text-lg shadow-lg">
                                    2
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-300/20 flex items-center justify-center mb-3 overflow-hidden">
                                        <img src={topSavers[1].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[1].name}`} alt={topSavers[1].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors">{topSavers[1].name}</h3>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-300 mb-1">{topSavers[1].carbonSaved}</div>
                                <div className="text-sm text-gray-500">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                        {/* 1st Place — Gold (Tallest) */}
                        <div className="order-1 md:order-2 w-full md:w-1/3 group">
                            <div className="relative p-8 rounded-2xl bg-linear-to-b from-yellow-500/10 to-white/5 border border-yellow-500/30 backdrop-blur-sm transition-all duration-300 hover:from-yellow-500/20 hover:to-white/10 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 text-center h-full">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl shadow-lg shadow-yellow-500/40">
                                    1
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center mb-3 ring-2 ring-yellow-400/30 overflow-hidden">
                                        <img src={topSavers[0].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[0].name}`} alt={topSavers[0].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-100 transition-colors">{topSavers[0].name}</h3>
                                </div>
                                <div className="text-4xl font-extrabold bg-linear-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-1">{topSavers[0].carbonSaved}</div>
                                <div className="text-sm text-gray-400">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                        {/* 3rd Place — Bronze */}
                        <div className="order-3 w-full md:w-1/3 group">
                            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-orange-400/10 hover:scale-105 text-center h-full">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-orange-900 font-bold text-lg shadow-lg">
                                    3
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-400/20 flex items-center justify-center mb-3 overflow-hidden">
                                        <img src={topSavers[2].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[2].name}`} alt={topSavers[2].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors">{topSavers[2].name}</h3>
                                </div>
                                <div className="text-3xl font-extrabold text-orange-300 mb-1">{topSavers[2].carbonSaved}</div>
                                <div className="text-sm text-gray-500">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Section 4: Features Section */}
            <div className="w-full bg-emerald-950 py-24 relative z-20 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer group h-full">
                            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                                <span className="text-3xl">🌱</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-green-100 group-hover:text-green-50 transition-colors">{t('plant_tracking_title')}</h3>
                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-lg leading-relaxed">{t('plant_tracking_desc')}</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer group h-full">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                                <span className="text-3xl">☁️</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-blue-100 group-hover:text-blue-50 transition-colors">{t('carbon_impact_title')}</h3>
                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-lg leading-relaxed">{t('carbon_impact_desc')}</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:bg-white/10 hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer group h-full">
                            <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/30 transition-colors">
                                <span className="text-3xl">🏆</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-yellow-100 group-hover:text-yellow-50 transition-colors">{t('global_ranking_title')}</h3>
                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-lg leading-relaxed">{t('global_ranking_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
