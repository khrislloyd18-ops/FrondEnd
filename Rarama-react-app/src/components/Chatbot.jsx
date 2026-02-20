import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaRobot, FaUser, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1,
      text: "Hello! I'm your AI enrollment assistant. How can I help you today?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced responses
    if (lowerMessage.includes('enroll') || lowerMessage.includes('enrollment')) {
      return "To enroll in courses, go to the Enrollment section. You'll need to:\n1. Select your desired courses\n2. Check prerequisites\n3. Submit enrollment form\n4. Wait for approval\n\nWould you like me to guide you through any specific step?";
    } else if (lowerMessage.includes('course')) {
      return "You can browse all available courses in the Courses section. Each course includes:\n• Course description\n• Schedule and duration\n• Prerequisites\n• Instructor details\n• Available slots\n\nWhat specific course information are you looking for?";
    } else if (lowerMessage.includes('student')) {
      return "Student management features include:\n• Adding new students\n• Updating student information\n• Viewing academic records\n• Tracking attendance\n• Managing payments\n\nWhich student operation would you like help with?";
    } else if (lowerMessage.includes('report')) {
      return "Available reports:\n• Enrollment statistics\n• Grade reports\n• Attendance records\n• Financial summaries\n• Performance analytics\n\nYou can generate reports in PDF or Excel format from the Reports section.";
    } else if (lowerMessage.includes('deadline')) {
      return "Upcoming deadlines:\n• Enrollment: March 15, 2024\n• Payment: March 30, 2024\n• Drop/Add: April 5, 2024\n• Final exams: May 10-20, 2024\n\nNeed more specific dates?";
    } else if (lowerMessage.includes('help')) {
      return "I can help you with:\n• Enrollment process\n• Course information\n• Student records\n• Reports and analytics\n• Deadlines and schedules\n• Technical support\n\nWhat would you like to know?";
    } else {
      return "I understand you need assistance. Could you please provide more details about what you're looking for? I'm here to help with enrollment, courses, student records, reports, and more!";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaRobot style={{ fontSize: '1.5rem' }} />
                <h4>AI Assistant</h4>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div 
                  key={message.id}
                  className={`message ${message.sender}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-content">
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  className="message bot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-content">
                    Typing...
                  </div>
                </motion.div>
              )}
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
              <motion.button 
                onClick={handleSendMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPaperPlane />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </motion.button>
    </div>
  );
};

export default Chatbot;