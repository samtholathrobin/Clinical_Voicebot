import React from 'react';

export const SuggestedPrompts = ({ onSelectPrompt }) => (
    <div className="text-center">
      <h2 className="text-xl mb-4">Suggested prompts:</h2>
      {[
        "Tell me about depression in teenagers",
        "How to do skin assessment?",
        "Tell me about depression in teenagers"
      ].map((prompt, index) => (
        <button 
          key={index} 
          className="m-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );