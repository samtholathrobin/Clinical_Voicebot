import React, { useState } from 'react';
import { History } from 'lucide-react';
import axios from 'axios';
import { encryptQuestion, decryptAnswer } from './utils/encryption';
import { Header } from './components/Header';
import { Background } from './components/Background';
import { ChatDisplay } from './components/ChatDisplay';
import { InputSection } from './components/InputSection';
import { ChatHistory } from './components/ChatHistory';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { backendURL } from './config';

const handleError = (error) => {
  let errorMessage = 'An error occurred while processing your request.';
  if (error.response) {
    if (error.response.data && error.response.data.answer) {
      try {
        errorMessage = decryptAnswer(error.response.data.answer);
      } catch (decryptError) {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else {
      errorMessage = `Server error: ${error.response.status}`;
    }
    if (error.response.status === 405) {
      errorMessage = 'CORS error: The server does not allow this type of request.';
    }
  } else if (error.request) {
    errorMessage = 'No response received from server. This might be a CORS issue.';
  } else {
    errorMessage = error.message;
  }
  return errorMessage;
};

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

  const { start, stop } = useSpeechRecognition((transcript) => {
    setInput(transcript);
  });

  const { speak: speakText, stop: stopSpeaking } = useSpeechSynthesis(
    () => setIsSpeaking(true),
    () => setIsSpeaking(false)
  );

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
      const encryptedQuestion = encryptQuestion(input);
      const response = await axios.post(backendURL, {
        question: encryptedQuestion,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const decryptedAnswer = decryptAnswer(response.data.answer);
      
      setIsLoading(false);
      setCurrentAnswer(decryptedAnswer);
      setMessages(prev => [...prev, { type: 'bot', content: decryptedAnswer }]);
      speakText(decryptedAnswer);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = handleError(error);
      setIsLoading(false);
      setCurrentAnswer(errorMessage);
      setMessages(prev => [...prev, { type: 'bot', content: errorMessage }]);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stop();
      setIsListening(false);
      handleSend();
      setInput('');
    } else {
      start();
      setIsListening(true);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden">
      <Background />
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
        <ChatDisplay
          currentQuestion={currentQuestion}
          currentAnswer={currentAnswer}
          isLoading={isLoading}
          isRemoving={isRemoving}
          isSpeaking={isSpeaking}
          stopSpeaking={stopSpeaking}
          setInput={setInput}
        />
      </main>
      
      <InputSection
        input={input}
        setInput={setInput}
        isListening={isListening}
        isLoading={isLoading}
        isRemoving={isRemoving}
        handleSend={handleSend}
        handleVoiceInput={handleVoiceInput}
      />
      
      <button
        className="fixed right-4 bottom-20 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition z-20"
        onClick={() => setIsDrawerOpen(true)}
      >
        <History />
      </button>
      
      <ChatHistory
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        messages={messages}
        speakText={speakText}
        clearHistory={clearHistory}
      />
    </div>
  );
};

export default App;