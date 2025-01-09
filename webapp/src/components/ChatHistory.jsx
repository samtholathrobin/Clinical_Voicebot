import React from 'react';
import { X, Trash2, Volume2 } from 'lucide-react';

export const ChatHistory = ({
    isOpen,
    onClose,
    messages,
    speakText,
    clearHistory
  }) => (
    isOpen && (
      <div className="fixed inset-y-0 right-0 w-64 bg-gray-800 p-4 shadow-lg transform transition-transform duration-300 ease-in-out z-30">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-white"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">Chat History</h2>
        <div className="space-y-4 mb-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className={`p-2 rounded ${message.type === 'user' ? 'bg-blue-900' : 'bg-gray-700'}`}>
              <p><strong>{message.type === 'user' ? 'Q:' : 'A:'}</strong> {message.content}</p>
              {message.type === 'bot' && (
                <button
                  onClick={() => speakText(message.content)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={clearHistory}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center"
        >
          <Trash2 className="mr-2" /> Clear History
        </button>
      </div>
    )
  );