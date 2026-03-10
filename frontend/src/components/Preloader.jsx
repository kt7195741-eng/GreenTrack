import React, { useEffect, useState } from 'react';

const Preloader = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isSliding, setIsSliding] = useState(false);

    useEffect(() => {
        // Wait 1.5 seconds before starting the slide-up animation
        const timerCallback = setTimeout(() => {
            setIsSliding(true);

            // Wait another 1 second (matching the transition duration) before unmounting
            const removeTimer = setTimeout(() => {
                setIsVisible(false);
            }, 1000);

            return () => clearTimeout(removeTimer);
        }, 1500);

        return () => clearTimeout(timerCallback);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-100 grid place-items-center bg-[#0f2015] transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${isSliding ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-green-400 to-green-800 bg-clip-text text-transparent animate-pulse tracking-tight">
                    GreenTrack 🌿
                </h1>
            </div>
        </div>
    );
};

export default Preloader;
