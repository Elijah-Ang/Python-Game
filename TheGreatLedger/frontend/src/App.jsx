import React, { useEffect, useState } from 'react';
import { getNode, submitAnswer, getMap } from './api/client';
import NodeCard from './components/NodeCard';
import WorldMap from './components/WorldMap';
import GameLayout from './components/GameLayout';
import JuicyButton from './components/JuicyButton';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [view, setView] = useState('map');
  const [mapData, setMapData] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    refreshMap();
  }, []);

  const refreshMap = async () => {
    try {
      const data = await getMap();
      setMapData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enterLevel = async () => {
    setLoading(true);
    try {
      const node = await getNode();
      setCurrentNode(node);
      setView('level');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSubmit = async (payload) => {
    try {
      const result = await submitAnswer(payload);
      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => {
          setFeedback(null);
          refreshMap();
          setView('map');
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: result.message, error: result.error });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFeedback({ type: 'error', message: "Network Error" });
    }
  };

  if (loading && !mapData) {
    return (
      <GameLayout showMascot={false}>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white text-2xl font-bold drop-shadow-lg"
          >
            Loading Adventure...
          </motion.div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout chapterTheme="desert" showMascot={true}>
      {/* Header Bar */}
      <div className="relative z-20 p-4 flex items-center justify-between max-w-4xl mx-auto">
        {view === 'level' ? (
          <button
            onClick={() => setView('map')}
            className="flex items-center gap-2 text-white font-bold bg-black/30 px-4 py-2 rounded-full hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Map
          </button>
        ) : (
          <div className="text-white text-2xl font-bold drop-shadow-lg">
            🗺️ Adventure Map
          </div>
        )}

        <div className="bg-amber-500 text-white font-bold px-4 py-2 rounded-full border-4 border-amber-700 shadow-lg">
          Chapter {(mapData?.current_chapter_idx ?? 0) + 1}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-20 pt-4">
        <AnimatePresence mode="wait">
          {view === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WorldMap mapData={mapData} onNodeSelect={enterLevel} />
            </motion.div>
          )}

          {view === 'level' && currentNode && (
            <motion.div
              key="level"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-8"
            >
              <NodeCard node={currentNode} onSubmit={handleLevelSubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-xl font-bold text-lg text-white z-50 border-4
              ${feedback.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'}
            `}
          >
            {feedback.type === 'success' ? '🎉 ' : '❌ '}{feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
}

export default App;
