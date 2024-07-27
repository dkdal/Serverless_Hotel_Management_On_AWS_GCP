import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LiveChatBotWindow.css';

const LiveChatBotWindow = () => {
  const userId = "999";
  const agentId = "111"
  const roles = ["user", "agent"];
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
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

        const messagesPromises = roles.map(role => fetchMessagesForRole(role));
        const allMessages = await Promise.all(messagesPromises);

        const flattenedMessages = allMessages.flat();
        const sortedMessages = flattenedMessages.sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });

        setMessages(sortedMessages);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

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

      const updatedMessages = [...messages, newMessage].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

      setMessages(updatedMessages);
      setInputMessage('');
    } catch (err) {
      setError('Error sending message. Please try again later.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading messages: {error.message}</div>;

  return (
    <div className="chatContainer">
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
  );
};

export default LiveChatBotWindow;
