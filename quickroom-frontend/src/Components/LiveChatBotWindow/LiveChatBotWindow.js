import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LiveChatBotWindow.css';

const LiveChatBotWindow = () => {
  const [userId, setUserId] = useState('');
  const [agentId, setAgentId] = useState('');
  const roles = ["user", "agent"];
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Reference for the messages container
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchIds = async () => {
      try {
        const response = await axios.post(
          'https://us-central1-dalvacation-430004.cloudfunctions.net/get-user-agent-ids',
          {
            role: "agent",
            role_id: "111" // assuming the role_id is fixed for now
          }
        );
        const data = response.data;

        // Extract user_id array and get the first value as a string
        const fetchedUserId = Array.isArray(data.user_id) ? data.user_id[0] : '';
        setUserId(fetchedUserId);
        setAgentId(data.agent_id);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchIds();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch messages from both roles
        const fetchMessagesForRole = async (role) => {
          const response = await axios.get(
            `https://us-central1-dalvacation-430004.cloudfunctions.net/retrieve-message`,
            {
              params: {
                user_id: userId,
                role: role
              }
            }
          );
          return response.data.messages.map(message => ({
            ...message,
            sender: role
          }));
        };

        // Fetch messages for all roles
        const messagesPromises = roles.map(role => fetchMessagesForRole(role));
        const allMessages = await Promise.all(messagesPromises);

        // Flatten the array of arrays
        const flattenedMessages = allMessages.flat();

        // Sort messages by timestamp
        const sortedMessages = flattenedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setMessages(sortedMessages);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    if (userId) {
      fetchMessages(); // Initial fetch
      const intervalId = setInterval(fetchMessages, 2000); // Fetch messages every 2 seconds

      return () => clearInterval(intervalId); // Clear interval on component unmount
    }
  }, [userId]);

  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      user_id: userId,
      agent_id: agentId,
      role: "user",
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await axios.post(
        `https://us-central1-dalvacation-430004.cloudfunctions.net/trigger-pubsub-with-customer-message`,
        newMessage
      );

      // Update the messages state with the new message
      const updatedMessages = [...messages, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(updatedMessages);
      setInputMessage('');
    } catch (err) {
      setError('Error sending message. Please try again later.');
    }
  };

  const handleToggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading messages: {error.message}</div>;

  return (
    <>
      {isVisible && (
        <div className="chatContainer">
          <button className="minimizeButton" onClick={handleToggleVisibility}>✖</button>
          <div className="messagesContainer">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`messageContainer ${message.sender === 'user' ? 'sent' : 'received'}`}
              >
                <div className="message">{message.message}</div>
                <div className="timestamp">{message.timestamp}</div>
              </div>
            ))}
            {/* Invisible element at the end of the messages container */}
            <div ref={messagesEndRef} />
          </div>
          <div className="inputContainer">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="input"
            />
            <button onClick={handleSendMessage} className="sendButton">Send</button>
          </div>
        </div>
      )}
      {!isVisible && (
        <button className="minimizeButton openButton" onClick={handleToggleVisibility}>Live Chat</button>
      )}
    </>
  );
};

export default LiveChatBotWindow;
