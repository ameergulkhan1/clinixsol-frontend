import React, { useState } from 'react';
import './Messaging.css';

const Messaging = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Dr. Smith', role: 'Doctor', lastMessage: 'Your reports look good' },
    { id: 2, name: 'Jane Doe', role: 'Patient', lastMessage: 'Thank you doctor' }
  ]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'me', time: new Date().toLocaleTimeString() }]);
      setInput('');
    }
  };

  return (
    <div className="messaging">
      <div className="contacts-list">
        {contacts.map(contact => (
          <div key={contact.id} className="contact-item">
            <h4>{contact.name}</h4>
            <p>{contact.lastMessage}</p>
          </div>
        ))}
      </div>
      <div className="message-area">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
          ))}
        </div>
        <div className="message-input">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Messaging;