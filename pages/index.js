// FamilyGPT: Mobile + Desktop Friendly Starter with Voice Input and Output
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function FamilyGPT() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event);
        };
      }
    }
  }, []);

  const speak = (text) => {
    if (typeof window === 'undefined' || !synthRef.current) return;
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    utter.voice = voices.find(v => v.name.includes('Google')) || voices[0];
    synthRef.current.speak(utter);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newEntry = { sender: user || 'Anonymous', text: message };
    setConversation([...conversation, newEntry]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: newEntry.text,
        user: newEntry.sender,
      });
      const botReply = { sender: 'FamilyGPT', text: response.data.reply };
      setConversation((prev) => [...prev, botReply]);
      speak(botReply.text);
    } catch (err) {
      const errorReply = { sender: 'FamilyGPT', text: 'Oops, error from GPT.' };
      setConversation((prev) => [...prev, errorReply]);
      speak(errorReply.text);
    } finally {
      setLoading(false);
    }
  };

  const familyMembers = [
    { name: 'Laura', avatar: '👩' },
    { name: 'Andy', avatar: '👨' },
    { name: 'Evan', avatar: '🧑' },
    { name: 'Grace', avatar: '👧' },
    { name: 'Marcie', avatar: '👩‍🦰' },
    { name: 'Issac', avatar: '👦' },
    { name: 'Quinn', avatar: '👶' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:block w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Family Members</h2>
        <ul>
          {familyMembers.map(({ name, avatar }) => (
            <li
              key={name}
              onClick={() => setUser(name)}
              className={`mb-2 cursor-pointer hover:underline ${user === name ? 'font-bold text-blue-600' : ''}`}
            >
              {avatar} {name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-semibold mb-4">FamilyGPT Chat</h1>

        <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
          {conversation.map((msg, idx) => {
            const isCurrentUser = msg.sender === user;
            const isAssistant = msg.sender === 'FamilyGPT';
            const bubbleStyle = isAssistant
              ? 'bg-blue-100 self-end text-right'
              : isCurrentUser
              ? 'bg-green-200 self-start'
              : 'bg-gray-200 self-start';
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-lg ${bubbleStyle}`}
              >
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Your name"
            className="border px-2 py-1 rounded w-1/4"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="text"
            placeholder="Type a message..."
            className="border px-2 py-1 rounded flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            Send
          </button>
          <button
            onClick={startListening}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            🎤 Speak
          </button>
        </div>
      </main>
    </div>
  );
}
