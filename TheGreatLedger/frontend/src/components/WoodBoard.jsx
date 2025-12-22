import React from 'react';
import { motion } from 'framer-motion';

/**
 * WoodBoard: A game-style "signpost" container for content.
 * Styled like a wooden/paper board from Best Fiends.
 */
const WoodBoard = ({ children, title, className = '' }) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`relative bg-amber-50 border-8 border-amber-700 rounded-3xl shadow-2xl p-6 max-w-lg w-full mx-auto ${className}`}
            style={{
                // Subtle inner shadow for depth
                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.3)'
            }}
        >
            {/* Decorative corner screws */}
            <div className="absolute top-3 left-3 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-900" />
            <div className="absolute top-3 right-3 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-900" />
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-900" />
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-900" />

            {/* Title Banner */}
            {title && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-red-500 to-red-700 text-white font-bold px-6 py-2 rounded-lg shadow-md border-4 border-red-800">
                    {title}
                </div>
            )}

            {/* Content */}
            <div className="mt-4">
                {children}
            </div>
        </motion.div>
    );
};

export default WoodBoard;
