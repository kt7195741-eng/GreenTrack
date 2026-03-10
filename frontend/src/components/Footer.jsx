import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-emerald-950 py-8 border-t border-green-900/30">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">

                {/* Left Side: Logo & Text */}
                <div className="mb-6 md:mb-0 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="text-2xl">🌿</span>
                        <span className="text-2xl font-bold bg-linear-to-r from-green-400 to-green-900 bg-clip-text text-transparent">
                            GreenTrack
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm max-w-md">
                        {t('mission')}
                    </p>
                    <p className="text-xs text-gray-600 mt-4">
                        {t('copyright')}
                    </p>
                </div>

                {/* Right Side: Horizontal Links */}
                <div className="flex flex-wrap justify-center gap-8">

                    <Link to="/about" className="text-lg text-gray-300 hover:text-white transition-colors duration-200">
                        {t('aboutUs')}
                    </Link>
                    <Link to="/contact" className="text-lg text-gray-300 hover:text-white transition-colors duration-200">
                        {t('contact')}
                    </Link>

                </div>

            </div>
        </footer>
    );
};

export default Footer;