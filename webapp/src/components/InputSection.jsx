import React from 'react';
import { Mic, Send, Loader } from 'lucide-react';

export const InputSection = ({
    input,
    setInput,
    isListening,
    isLoading,
    isRemoving,
    handleSend,
    handleVoiceInput
  }) => (
    <div className="p-4 bg-gray-800 relative z-10">
      <div className="flex items-center justify-center mb-4">
        <button
          className={`w-16 h-16 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-blue-500'} hover:opacity-80 transition`}
          onClick={handleVoiceInput}
        >
          <Mic size={32} />
        </button>
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your question here..."}
          className="flex-grow mr-2 px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly={isListening}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || isRemoving || isListening || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isLoading ? <Loader className="animate-spin" /> : <Send />}
        </button>
      </div>
    </div>
  );