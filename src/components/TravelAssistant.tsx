// src/components/TravelAssistant.tsx
import { useState, useEffect, useRef } from 'react';
import { askTravelAssistant } from '../utils/assistant';
import type { ChatMessage } from '../utils/assistant';
import type { FullTripItinerary } from '../types/travel';

interface TravelAssistantProps {
  tripData: FullTripItinerary;
}

export default function TravelAssistant({ tripData }: TravelAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and reset chat history when tripData changes
  useEffect(() => {
    setHistory([
      {
        role: 'model',
        text: `Hi! I'm **GlobeGuide**, your travel assistant for **${tripData.metadata.destination}**! 🗺️✨\n\nI have studied your custom **${tripData.metadata.durationInDays}-day ${tripData.metadata.travelStyle.toLowerCase()}** itinerary. Ask me anything about:\n* 🍽️ Best local foods and restaurants\n* 🚌 Transit options and directions\n* ⛩️ Cultural etiquette & tips\n* ☀️ Packing advice for the weather`,
      },
    ]);
    setIsOpen(false);
  }, [tripData.id, tripData.metadata.destination, tripData.metadata.durationInDays, tripData.metadata.travelStyle]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', text: text.trim() };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await askTravelAssistant(tripData, history, text.trim());
      setHistory([...updatedHistory, { role: 'model', text: response }]);
    } catch (err: any) {
      setHistory([
        ...updatedHistory,
        {
          role: 'model',
          text: `⚠️ **API Error**: ${err.message || 'Could not communicate with assistant. Please verify your VITE_GEMINI_API_KEY.'}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  // Helper to render message text with bolding and list formats
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Bold formatting helper (**text**)
      const formatBold = (str: string) => {
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) => {
          if (i % 2 === 1) return <strong key={i}>{part}</strong>;
          return part;
        });
      };

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="chat-bullet">
            {formatBold(trimmed.substring(2))}
          </li>
        );
      };

      return (
        <p key={idx} className="chat-paragraph">
          {formatBold(line)}
        </p>
      );
    });
  };

  const suggestions = [
    { label: '🍽️ Food ideas', text: 'What are the top local dishes and food spots I should try here?' },
    { label: '🚌 Local transit', text: 'How is the public transportation? What cards or apps do I need?' },
    { label: '⛩️ Cultural tips', text: 'What are some important local cultural tips or etiquette rules I should know?' },
    { label: '🎒 Pack check', text: 'What weather-appropriate clothing and gear should I prioritize packing?' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`assistant-float-btn ${isOpen ? 'assistant-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Guide Assistant"
      >
        <span className="float-icon">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && <span className="float-badge">Guide</span>}
      </button>

      {/* Slide-out Chat Drawer */}
      <div className={`assistant-drawer ${isOpen ? 'drawer-open' : ''}`}>
        {/* Drawer Header */}
        <div className="assistant-drawer-header">
          <div className="assistant-header-meta">
            <span className="assistant-avatar">🤖</span>
            <div>
              <h3 className="assistant-title">GlobeGuide AI</h3>
              <p className="assistant-status">Local Expert Guide</p>
            </div>
          </div>
          <button className="assistant-close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        {/* Chat Window */}
        <div className="assistant-chat-window">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message-row ${msg.role === 'user' ? 'msg-user-row' : 'msg-bot-row'}`}
            >
              {msg.role === 'model' && <span className="msg-avatar-icon">🤖</span>}
              <div className="chat-message-bubble">
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message-row msg-bot-row">
              <span className="msg-avatar-icon">🤖</span>
              <div className="chat-message-bubble typing-bubble">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {history.length <= 1 && (
          <div className="assistant-suggestions">
            {suggestions.map((s) => (
              <button
                key={s.label}
                className="suggestion-chip"
                onClick={() => handleSend(s.text)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="assistant-chat-form">
          <input
            type="text"
            placeholder="Ask GlobeGuide about your trip..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="assistant-chat-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="assistant-chat-submit"
          >
            ➔
          </button>
        </form>
      </div>
    </>
  );
}
