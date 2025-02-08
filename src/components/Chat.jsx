import { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      const userMessage = { text: newMessage, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setNewMessage('');

      try {
        const response = await fetch('/api/gemini-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage })
        });

        if (!response.ok) throw new Error('API request failed');
        const { text } = await response.json();
        const geminiResponse = text;

        const aiMessage = { text: geminiResponse, sender: 'gemini' };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Handle error appropriately
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 p-2 rounded-md ${message.sender === 'user' ? 'bg-blue-200 text-right' : 'bg-gray-200 text-left'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="p-4 flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-md">Send</button>
      </div>
    </div>
  );
}

export default Chat;
