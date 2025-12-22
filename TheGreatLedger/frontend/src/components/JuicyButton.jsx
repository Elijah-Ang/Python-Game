import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * JuicyButton: A "game-style" button with bounce/squish interactions.
 */
const JuicyButton = ({
    children,
    onClick,
    variant = 'primary', // 'primary' | 'secondary' | 'danger'
    disabled = false,
    className = ''
}) => {
    const baseStyles = "relative px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-colors overflow-hidden";

    const variants = {
        primary: "bg-gradient-to-b from-green-400 to-green-600 text-white border-4 border-green-700",
        secondary: "bg-gradient-to-b from-amber-400 to-amber-600 text-white border-4 border-amber-700",
        danger: "bg-gradient-to-b from-red-400 to-red-500 text-white border-4 border-red-600",
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={clsx(baseStyles, variants[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
            {/* Inner glow effect */}
            <span className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-full" />
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default JuicyButton;
