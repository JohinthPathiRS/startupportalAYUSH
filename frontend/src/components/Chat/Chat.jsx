import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      const newMessages = [...messages, { text: input, sender: 'You' }];
      setMessages(newMessages);
      setInput("");

      
      axios.post('http://localhost:3000/api/v1/ai', { userQuery: input })
        .then((response) => {
          const botResponse = response.data.response.replace(/<br\/>/g, '\n');
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: botResponse, sender: 'Bot' }
          ]);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    
    <div className="h-screen flex">
      <div className="flex flex-col w-full">
        <Card className="flex-1 overflow-y-auto bg-gray-50">
          <CardContent>
            <div className="flex flex-col space-y-4 p-4">
              {messages.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
                  <h1>How is the day?....  </h1>
                  <br />
                  <h1>Start a conversation...</h1>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-2 max-w-xs rounded-lg ${
                        message.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      <span className="block text-sm font-semibold">{message.sender}</span>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message input area */}
        <div className="p-4 bg-white border-t flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
