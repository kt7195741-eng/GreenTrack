import React, { useState, useEffect } from 'react';

const images = [
    '/images/image.png',
    '/images/image copy 2.png',
    '/images/image copy 3.png',
    '/images/image copy 4.png',
    '/images/image copy 5.png',
    '/images/image copy 6.png',
    '/images/image copy 7.png',
    '/images/image copy 8.png',
    '/images/image copy 9.png',
    '/images/image copy 10.png',
    '/images/image copy 11.png',
    '/images/image copy 12.png',
    '/images/image copy 13.png',
    '/images/image copy 14.png',
    '/images/image copy 15.png',
    '/images/image copy 16.png',
];

const CinematicSlideshow = ({ duration = 6000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
                setNextIndex((prev) => (prev + 1) % images.length);
                setIsTransitioning(false);
            }, 1000); // 1s transition duration
        }, duration);

        return () => clearInterval(interval);
    }, [duration]);

    // Preload images
    useEffect(() => {
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            {images.map((img, index) => {
                const isActive = index === currentIndex;
                const isNext = index === nextIndex;

                // Only render current and next to save resources, or render all if needed for smoother z-index transitions
                // Render all but control opacity is safer for "video-like" smoothness
                if (!isActive && !isNext) return null;

                return (
                    <div
                        key={img}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        style={{
                            zIndex: isActive ? 10 : isNext ? 5 : 0
                        }}
                    >
                        {/* Scale Container for Ken Burns Effect */}
                        {/* We alternate animations based on index to create variety (zoom in vs zoom out) */}
                        <div
                            className={`w-full h-full bg-cover bg-center absolute inset-0 
                            ${isActive ? (index % 2 === 0 ? 'animate-ken-burns-in' : 'animate-ken-burns-out') : ''}`}
                            style={{
                                backgroundImage: `url('${encodeURI(img)}')`
                            }}
                        />
                    </div>
                );
            })}

            <style jsx>{`
                @keyframes ken-burns-in {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.15); }
                }
                @keyframes ken-burns-out {
                    0% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .animate-ken-burns-in {
                    animation: ken-burns-in ${duration + 1000}ms ease-out forwards;
                }
                .animate-ken-burns-out {
                    animation: ken-burns-out ${duration + 1000}ms ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CinematicSlideshow;
