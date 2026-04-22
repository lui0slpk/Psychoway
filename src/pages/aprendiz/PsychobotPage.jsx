import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

function PsychobotPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const userId = user?.id || user?.id_user;

    // Fetch lista de sesiones
    const fetchSessions = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/psychobot/sessions/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
                if (data.length > 0 && !currentSessionId) {
                    setCurrentSessionId(data[0].id_session);
                }
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    // Fetch historial de una sesión
    const fetchHistory = async (sessionId) => {
        if (!sessionId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/psychobot/history/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    setChatHistory([{ type: 'bot', text: `¡Hola ${user?.names || 'amigo'}! Estoy aquí para escucharte. ¿De qué te gustaría hablar hoy?` }]);
                } else {
                    setChatHistory(data);
                }
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [userId]);

    useEffect(() => {
        if (currentSessionId) {
            fetchHistory(currentSessionId);
        }
    }, [currentSessionId]);

    // Scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleNewChat = async () => {
        if (isTyping) return;
        try {
            const res = await fetch('http://localhost:5000/api/psychobot/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title: 'Nueva Conversación' })
            });
            if (res.ok) {
                const newSession = await res.json();
                setSessions(prev => [newSession, ...prev]);
                setCurrentSessionId(newSession.id_session);
                setChatHistory([{ type: 'bot', text: `Nueva conversación iniciada. ¿En qué puedo ayudarte hoy?` }]);
                setSidebarOpen(false);
            }
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    const handleDeleteChat = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que quieres borrar esta conversación?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/psychobot/sessions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id_session !== id));
                if (currentSessionId === id) {
                    setCurrentSessionId(null);
                    setChatHistory([]);
                }
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const userMessage = message;
        setMessage('');
        setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsTyping(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/psychobot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: userMessage, id_session: currentSessionId })
            });

            if (res.ok) {
                const data = await res.json();
                setChatHistory(prev => [...prev, data]);
                if (!currentSessionId && data.id_session) {
                    setCurrentSessionId(data.id_session);
                    fetchSessions();
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
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
            <div className="container-fluid px-2 px-md-4 py-3 py-md-5" style={{ position: 'relative' }}>
                
                {/* Botón Flotante para cambiar de chat */}
                <button 
                    className="btn btn-dark rounded-circle shadow-lg"
                    style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, width: '50px', height: '50px' }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Historial de conversaciones"
                >
                    <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-clock-history'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>

                {/* Sidebar Minimalista / Drawer */}
                <div 
                    className={`bg-white shadow-lg border-end transition-all`}
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: sidebarOpen ? 0 : '-320px', 
                        height: '100%', 
                        width: '300px', 
                        zIndex: 110, // Por encima del navbar si es necesario
                        paddingTop: '80px',
                        visibility: sidebarOpen ? 'visible' : 'hidden',
                        maxWidth: '85vw'
                    }}
                >
                    <div className="px-3 mb-4">
                        <button className="btn btn-outline-success w-100 rounded-pill d-flex align-items-center justify-content-center gap-2" onClick={handleNewChat}>
                            <i className="bi bi-plus-lg"></i> Nuevo Chat
                        </button>
                    </div>
                    <div className="overflow-auto h-75 px-2">
                        {sessions.map(session => (
                            <div 
                                key={session.id_session}
                                onClick={() => { setCurrentSessionId(session.id_session); setSidebarOpen(false); }}
                                className={`p-3 mb-2 rounded-3 cursor-pointer d-flex justify-content-between align-items-center transition-all ${currentSessionId === session.id_session ? 'bg-success bg-opacity-10 border border-success' : 'hover-bg-light border'}`}
                                style={{ fontSize: '0.9rem' }}
                            >
                                <div className="text-truncate flex-grow-1 me-2" title={session.title}>
                                    <i className="bi bi-chat-left-dots me-2 text-muted"></i>
                                    {session.title}
                                </div>
                                <i className="bi bi-trash text-muted opacity-50 hover-opacity-100" onClick={(e) => handleDeleteChat(session.id_session, e)}></i>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Diseño Original: Tarjeta Centrada */}
                <div className="card shadow rounded-4 overflow-hidden mx-0 mx-md-5 border-0">
                    <div className="card-header text-white text-center fw-bold py-4 bg-light-green">
                        <h2 className="mb-0">Chat con Psychobot</h2>
                    </div>
                    
                    <div 
                        className="card-body bg-white" 
                        style={{ height: 'calc(100vh - 400px)', minHeight: '400px', overflowY: 'auto', fontSize: '1.1rem' }}
                    >
                        <div className="d-flex flex-column gap-3">
                            {chatHistory.map((msg, index) => (
                                <React.Fragment key={index}>
                                    {msg.type === 'bot' && (
                                        <div className="bot-message p-3 rounded-4 text-dark align-self-start shadow-sm" style={{ backgroundColor: '#f0f4f0', maxWidth: '85%' }}>
                                            {msg.text}
                                        </div>
                                    )}
                                    {msg.type === 'user' && (
                                        <div className="text-end">
                                            <div className="user-message text-white p-3 rounded-4 ms-auto shadow-sm" 
                                                 style={{ backgroundColor: '#005222', maxWidth: '85%' }}>
                                                {msg.text}
                                                <div className="small text-end mt-1 opacity-75">{user?.names || 'Usuario'}</div>
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
                                <div className="bg-secondary-subtle p-3 rounded text-dark d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
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
                                className="btn btn-success px-4"
                                style={{ fontSize: '1.1rem', height: '48px', backgroundColor: '#005222', borderColor: '#005222' }}
                                disabled={isTyping || !message.trim()}
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-light-green { background-color: #005222; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.3s ease-in-out; }
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .bot-message { border-bottom-left-radius: 4px !important; }
                .user-message { border-bottom-right-radius: 4px !important; }
            `}</style>
        </MainLayout>
    );
}

export default PsychobotPage;
