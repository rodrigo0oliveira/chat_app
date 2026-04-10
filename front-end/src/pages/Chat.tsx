import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

interface ChatMessage {
  id?: string;
  content: string;
  senderUsername: string;
  createdAt: string;
}

export default function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') || 'Sala de Chat';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;
    
    loadHistory();

    wsService.connect(
      () => {
        setConnected(true);
        setError('');
        wsService.subscribeToRoom(roomId, (newMessage: ChatMessage) => {
          setMessages(prev => [...prev, newMessage]);
        });
      },
      (err) => {
        console.error('STOMP Error:', err);
        setError('Falha na conexão. ' + err);
        if (err === "No token found") {
            navigate('/');
        }
      }
    );

    return () => {
      wsService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await api.get(`/messages/${roomId}/messages`);
      setMessages(res.data);
    } catch (err: any) {
      console.error('Failed to load history', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !roomId || !connected) return;

    wsService.sendMessage(roomId, inputValue);
    setInputValue('');
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="chat-container">
      <header className="glass-header chat-header">
        <button className="btn-icon" onClick={() => navigate('/rooms')}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-title">
          <h2>{roomName}</h2>
          <span className={`status-indicator ${connected ? 'status-online' : 'status-offline'}`}>
            {connected ? 'Conectado' : 'Conectando...'}
          </span>
        </div>
      </header>

      {error && <div className="alert alert-error chat-alert">{error}</div>}

      <main className="messages-area">
        {messages.map((msg, index) => {
           return (
            <div key={index} className="message-wrapper">
              <div className="message-bubble">
                <div className="message-sender">{msg.senderUsername || 'Usuário Desconhecido'}</div>
                <div className="message-content">{decodeHtml(msg.content)}</div>
                <div className="message-time">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <div className="glass-panel input-area">
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite uma mensagem..."
            autoComplete="off"
            disabled={!connected}
          />
          <button type="submit" disabled={!inputValue.trim() || !connected} className="btn-send">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
