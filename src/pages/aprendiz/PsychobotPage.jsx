import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, Plus, Trash2, X, MessageSquare, Wind, Zap, Smile, Bot } from "lucide-react";

function PsychobotPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = user?.id || user?.id_user;

  const fetchSessions = React.useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/psychobot/sessions/${userId}`);
      if (res.ok) { const data = await res.json(); setSessions(data); if (data.length > 0 && !currentSessionId) setCurrentSessionId(data[0].id_session); }
    } catch (error) { console.error("Error:", error); }
  }, [userId, currentSessionId]);

  const fetchHistory = React.useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/psychobot/history/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) setChatHistory([{ type: "bot", text: `¡Hola ${user?.names || ""}! Soy Psychobot 🧠. Estoy aquí para escucharte. ¿Cómo te sientes hoy?` }]);
        else setChatHistory(data);
      }
    } catch (error) { console.error("Error:", error); }
  }, [user?.names]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { if (currentSessionId) fetchHistory(currentSessionId); }, [currentSessionId, fetchHistory]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);

  const handleNewChat = async () => {
    if (isTyping) return;
    try {
      const res = await fetch("http://localhost:5000/api/psychobot/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, title: "Nueva Conversación" }) });
      if (res.ok) {
        const ns = await res.json(); setSessions(prev => [ns, ...prev]); setCurrentSessionId(ns.id_session);
        setChatHistory([{ type: "bot", text: "Nueva conversación iniciada. ¿En qué puedo ayudarte hoy? 😊" }]); setSidebarOpen(false);
      }
    } catch (error) { console.error("Error:", error); }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que quieres borrar esta conversación?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/psychobot/sessions/${id}`, { method: "DELETE" });
      if (res.ok) { setSessions(prev => prev.filter(s => s.id_session !== id)); if (currentSessionId === id) { setCurrentSessionId(null); setChatHistory([]); } }
    } catch (error) { console.error("Error:", error); }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const msgToSend = message.trim();
    if (!msgToSend || isTyping) return;
    setMessage(""); setChatHistory(prev => [...prev, { type: "user", text: msgToSend }]); setIsTyping(true);
    try {
      const res = await fetch("http://localhost:5000/api/psychobot/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, message: msgToSend, id_session: currentSessionId, chatHistory: [...chatHistory, { type: "user", text: msgToSend }] }) });
      if (res.ok) { const data = await res.json(); setChatHistory(prev => [...prev, data]); if (!currentSessionId && data.id_session) { setCurrentSessionId(data.id_session); fetchSessions(); } }
    } catch (error) { console.error("Error:", error); }
    finally { setIsTyping(false); }
  };

  const handleQuickAction = (actionText) => {
    if (actionText === "/respirar") { setShowBreathing(true); return; }
    setMessage(actionText);
    setTimeout(() => { const btn = document.getElementById("send-btn"); if (btn) btn.click(); }, 100);
  };

  return (
    <MainLayout pageTitle="Psychobot" pageSubtitle="Tu asistente virtual de apoyo" currentPage="psychobot">
      <motion.div className="container-fluid px-4 py-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.3)", zIndex: 1100 }} />
              <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25 }}
                style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "280px", zIndex: 1200, background: "#fff", maxWidth: "85vw" }}
                className="shadow-lg">
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2"><Clock size={16} /> Historial</h6>
                  <button className="btn btn-sm p-1 text-muted" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
                </div>
                <div className="p-3">
                  <button className="btn btn-outline-success w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 mb-3" onClick={handleNewChat}>
                    <Plus size={16} /> Nuevo Chat
                  </button>
                </div>
                <div className="overflow-auto px-3" style={{ height: "calc(100vh - 140px)" }}>
                  {sessions.map(session => (
                    <div key={session.id_session}
                      onClick={() => { setCurrentSessionId(session.id_session); setSidebarOpen(false); }}
                      className="p-3 mb-2 rounded-3 d-flex justify-content-between align-items-center"
                      style={{ cursor: "pointer", background: currentSessionId === session.id_session ? "#e8f5e9" : "transparent", transition: "all 0.2s" }}>
                      <div className="text-truncate flex-grow-1 me-2 small d-flex align-items-center gap-2">
                        <MessageSquare size={14} className="text-muted flex-shrink-0" /> {session.title}
                      </div>
                      <Trash2 size={14} className="text-muted flex-shrink-0" style={{ cursor: "pointer" }} onClick={e => handleDeleteChat(session.id_session, e)} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom" style={{ background: "#f8faf8" }}>
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-light rounded-circle d-flex align-items-center justify-content-center" onClick={() => setSidebarOpen(true)} style={{ width: 38, height: 38 }}>
                    <Clock size={16} className="text-success" />
                  </button>
                  <div>
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2"><Bot size={18} className="text-success" /> Psychobot</h6>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>Asistente de bienestar emocional</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: 8, height: 8, background: "#4ade80", display: "inline-block" }}></span>
                  <span className="text-muted small">En línea</span>
                </div>
              </div>

              {/* Chat Area */}
              <div className="px-4 py-3" style={{ height: "420px", overflowY: "auto", background: "#fff" }}>
                <div className="d-flex flex-column gap-3">
                  {chatHistory.map((msg, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                      className={`d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"}`}>
                      <div style={{ maxWidth: "75%" }}>
                        {msg.type !== "user" && <small className="text-muted d-block mb-1 ms-1" style={{ fontSize: "0.7rem" }}>Psychobot</small>}
                        <div className={`px-3 py-2 ${msg.type === "user" ? "text-white" : ""}`}
                          style={{
                            borderRadius: "16px",
                            background: msg.type === "user" ? "#005222" : "#f0f4f0",
                            fontSize: "0.9rem",
                            lineHeight: 1.55,
                            color: msg.type === "user" ? "#fff" : "#1a1a1a",
                          }}>
                          {msg.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-start">
                      <div>
                        <small className="text-muted d-block mb-1 ms-1" style={{ fontSize: "0.7rem" }}>Psychobot</small>
                        <div className="px-3 py-2 d-flex align-items-center gap-1" style={{ borderRadius: "16px", background: "#f0f4f0" }}>
                          <div className="typing-dot"></div><div className="typing-dot" style={{ animationDelay: "0.2s" }}></div><div className="typing-dot" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-top px-4 py-2" style={{ background: "#fafafa" }}>
                <div className="d-flex gap-2 overflow-auto pb-1">
                  {[{ icon: Wind, label: "Respirar", action: "/respirar" }, { icon: Zap, label: "Meditar", action: "Ayúdame a meditar un poco" }, { icon: Smile, label: "Motivación", action: "Necesito una frase motivadora" }].map((qa, i) => (
                    <button key={i} className="btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 flex-shrink-0"
                      onClick={() => handleQuickAction(qa.action)}
                      style={{ fontSize: "0.78rem", background: "#fff", border: "1px solid #e0e0e0", color: "#005222" }}>
                      <qa.icon size={13} /> {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-top">
                <form className="d-flex gap-2 align-items-center" onSubmit={handleSubmit}>
                  <input type="text" className="form-control rounded-pill px-4 border-2" placeholder="Escribe tu mensaje..." style={{ height: 44 }}
                    value={message} onChange={e => setMessage(e.target.value)} disabled={isTyping} />
                  <button id="send-btn" type="submit"
                    className="btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    disabled={isTyping || !message.trim()}
                    style={{ width: 44, height: 44, background: message.trim() ? "#005222" : "#e8e8e8", border: "none", color: message.trim() ? "#fff" : "#aaa", transition: "all 0.3s" }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Breathing Modal */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="d-flex flex-column align-items-center justify-content-center" onClick={() => setShowBreathing(false)}
            style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,82,34,0.9)", zIndex: 2000 }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-white fw-semibold">Inhala...</span>
            </motion.div>
            <p className="text-white mt-4 mb-1">Sigue el ritmo del círculo</p>
            <button className="btn btn-outline-light mt-2 rounded-pill px-4 btn-sm" onClick={() => setShowBreathing(false)}>Cerrar</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .typing-dot { width: 7px; height: 7px; background: #005222; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; }
        @keyframes typing { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
        .card { transition: transform 0.2s ease; }
      `}</style>
    </MainLayout>
  );
}

export default PsychobotPage;
