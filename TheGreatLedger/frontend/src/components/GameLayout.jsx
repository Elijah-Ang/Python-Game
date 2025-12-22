import React from 'react';
import { motion } from 'framer-motion';
import desertBg from '../assets/desert_bg.png';
import pyMascot from '../assets/py_mascot.png';

/**
 * GameLayout: Full-screen immersive game container.
 * - Background layer: The world (Desert, Forest, etc.)
 * - Character layer: Py the mascot
 * - Content layer: Children (UI panels, boards, etc.)
 */
const GameLayout = ({ children, chapterTheme = 'desert', showMascot = true }) => {
    const backgroundImage = chapterTheme === 'desert' ? desertBg : desertBg;

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Layer 0: World Background */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0,
                }}
            />

            {/* Soft overlay for readability */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 1 }} />

            {/* Layer 1: Character (Py) */}
            {showMascot && (
                <motion.img
                    src={pyMascot}
                    alt="Py the Python"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                    style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        width: '100px',
                        height: '100px',
                        zIndex: 20,
                        pointerEvents: 'none',
                        borderRadius: '50%',
                        border: '4px solid #8B4513',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
                        objectFit: 'cover',
                    }}
                />
            )}

            {/* Layer 2: Content */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
                {children}
            </div>
        </div>
    );
};

export default GameLayout;

