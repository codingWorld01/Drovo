// Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-hot-toast';
import { Send, MessageCircle, X, Bot, User } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm DrovoBot 🥛 How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `You are DrovoBot, a customer support assistant for the Drovo dairy app, which delivers fresh dairy, grocery, and bakery products in India. Provide concise, friendly, and accurate answers about Drovo's services, products, or general inquiries. For specific user data like order status or account details, suggest contacting Drovo support at support@drovo.com or checking the app. Avoid sharing sensitive information.`;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await model.generateContent(`${systemPrompt}\nUser: ${input}`);
      const response = result.response.text();
      setMessages(prev => [...prev, { text: response, sender: 'bot', timestamp: new Date() }]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to get response from chatbot.');
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble responding right now. Please try again or contact support@drovo.com",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickAction = (action) => {
    setInput(action);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-toggle-btn"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar-header">
                <Bot size={18} />
              </div>
              <div className="header-text">
                <h3 className="bot-name">DrovoBot</h3>
                <p className="bot-status">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'}`}
              >
                <div className="message-container">
                  {/* Avatar */}
                  <div className={`message-avatar ${msg.sender === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="message-content">
                    <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                      <p className="message-text">{msg.text}</p>
                    </div>
                    <span className={`message-time ${msg.sender === 'user' ? 'user-time' : 'bot-time'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="message-wrapper bot-message-wrapper">
                <div className="message-container">
                  <div className="message-avatar bot-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble bot-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about orders, products, delivery..."
                className="chat-input"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="send-btn"
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="quick-actions">
              {['Track Order', 'Products', 'Delivery Areas', 'Support'].map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="quick-action-btn"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;