import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you with the enrollment system today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages([...messages, { text: inputMessage, sender: 'user' }]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 1000);

    setInputMessage('');
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('enroll') || lowerMessage.includes('enrollment')) {
      return "To enroll in courses, go to the Enrollment section. You can select your desired courses and complete the enrollment process there.";
    } else if (lowerMessage.includes('course')) {
      return "You can browse all available courses in the Courses section. Each course has detailed information including schedule, prerequisites, and instructor details.";
    } else if (lowerMessage.includes('student')) {
      return "Student information can be managed in the Students section. You can add, edit, or view student profiles there.";
    } else if (lowerMessage.includes('report')) {
      return "Various reports are available in the Reports section including enrollment statistics, grade reports, and analytics.";
    } else if (lowerMessage.includes('help')) {
      return "I can help you with information about enrollment, courses, students, and reports. What would you like to know?";
    } else {
      return "I'm here to help! You can ask me about enrollment, courses, students, or reports.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>Enrollment Assistant</h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FaComments />
      </button>
    </div>
  );
};

export default Chatbot;