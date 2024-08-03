import React, { useState, useEffect, useRef } from 'react';
import './LiveChatBotWindow.css';

const LiveChatBotWindow = () => {
  const storedEmail = localStorage.getItem('email'); 
  var storedRole = localStorage.getItem('role');
  if (storedRole === "customer") {
    storedRole = "user";
  }
  var allAgentIds = [];
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
    const fetchAgents = async () => {
      try {
        const response = await fetch('https://j2coj662otwr6wiwtihiovda6e0kkuxs.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType: 'agent' }),
        });
        const data = await response.json();
        console.warn("FETCH ALL AGENTS", data.Emails);
        allAgentIds = data.Emails;
        console.warn(allAgentIds);
        
        // Call createUserDocument after fetching all agents
        
        const createUserDocument = async () => {
          try {
            if (storedRole === "user") {
              const randomIndex = Math.floor(Math.random() * allAgentIds.length);
              const selectedAgentId = allAgentIds[randomIndex];
              setAgentId(selectedAgentId);
              setUserId(storedEmail);
              console.log("SET USER ID", storedEmail);
              console.log("SET AGENT ID", selectedAgentId);

              const createResponse = await fetch('https://us-central1-dalvacation-430004.cloudfunctions.net/create-user-document', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: storedEmail, agent_id: selectedAgentId }),
              });
              const createData = await createResponse.json();
              console.warn("CREATE DOCS", createData);
            }

            // Call fetchIds after creating the user document
            const fetchIds = async () => {
              try {
                const response = await fetch('https://us-central1-dalvacation-430004.cloudfunctions.net/get-user-agent-ids', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    role: storedRole,
                    role_id: storedEmail
                  }),
                });
                const data = await response.json();

                // Extract user_id array and get the first value as a string
                const fetchedUserId = Array.isArray(data.user_id) ? data.user_id[0] : '';
                setUserId(fetchedUserId);
                setAgentId(data.agent_id);
                console.warn("FETCHED AGENT AND USER IDs", userId);
                console.warn("FETCHED AGENT AND USER IDs", agentId);
              } catch (err) {
                setError(err);
                setLoading(false);
              }
            };

            fetchIds();

          } catch (err) {
            setError(err);
            setLoading(false);
          }
        };

        createUserDocument();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch messages from both roles
        const fetchMessagesForRole = async (role) => {
          const response = await fetch(`https://us-central1-dalvacation-430004.cloudfunctions.net/retrieve-message?user_id=${userId}&role=${role}`);
          const data = await response.json();
          console.warn("FETCHED MSGS", data);
    
          // Determine the sender and receiver based on the role
          return data.messages.map(message => ({
            ...message,
            sender: role === 'user' ? 'user' : 'agent',
            receiver: role === 'user' ? 'agent' : 'user',
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
        console.warn("SORTED MESSAGES", sortedMessages);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchMessages();                                        // Initial fetch
      const intervalId = setInterval(fetchMessages, 2000);    // Fetch messages every 2 seconds
      return () => clearInterval(intervalId);                 // Clear interval on component unmount
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
      role: storedRole, // Use storedRole to set the role dynamically
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch('https://us-central1-dalvacation-430004.cloudfunctions.net/trigger-pubsub-with-customer-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

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

  return (
    <>
      {isVisible && (
        <div className="chatContainer">
          <button className="minimizeButton" onClick={handleToggleVisibility}>✖</button>
          <div className="messagesContainer">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`messageContainer ${
                  (storedRole === 'user' && message.sender === 'user') ||
                  (storedRole === 'agent' && message.sender === 'agent')
                    ? 'sent'
                    : 'received'
                }`}
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
