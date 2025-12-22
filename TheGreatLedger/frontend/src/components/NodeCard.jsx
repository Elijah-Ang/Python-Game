import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import WoodBoard from './WoodBoard';
import JuicyButton from './JuicyButton';
import { BookOpen, HelpCircle, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

const NodeCard = ({ node, onSubmit }) => {
    const [quizSelection, setQuizSelection] = useState(null);
    const [code, setCode] = useState("# Write your code here\n");

    const handleSubmit = () => {
        if (node.type === 'lesson') {
            onSubmit({});
        } else if (node.type === 'quiz') {
            if (quizSelection === null) return;
            onSubmit({ quiz_index: quizSelection });
        } else if (node.type === 'challenge') {
            onSubmit({ code });
        }
    };

    const getIcon = () => {
        const iconClass = "w-8 h-8";
        switch (node.type) {
            case 'lesson': return <BookOpen className={`${iconClass} text-amber-600`} />;
            case 'quiz': return <HelpCircle className={`${iconClass} text-teal-500`} />;
            case 'challenge': return <Terminal className={`${iconClass} text-green-600`} />;
            default: return null;
        }
    };

    const getButtonText = () => {
        switch (node.type) {
            case 'lesson': return "Let's Go! ▸";
            case 'quiz': return "Check Answer!";
            case 'challenge': return "Run Code ⚡";
            default: return "Submit";
        }
    };

    return (
        <WoodBoard title={node.title}>
            {/* Icon + Title Row */}
            <div className="flex items-center gap-3 mb-4 pt-4">
                {getIcon()}
                <span className="text-lg font-bold text-amber-900 capitalize">{node.type}</span>
            </div>

            {/* Content */}
            <div className="text-amber-800 text-base leading-relaxed whitespace-pre-line mb-6 bg-white/50 p-4 rounded-xl border-2 border-amber-200">
                {node.type === 'lesson' && node.content}
                {node.type === 'quiz' && node.question}
                {node.type === 'challenge' && node.description}
            </div>

            {/* Quiz Options */}
            {node.type === 'quiz' && (
                <div className="space-y-3 mb-6">
                    {node.options.map((opt, idx) => (
                        <motion.div
                            key={idx}
                            onClick={() => setQuizSelection(idx)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={clsx(
                                "p-4 rounded-xl border-4 cursor-pointer transition-all font-medium text-amber-900",
                                quizSelection === idx
                                    ? "border-green-500 bg-green-100 shadow-lg"
                                    : "border-amber-300 bg-amber-50 hover:border-amber-400"
                            )}
                        >
                            {opt}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Code Challenge Editor */}
            {node.type === 'challenge' && (
                <div className="mb-6 border-4 border-gray-700 rounded-xl overflow-hidden shadow-inner">
                    <Editor
                        height="180px"
                        defaultLanguage="python"
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            padding: { top: 8 }
                        }}
                    />
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
                <JuicyButton
                    onClick={handleSubmit}
                    variant={node.type === 'challenge' ? 'primary' : 'secondary'}
                >
                    {getButtonText()}
                </JuicyButton>
            </div>
        </WoodBoard>
    );
};

export default NodeCard;
