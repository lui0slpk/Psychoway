import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

function PsychobotPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch historial al cargar
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            const userId = user.id || user.id_user;
            try {
                const res = await fetch(`http://localhost:5000/api/psychobot/history/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 0) {
                        // Mensaje por defecto inicial si no hay historial
                        setChatHistory([{ type: 'bot', text: `Muy buen día, ${user?.names || 'Usuario'}, soy Psychobot. Estoy aquí para escucharte, ¿cómo te encuentras hoy?` }]);
                    } else {
                        setChatHistory(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
                setChatHistory([{ type: 'bot', text: `Hola ${user?.names || 'Usuario'}, soy Psychobot. Hubo un problema al cargar nuestro último chat, pero estoy aquí. ¿Cómo te sientes?` }]);
            }
        };
        fetchHistory();
    }, [user]);

    // Scroll automático al final
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const userMessage = message;
        setMessage('');
        setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsTyping(true);
        
        try {
            const userId = user.id || user.id_user;
            const res = await fetch('http://localhost:5000/api/psychobot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: userMessage })
            });

            if (res.ok) {
                const data = await res.json();
                setChatHistory(prev => [...prev, data]);
            } else {
                setChatHistory(prev => [...prev, { type: 'error', text: 'Error: No se pudo procesar tu mensaje.' }]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setChatHistory(prev => [...prev, { type: 'error', text: 'Ocurrió un error de red. Intenta nuevamente.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <MainLayout 
            pageTitle="Psychobot" 
            pageSubtitle="Tu asistente virtual de apoyo"
            currentPage="psychobot"
        >
            <div className="container-fluid px-4 py-5">
                <div className="card shadow rounded-4 overflow-hidden mx-5">
                    <div className="card-header text-white text-center fw-bold py-4 bg-light-green">
                        <h2 className="mb-0">Chat con Psychobot</h2>
                    </div>
                    
                    <div 
                        className="card-body" 
                        style={{ height: '480px', overflowY: 'auto', fontSize: '1.15rem' }}
                    >
                        <div className="d-flex flex-column gap-3">
                            {chatHistory.map((msg, index) => (
                                <React.Fragment key={index}>
                                    {msg.type === 'bot' && (
                                        <div className="bg-secondary-subtle p-3 rounded text-dark w-75">
                                            {msg.text}
                                        </div>
                                    )}
                                    {msg.type === 'user' && (
                                        <div className="text-end">
                                            <div className="bg-greenv2 text-white p-3 rounded w-75 ms-auto" 
                                                 style={{ backgroundColor: '#7eb67e' }}>
                                                {msg.text}
                                                <div className="small text-end mt-1">{user?.names || 'Usuario'}</div>
                                            </div>
                                        </div>
                                    )}
                                    {msg.type === 'error' && (
                                        <div className="bg-danger-subtle text-danger-emphasis p-3 rounded w-75">
                                            {msg.text}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}

                            {isTyping && (
                                <div className="bg-secondary-subtle p-3 rounded text-dark w-75 d-flex align-items-center gap-2">
                                    <div className="spinner-grow spinner-grow-sm text-secondary" role="status"></div>
                                    <div className="spinner-grow spinner-grow-sm text-secondary" role="status" style={{animationDelay: '0.2s'}}></div>
                                    <div className="spinner-grow spinner-grow-sm text-secondary" role="status" style={{animationDelay: '0.4s'}}></div>
                                    <span className="ms-2">Psychobot está pensando...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="card-footer border-top-0 mt-4">
                        <form className="d-flex gap-2" onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                className="form-control shadow-sm" 
                                placeholder="Envía un mensaje..."
                                style={{ fontSize: '1.1rem', height: '48px' }}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isTyping}
                            />
                            <button 
                                type="submit" 
                                className="btn btn-outline-success"
                                style={{ fontSize: '1.1rem', height: '48px' }}
                                disabled={isTyping || !message.trim()}
                            >
                                {isTyping ? 'Enviando...' : 'Enviar'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default PsychobotPage;
