import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, History, X, Trash2, VolumeX, Volume2, Loader } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognition = useRef(null);
  const synthesis = window.speechSynthesis;

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    if (currentQuestion) {
      setIsRemoving(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRemoving(false);
    }

    setCurrentQuestion(input);
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setInput('');
    setIsLoading(true);
    setCurrentAnswer('');
    
    try {
      const response = await axios.post('http://192.168.215.136:8000/qa/', {
        question: input
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const botResponse = response.data.answer;
      setIsLoading(false);
      setCurrentAnswer(botResponse);
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      speakText(botResponse);
    } catch (error) {
      console.error('Error fetching response:', error);
      let errorMessage = 'An error occurred while processing your request.';
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        errorMessage = `Server error: ${error.response.status}`;
        if (error.response.status === 405) {
          errorMessage = 'CORS error: The server does not allow this type of request.';
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response received from server. This might be a CORS issue.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      setIsLoading(false);
      setCurrentAnswer(errorMessage);
      setMessages(prev => [...prev, { type: 'bot', content: errorMessage }]);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognition.current.stop();
      handleSend();
    } else {
      setInput('');
      recognition.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (synthesis.speaking) {
      synthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesis.speaking) {
      synthesis.cancel();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Medical themed background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="medical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="20" cy="20" r="8" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-pattern)"/>
        </svg>
      </div>

      <header className="bg-blue-900 p-4 text-center relative z-10">
        <h1 className="text-2xl font-bold">Medical Voicebot</h1>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
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
            <div className="text-center">
              <h2 className="text-xl mb-4">Suggested prompts:</h2>
              {["What are the symptoms of the flu?", "How can I lower my blood pressure?", "What should I do for a sprained ankle?"].map((prompt, index) => (
                <button 
                  key={index} 
                  className="m-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      
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
      
      <button
        className="fixed right-4 bottom-20 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition z-20"
        onClick={() => setIsDrawerOpen(true)}
      >
        <History />
      </button>
      
      {isDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-gray-800 p-4 shadow-lg transform transition-transform duration-300 ease-in-out z-30">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-white"
            onClick={() => setIsDrawerOpen(false)}
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
      )}
    </div>
  );
};

export default App;