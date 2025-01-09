import React from 'react';
import { Loader, VolumeX } from 'lucide-react';
import { SuggestedPrompts } from './SuggestedPrompts';

export const ChatDisplay = ({ 
  currentQuestion, 
  currentAnswer, 
  isLoading, 
  isRemoving,
  isSpeaking,
  stopSpeaking,
  setInput
}) => (
  <div className={`w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg mb-8 transition-opacity duration-500 ${isRemoving ? 'opacity-0' : 'opacity-100'}`}>
    {currentQuestion ? (
      <>
        <p className="font-bold mb-4">Q: {currentQuestion}</p>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin mr-2" />
            <p>Generating response...</p>
          </div>
        ) : (
          <>
            <p>A: {currentAnswer}</p>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <VolumeX size={16} />
              </button>
            )}
          </>
        )}
      </>
    ) : (
      <SuggestedPrompts onSelectPrompt={setInput} />
    )}
  </div>
);