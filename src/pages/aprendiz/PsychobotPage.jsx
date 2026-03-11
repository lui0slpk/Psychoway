import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

function PsychobotPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { type: 'bot', text: `Muy buen día, ${user?.names || 'Usuario'}, soy Psychobot, ¿cómo te encuentras?` }
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Agregar mensaje del usuario
        setChatHistory(prev => [...prev, { type: 'user', text: message }]);
        
        // Simular respuesta del bot (aquí iría la integración real)
        setTimeout(() => {
            setChatHistory(prev => [...prev, { 
                type: 'bot', 
                text: 'Gracias por compartir eso conmigo. ¿Podrías contarme más sobre cómo te sientes?' 
            }]);
        }, 1000);

        setMessage('');
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
                            />
                            <button 
                                type="submit" 
                                className="btn btn-outline-success"
                                style={{ fontSize: '1.1rem', height: '48px' }}
                            >
                                Enviar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default PsychobotPage;
