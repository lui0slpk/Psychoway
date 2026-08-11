import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import psychobotApi from "../../api/psychobot.api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, Plus, Trash2, X, MessageSquare, Wind, Bot, Thermometer, Target, Heart, Map, Calendar } from "lucide-react";

/* ═══════════════ WIDGETS ═══════════════ */

const ThermometerModal = ({ show, onClose, onSend }) => {
  const [val, setVal] = useState(5);
  const [done, setDone] = useState(false);
  const color = val < 4 ? "#dc3545" : val < 7 ? "#ffc107" : "#198754";
  const submit = () => { setDone(true); setTimeout(()=>{ onSend(`Mi nivel de ánimo es ${val}/10.`); onClose(); setDone(false); setVal(5); },1200); };
  if (!show) return null;
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="d-flex align-items-center justify-content-center" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000}} onClick={onClose}>
      <motion.div initial={{scale:.8,y:30}} animate={{scale:1,y:0}} transition={{type:"spring",damping:20}}
        className="bg-white rounded-4 shadow-lg p-4 mx-3" style={{maxWidth:380,width:"100%"}} onClick={e=>e.stopPropagation()}>
        {!done ? (<>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0 d-flex align-items-center gap-2"><Thermometer size={20} className="text-danger"/> Termómetro de Ánimo</h5>
            <button className="btn btn-sm p-1 text-muted" onClick={onClose}><X size={18}/></button>
          </div>
          <p className="text-muted mb-3">Del 1 (Muy mal) al 10 (Excelente), ¿cómo te sientes ahora?</p>
          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="fw-bold text-danger fs-5">1</span>
            <input type="range" className="form-range flex-grow-1" min="1" max="10" value={val} onChange={e=>setVal(+e.target.value)}/>
            <span className="fw-bold text-success fs-5">10</span>
          </div>
          <motion.div key={val} initial={{scale:.8}} animate={{scale:1}} className="text-center mb-3">
            <div className="fw-bold display-4" style={{color}}>{val}</div>
            <div className="small text-muted">{val<=3?"Necesitas apoyo":val<=6?"Estás en un punto medio":"¡Te sientes genial!"}</div>
          </motion.div>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:.98}} className="btn w-100 rounded-pill text-white fw-semibold py-2"
            style={{background:"linear-gradient(135deg, #005222, #001A0B)",border:"none"}} onClick={submit}>Confirmar</motion.button>
        </>) : (
          <motion.div initial={{scale:0}} animate={{scale:1}} className="text-center py-4">
            <div className="fs-1 mb-2">✅</div>
            <h5 className="text-success fw-bold">¡Registrado!</h5>
            <p className="text-muted small">Tu nivel de ánimo ha sido enviado.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};



const GroundingWidget = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { n:5, t:"cosas que puedas VER", e:"👀" }, { n:4, t:"cosas que puedas TOCAR", e:"✋" },
    { n:3, t:"cosas que puedas ESCUCHAR", e:"👂" }, { n:2, t:"olores que puedas PERCIBIR", e:"👃" },
    { n:1, t:"cosa buena que puedas SABOREAR", e:"👅" }
  ];
  const next = () => { if(step<4) setStep(step+1); else onComplete("Terminé el ejercicio 5-4-3-2-1. Me siento más presente."); };
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm border mt-2" style={{ maxWidth: 280 }}>
      <h6 className="fw-bold mb-2 d-flex align-items-center gap-2"><Wind size={16} className="text-info"/> Grounding 5-4-3-2-1</h6>
      <p className="small text-muted mb-2">Respira profundo y encuentra:</p>
      <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="text-center py-2 bg-light rounded-3 mb-2">
        <div className="fs-2 mb-1">{steps[step].e}</div>
        <div className="fw-bold text-success fs-5">{steps[step].n}</div>
        <div className="small text-dark fw-medium">{steps[step].t}</div>
      </motion.div>
      <div className="d-flex justify-content-between align-items-center">
        <span className="small text-muted fw-bold">{step+1}/5</span>
        <button className="btn btn-sm btn-info text-white rounded-pill px-3" onClick={next}>{step===4?"Terminar":"Siguiente →"}</button>
      </div>
    </div>
  );
};

const ChallengeWidget = ({ onComplete }) => {
  const challenges = ["Bebe un vaso de agua ahora mismo.","Escríbele a alguien que aprecies.","Estira los brazos por 1 minuto.","Anota 3 cosas por las que estás agradecido."];
  const [ch] = useState(challenges[Math.floor(Math.random()*challenges.length)]);
  const [done, setDone] = useState(false);
  const finish = () => { setDone(true); setTimeout(()=>onComplete("¡He completado el reto!"),800); };
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm border mt-2" style={{ maxWidth: 280 }}>
      <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-success"><Target size={16}/> Reto Express</h6>
      {!done ? (<>
        <p className="small text-dark mb-2 fw-medium">Tu misión:</p>
        <div className="p-2 border rounded-3 bg-light mb-3 small fst-italic text-center">"{ch}"</div>
        <button className="btn btn-sm btn-success w-100 rounded-pill d-flex align-items-center justify-content-center gap-2" onClick={finish}><Heart size={14}/> ¡Completado!</button>
      </>) : (<motion.div initial={{scale:.5}} animate={{scale:1}} className="text-center py-3 text-success fw-bold">🎉 ¡Genial!</motion.div>)}
    </div>
  );
};

const BodyEmotionMapModal = ({ show, onClose, onSend }) => {
  const [zone, setZone] = useState("Pecho");
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);

  const zones = {
    Cabeza: {
      desc: "Pensamientos y foco. Centro mental.",
      emotions: ["Confusión", "Estrés", "Pesadez", "Mareo", "Claridad", "Enfoque", "Migraña"],
      color: "#3f3c4c", activeColor: "#57536a"
    },
    Pecho: {
      desc: "El corazón y la respiración. Centro de la emoción.",
      emotions: ["Ansiedad", "Tristeza", "Amor", "Opresión", "Palpitaciones", "Alivio", "Miedo", "Nostalgia"],
      color: "#b04128", activeColor: "#d95030"
    },
    Abdomen: {
      desc: "El sistema digestivo. Centro de intuición.",
      emotions: ["Nervios", "Náuseas", "Vacío", "Mariposas", "Indigestión", "Calma", "Miedo"],
      color: "#5b4e3e", activeColor: "#7a6a54"
    },
    Brazos: {
      desc: "Acción y defensa. Conexión con el mundo.",
      emotions: ["Tensión", "Energía", "Debilidad", "Temblor", "Relajación"],
      color: "#253b49", activeColor: "#335165"
    },
    Piernas: {
      desc: "Movimiento y soporte. Nuestra raíz.",
      emotions: ["Pesadez", "Inquietud", "Firmeza", "Temblor", "Cansancio"],
      color: "#1e3a2e", activeColor: "#294d3e"
    }
  };

  useEffect(() => { setEmotion(""); }, [zone]);

  if (!show) return null;

  const currentZone = zones[zone];
  const outputText = emotion ? `Siento ${emotion} en la zona: ${zone.toLowerCase()}, con una intensidad de ${intensity}/10.` : "Selecciona una emoción para continuar.";

  const handleSubmit = () => {
    if (!emotion) return;
    onSend(outputText);
    onClose();
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="d-flex align-items-center justify-content-center"
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:2000}} onClick={onClose}>
      <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",damping:25}}
        className="rounded-4 shadow-lg p-0 d-flex overflow-hidden flex-column flex-md-row" 
        style={{width:"900px", maxWidth:"95%", height:"600px", background:"#1e1e1e", color:"#fff"}} 
        onClick={e=>e.stopPropagation()}>
        
        {/* Left Panel: Silhouette */}
        <div className="position-relative d-flex align-items-center justify-content-center" 
          style={{width:"100%", flex:"1", background:"#1a1a1a", borderRight:"1px solid #333"}}>
          
          <svg viewBox="0 0 300 500" width="100%" height="90%" style={{maxWidth:"250px", overflow:"visible"}}>
            <path d="M120 180 Q150 210 180 180" fill="none" stroke="#555" strokeWidth="2" />
            <path d="M110 320 L110 470 M190 320 L190 470" fill="none" stroke="#555" strokeWidth="2" />
            
            <g onClick={()=>setZone("Cabeza")} style={{cursor:"pointer", transition:"all 0.3s"}}>
              <circle cx="150" cy="80" r="35" fill={zone==="Cabeza"?zones.Cabeza.activeColor:zones.Cabeza.color} 
                stroke={zone==="Cabeza"?"#888":"none"} strokeWidth="2"/>
              {zone==="Cabeza" && <circle cx="150" cy="80" r="5" fill="rgba(255,255,255,0.5)"/>}
            </g>
            
            <g onClick={()=>setZone("Pecho")} style={{cursor:"pointer", transition:"all 0.3s"}}>
              <rect x="110" y="130" width="80" height="70" rx="15" 
                fill={zone==="Pecho"?zones.Pecho.activeColor:zones.Pecho.color}
                stroke={zone==="Pecho"?"#888":"none"} strokeWidth="2"/>
              {zone==="Pecho" && <circle cx="150" cy="165" r="8" fill="rgba(255,255,255,0.5)"/>}
            </g>
            
            <g onClick={()=>setZone("Abdomen")} style={{cursor:"pointer", transition:"all 0.3s"}}>
              <rect x="115" y="210" width="70" height="60" rx="10" 
                fill={zone==="Abdomen"?zones.Abdomen.activeColor:zones.Abdomen.color}
                stroke={zone==="Abdomen"?"#888":"none"} strokeWidth="2"/>
              {zone==="Abdomen" && <circle cx="150" cy="240" r="8" fill="rgba(255,255,255,0.5)"/>}
            </g>

            <g onClick={()=>setZone("Brazos")} style={{cursor:"pointer", transition:"all 0.3s"}}>
              <ellipse cx="85" cy="200" rx="20" ry="60" 
                fill={zone==="Brazos"?zones.Brazos.activeColor:zones.Brazos.color}
                stroke={zone==="Brazos"?"#888":"none"} strokeWidth="2"/>
              <ellipse cx="215" cy="200" rx="20" ry="60" 
                fill={zone==="Brazos"?zones.Brazos.activeColor:zones.Brazos.color}
                stroke={zone==="Brazos"?"#888":"none"} strokeWidth="2"/>
              {zone==="Brazos" && <><circle cx="85" cy="200" r="5" fill="rgba(255,255,255,0.5)"/><circle cx="215" cy="200" r="5" fill="rgba(255,255,255,0.5)"/></>}
            </g>
            
            <g onClick={()=>setZone("Piernas")} style={{cursor:"pointer", transition:"all 0.3s"}}>
              <rect x="105" y="280" width="90" height="180" rx="20" 
                fill={zone==="Piernas"?zones.Piernas.activeColor:zones.Piernas.color}
                stroke={zone==="Piernas"?"#888":"none"} strokeWidth="2"/>
              <ellipse cx="125" cy="480" rx="20" ry="10" fill="none" stroke="#555" strokeWidth="2"/>
              <ellipse cx="175" cy="480" rx="20" ry="10" fill="none" stroke="#555" strokeWidth="2"/>
              {zone==="Piernas" && <circle cx="150" cy="370" r="8" fill="rgba(255,255,255,0.5)"/>}
            </g>

            <g fill="#ccc" fontSize="12" fontFamily="sans-serif">
              <line x1="185" y1="80" x2="220" y2="80" stroke="#555" strokeWidth="1"/>
              <text x="225" y="84">Cabeza</text>
              
              <line x1="190" y1="160" x2="220" y2="160" stroke="#555" strokeWidth="1"/>
              <text x="225" y="164">Pecho</text>

              <line x1="185" y1="240" x2="220" y2="240" stroke="#555" strokeWidth="1"/>
              <text x="225" y="244">Abdomen</text>
              
              <line x1="65" y1="200" x2="40" y2="200" stroke="#555" strokeWidth="1"/>
              <text x="35" y="204" textAnchor="end">Brazos</text>
              
              <line x1="195" y1="360" x2="220" y2="360" stroke="#555" strokeWidth="1"/>
              <text x="225" y="364">Piernas</text>
            </g>
          </svg>
        </div>

        {/* Right Panel: Controls */}
        <div className="d-flex flex-column p-4 p-md-5" style={{flex:"1.2", background:"#252525"}}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h3 className="fw-bold mb-1">{zone}</h3>
              <p className="text-muted mb-0">{currentZone.desc}</p>
            </div>
            <button className="btn btn-sm text-muted p-1" style={{background:"rgba(255,255,255,0.1)", border:"none"}} onClick={onClose}><X size={20}/></button>
          </div>
          
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2">
              {currentZone.emotions.map(em => (
                <button key={em} 
                  className={`btn rounded-pill px-3 py-1 text-white border ${emotion===em ? "fw-bold" : ""}`}
                  style={{
                    background: emotion===em ? "rgba(255,255,255,0.15)" : "transparent",
                    borderColor: emotion===em ? "#fff" : "#555",
                    fontSize:"0.9rem", transition:"all 0.2s"
                  }}
                  onClick={()=>setEmotion(em)}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium text-light">Intensidad</span>
              <span className="fw-bold fs-5">{intensity}</span>
            </div>
            <input type="range" className="form-range" min="1" max="10" value={intensity} onChange={e=>setIntensity(parseInt(e.target.value))}
              style={{
                accentColor: "#888",
                height: "6px",
                background: "rgba(255,255,255,0.1)"
              }}/>
            
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:.98}} 
              className="btn w-100 rounded-3 text-white fw-bold py-3 mt-5"
              style={{ background: emotion ? "#333" : "#222", border:"1px solid #444", cursor: emotion ? "pointer" : "not-allowed" }}
              disabled={!emotion} onClick={handleSubmit}>
              Enviar al bot →
            </motion.button>
          </div>

          <div className="mt-auto pt-3 border-top" style={{borderColor:"#333 !important"}}>
            <div className="p-3 rounded-pill text-center" style={{background:"#1e1e1e", border:"1px solid #333", fontSize:"0.9rem", color:"#aaa"}}>
              {outputText}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};



/* ═══════════════ MAIN COMPONENT ═══════════════ */

function PsychobotPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showThermometer, setShowThermometer] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const personality = "empatetico";
  const messagesEndRef = useRef(null);
  const userId = user?.id || user?.id_user;

  const fetchSessions = React.useCallback(async () => {
    if (!userId) return;
    try {
      const data = await psychobotApi.getSessions(userId);
      setSessions(data);
      if (data.length > 0 && !currentSessionId) setCurrentSessionId(data[0].id_session);
    } catch (e) { console.error(e); }
  }, [userId, currentSessionId]);

  const fetchHistory = React.useCallback(async (sid) => {
    if (!sid) return;
    try {
      const data = await psychobotApi.getHistory(sid);
      setChatHistory(data.length === 0 ? [{ type:"bot", text:`¡Hola ${user?.names||""}! Soy Psychobot 🧠. ¿Cómo te sientes hoy?` }] : data);
    } catch (e) { console.error(e); }
  }, [user?.names]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { if (currentSessionId) fetchHistory(currentSessionId); }, [currentSessionId, fetchHistory]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatHistory, isTyping]);

  const handleNewChat = async () => {
    if (isTyping) return;
    try {
      const ns = await psychobotApi.createSession(userId, "Nueva Conversación");
      setSessions(p=>[ns,...p]);
      setCurrentSessionId(ns.id_session);
      setChatHistory([{type:"bot",text:"Nueva conversación. ¿En qué puedo ayudarte? 😊"}]);
      setSidebarOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Borrar esta conversación?")) return;
    try {
      await psychobotApi.deleteSession(id);
      setSessions(p=>p.filter(s=>s.id_session!==id));
      if(currentSessionId===id){setCurrentSessionId(null);setChatHistory([]);}
    } catch (e2) { console.error(e2); }
  };

  const handleSendMessage = async (msgToSend) => {
    if (!msgToSend || isTyping) return;
    setMessage("");
    setChatHistory(p=>[...p,{type:"user",text:msgToSend}]);
    setIsTyping(true);
    try {
      const data = await psychobotApi.chat({ userId, message:msgToSend, id_session:currentSessionId, personality, chatHistory:[...chatHistory,{type:"user",text:msgToSend}] });
      setChatHistory(p=>[...p,data]);
      if(!currentSessionId&&data.id_session){setCurrentSessionId(data.id_session);fetchSessions();}

      // Open modals if the bot requested them
      if(data.text?.includes("[WIDGET:THERMOMETER]")) setTimeout(()=>setShowThermometer(true),500);
      if(data.text?.includes("[WIDGET:BODY_MAP]")) setTimeout(()=>setShowBodyMap(true),500);
    } catch (e) { console.error(e); }
    finally { setIsTyping(false); }
  };

  const handleWeeklySummary = async () => {
    if (isTyping) return;
    setIsTyping(true);
    setChatHistory(p=>[...p,{type:"user",text:"¿Puedes darme mi resumen semanal?"}]);
    try {
      const data = await psychobotApi.weeklySummary(userId);
      setChatHistory(p=>[...p,data]);
      if(!currentSessionId&&data.id_session){setCurrentSessionId(data.id_session);fetchSessions();}
    } catch (e) { console.error(e); }
    finally { setIsTyping(false); }
  };

  const handleSubmit = (e) => { if(e) e.preventDefault(); handleSendMessage(message.trim()); };
  const handleQuickAction = (a) => {
    if(a==="/resumen-semanal"){handleWeeklySummary();return;}
    if(a==="/respirar"){setShowBreathing(true);return;}
    if(a==="/termometro"){setShowThermometer(true);return;}
    if(a==="/bodymap"){setShowBodyMap(true);return;}
    handleSendMessage(a);
  };

  const renderMsg = (msg) => {
    if (msg.type==="user") return msg.text;
    let t = msg.text;
    const w = [];
    if(t.includes("[WIDGET:THERMOMETER]")){t=t.replace("[WIDGET:THERMOMETER]","");}
    if(t.includes("[WIDGET:GROUNDING]")){w.push(<GroundingWidget key="gr" onComplete={handleSendMessage}/>);t=t.replace("[WIDGET:GROUNDING]","");}
    if(t.includes("[WIDGET:CHALLENGE]")){w.push(<ChallengeWidget key="ch" onComplete={handleSendMessage}/>);t=t.replace("[WIDGET:CHALLENGE]","");}
    if(t.includes("[WIDGET:BODY_MAP]")){t=t.replace("[WIDGET:BODY_MAP]","");}
    if(t.includes("[SNOOPY:HAPPY]")){w.push(<img key="shappy" src="/happy_snoopy.png" alt="Happy Snoopy" style={{ width: '100%', maxWidth: '280px', borderRadius: '16px', marginTop: '15px', display: 'block', margin: '15px auto 0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />);t=t.replace("[SNOOPY:HAPPY]","");}
    if(t.includes("[SNOOPY:SAD]")){w.push(<img key="ssad" src="/sad_snoopy.png" alt="Sad Snoopy" style={{ width: '100%', maxWidth: '280px', borderRadius: '16px', marginTop: '15px', display: 'block', margin: '15px auto 0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />);t=t.replace("[SNOOPY:SAD]","");}
    return <>{t.trim()&&<div style={{ whiteSpace: "pre-wrap" }}>{t.trim()}</div>}{w}</>;
  };

  return (
    <MainLayout pageTitle="Psychobot" pageSubtitle="Tu asistente virtual interactivo" currentPage="psychobot">
      <motion.div className="container-fluid px-4 py-4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (<>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:1100}}/>
            <motion.div initial={{x:-300}} animate={{x:0}} exit={{x:-300}} transition={{type:"spring",damping:25}}
              style={{position:"fixed",top:0,left:0,height:"100vh",width:280,zIndex:1200,background:"#fff",maxWidth:"85vw"}} className="shadow-lg">
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2"><Clock size={16}/> Historial</h6>
                <button className="btn btn-sm p-1 text-muted" onClick={()=>setSidebarOpen(false)}><X size={18}/></button>
              </div>
              <div className="p-3">
                <button className="btn btn-outline-success w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 mb-3" onClick={handleNewChat}><Plus size={16}/> Nuevo Chat</button>
              </div>
              <div className="overflow-auto px-3" style={{height:"calc(100vh - 140px)"}}>
                {sessions.map(s=>(
                  <div key={s.id_session} onClick={()=>{setCurrentSessionId(s.id_session);setSidebarOpen(false);}}
                    className="p-3 mb-2 rounded-3 d-flex justify-content-between align-items-center"
                    style={{cursor:"pointer",background:currentSessionId===s.id_session?"#e8f5e9":"transparent",transition:"all 0.2s"}}>
                    <div className="text-truncate flex-grow-1 me-2 small d-flex align-items-center gap-2"><MessageSquare size={14} className="text-muted flex-shrink-0"/> {s.title}</div>
                    <Trash2 size={14} className="text-muted flex-shrink-0" style={{cursor:"pointer"}} onClick={e=>handleDeleteChat(s.id_session,e)}/>
                  </div>
                ))}
              </div>
            </motion.div>
          </>)}
        </AnimatePresence>

        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

              {/* Header */}
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom" style={{background:"#f8faf8"}}>
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-light rounded-circle d-flex align-items-center justify-content-center" onClick={()=>setSidebarOpen(true)} style={{width:38,height:38}}>
                    <Clock size={16} className="text-success"/>
                  </button>
                  <div>
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2"><Bot size={18} className="text-success"/> Psychobot</h6>
                    <small className="text-muted" style={{fontSize:"0.75rem"}}>Asistente interactivo</small>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="px-4 py-3" style={{height:460,overflowY:"auto",background:"#fff"}}>
                <div className="d-flex flex-column gap-3">
                  {chatHistory.map((msg,i)=>(
                    <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}
                      className={`d-flex ${msg.type==="user"?"justify-content-end":"justify-content-start"}`}>
                      <div style={{maxWidth:"80%"}}>
                        {msg.type!=="user"&&<small className="text-muted d-block mb-1 ms-1" style={{fontSize:"0.7rem"}}>Psychobot</small>}
                        <div className={`px-3 py-2 ${msg.type==="user"?"text-white":""}`}
                          style={{borderRadius:16,background:msg.type==="user"?"#005222":"#f0f4f0",fontSize:"0.95rem",lineHeight:1.55,color:msg.type==="user"?"#fff":"#1a1a1a"}}>
                          {renderMsg(msg)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping&&(
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="d-flex justify-content-start">
                      <div>
                        <small className="text-muted d-block mb-1 ms-1" style={{fontSize:"0.7rem"}}>Psychobot</small>
                        <div className="px-3 py-2 d-flex align-items-center gap-1" style={{borderRadius:16,background:"#f0f4f0"}}>
                          <div className="typing-dot"/><div className="typing-dot" style={{animationDelay:"0.2s"}}/><div className="typing-dot" style={{animationDelay:"0.4s"}}/>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef}/>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-top px-4 py-2" style={{background:"#fafafa"}}>
                <div className="d-flex gap-2 overflow-auto pb-1 align-items-center">
                  <button className="btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2 flex-shrink-0 shadow-sm text-white"
                      onClick={() => setShowBodyMap(true)}
                      style={{fontSize:"0.8rem", background:"#3b4252", border:"none", transition:"all 0.2s"}}>
                      <Map size={14}/> Mapa de emociones corporal
                      <span className="badge rounded-pill bg-primary" style={{fontSize:"0.6rem", padding:"0.2rem 0.4rem"}}>Nuevo</span>
                  </button>
                  {[
                    {icon:Calendar,label:"Resumen Semanal",action:"/resumen-semanal"},
                    {icon:Wind,label:"Respirar",action:"/respirar"},
                    {icon:Thermometer,label:"Evaluar Ánimo",action:"/termometro"},
                    {icon:Target,label:"Reto del día",action:"Dame un reto de bienestar para hoy."}
                  ].map((qa,i)=>(
                    <button key={i} className="btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 flex-shrink-0 shadow-sm"
                      onClick={()=>handleQuickAction(qa.action)}
                      style={{fontSize:"0.78rem",background:"#fff",border:"1px solid #e0e0e0",color:"#005222",transition:"all 0.2s"}}>
                      <qa.icon size={13}/> {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-top">
                <form className="d-flex gap-2 align-items-center" onSubmit={handleSubmit}>
                  <input type="text" className="form-control rounded-pill px-4 border-2" placeholder="Escribe tu mensaje..." style={{height:44}}
                    value={message} onChange={e=>setMessage(e.target.value)} disabled={isTyping}/>
                  <button id="send-btn" type="submit" className="btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    disabled={isTyping||!message.trim()}
                    style={{width:44,height:44,background:message.trim()?"#005222":"#e8e8e8",border:"none",color:message.trim()?"#fff":"#aaa",transition:"all 0.3s"}}>
                    <Send size={16}/>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>{showThermometer && <ThermometerModal show={showThermometer} onClose={()=>setShowThermometer(false)} onSend={handleSendMessage}/>}</AnimatePresence>
      <AnimatePresence>{showBodyMap && <BodyEmotionMapModal show={showBodyMap} onClose={()=>setShowBodyMap(false)} onSend={handleSendMessage}/>}</AnimatePresence>

      {/* Breathing Modal */}
      <AnimatePresence>
        {showBreathing&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="d-flex flex-column align-items-center justify-content-center" onClick={()=>setShowBreathing(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,82,34,0.9)",zIndex:2000}}>
            <motion.div animate={{scale:[1,1.4,1]}} transition={{duration:8,repeat:Infinity,ease:"easeInOut"}}
              style={{width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.12)",border:"2px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="text-white fw-semibold">Inhala...</span>
            </motion.div>
            <p className="text-white mt-4 mb-1">Sigue el ritmo del círculo</p>
            <button className="btn btn-outline-light mt-2 rounded-pill px-4 btn-sm" onClick={()=>setShowBreathing(false)}>Cerrar</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .typing-dot{width:7px;height:7px;background:#005222;border-radius:50%;animation:typing 1.4s infinite ease-in-out}
        @keyframes typing{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
      `}</style>
    </MainLayout>
  );
}

export default PsychobotPage;
