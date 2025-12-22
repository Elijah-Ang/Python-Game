import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Star } from 'lucide-react';
import { clsx } from 'clsx';

const WorldMap = ({ mapData, onNodeSelect }) => {
    if (!mapData) return null;

    return (
        <div className="w-full max-w-md mx-auto py-8 space-y-12">
            {mapData.chapters?.map((chapter, cIdx) => (
                <div key={cIdx} className="relative">
                    {/* Chapter Banner */}
                    <div className="text-center mb-6">
                        <span className="inline-block bg-gradient-to-b from-amber-400 to-amber-600 text-white font-bold px-6 py-2 rounded-full shadow-lg border-4 border-amber-700 uppercase text-sm tracking-wider">
                            {chapter.title}
                        </span>
                    </div>

                    {/* Nodes Path */}
                    <div className="relative flex flex-col items-center space-y-6">
                        {/* Connecting line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-amber-700/50 -translate-x-1/2 rounded-full -z-10" />

                        {chapter.zones.map((zone, zIdx) => (
                            <div key={zIdx} className="flex flex-col items-center space-y-6 w-full">
                                {zone.nodes.map((node, nIdx) => {
                                    const isLocked = node.status === 'locked';
                                    const isCompleted = node.status === 'completed';
                                    const isUnlocked = node.status === 'unlocked';

                                    // Alternate left/right for visual interest
                                    const offset = (nIdx % 2 === 0) ? '-translate-x-8' : 'translate-x-8';

                                    return (
                                        <motion.div
                                            key={nIdx}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: nIdx * 0.1, type: 'spring' }}
                                            className={`relative ${offset}`}
                                        >
                                            <motion.button
                                                onClick={() => !isLocked && onNodeSelect()}
                                                disabled={isLocked}
                                                whileHover={!isLocked ? { scale: 1.15 } : {}}
                                                whileTap={!isLocked ? { scale: 0.95 } : {}}
                                                className={clsx(
                                                    "relative w-20 h-20 rounded-full flex items-center justify-center border-8 transition-all shadow-xl",
                                                    isCompleted && "bg-gradient-to-b from-green-400 to-green-600 border-green-700",
                                                    isUnlocked && "bg-gradient-to-b from-amber-400 to-amber-500 border-amber-600 animate-pulse",
                                                    isLocked && "bg-gray-400 border-gray-500 opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                {isCompleted && <Check className="text-white w-10 h-10 drop-shadow" />}
                                                {isLocked && <Lock className="text-gray-600 w-8 h-8" />}
                                                {isUnlocked && <Star className="text-white w-10 h-10 fill-current drop-shadow" />}
                                            </motion.button>

                                            {/* Label Bubble */}
                                            <div className={clsx(
                                                "absolute top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-md text-sm font-bold text-amber-900 whitespace-nowrap",
                                                (nIdx % 2 === 0) ? 'left-full ml-3' : 'right-full mr-3'
                                            )}>
                                                {node.title}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Footer Teaser */}
            <div className="text-center text-white/80 font-medium pt-8">
                ✨ More adventures coming soon...
            </div>
        </div>
    );
};

export default WorldMap;
