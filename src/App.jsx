import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// --- PROJECT DATA ---
const projectsData = [
  {
    id: 1,
    title: "Bharat-Setu Platform",
    tags: ["Python", "AI Integration"],
    shortDesc: "Designed an AI-powered rural resilience platform for the 'AI for Bharat' hackathon. Engineered carbon market and digital twin integration.",
    architecture: "Python backend utilizing predictive analytical models, integrated with environmental APIs to simulate real-time carbon market data.",
    challenge: "Managing computational integrity and ensuring real-time data synchronization between the predictive AI models and the frontend without blocking the main thread.",
    impact: "Successfully architected a scalable blueprint for rural ecological resilience, demonstrating a high-level integration of sustainability concepts with modern AI."
  },
  {
    id: 2,
    title: "AI-Powered Financial Web App",
    tags: ["React", "JS", "Gemini API"],
    shortDesc: "Architected a responsive platform for automated data processing. Integrated Gemini API for custom analytical agents to streamline workflows.",
    architecture: "React.js frontend communicating with custom analytical agents powered by the Google Generative AI SDK (Gemini API).",
    challenge: "Prompt-engineering the LLM to consistently return structured financial data (JSON) instead of conversational text, ensuring the frontend UI wouldn't break.",
    impact: "Streamlined complex analytical workflows, creating a highly responsive and autonomous user experience that processes data with minimal human intervention."
  },
  {
    id: 3,
    title: "DeepFake Video Detection Model",
    tags: ["Python", "Machine Learning"],
    shortDesc: "Built a deep learning model to detect synthetic media, applying advanced analytical techniques to optimize classification accuracy.",
    architecture: "Python-based deep learning pipeline utilizing Convolutional Neural Networks (CNNs) for frame-by-frame spatial analysis of video datasets.",
    challenge: "Overcoming high computational load and mitigating false positives on heavily compressed or low-resolution video files.",
    impact: "Applied advanced optimization techniques to refine the classification accuracy, resulting in a robust model capable of reliably identifying synthetic media manipulation."
  },
  {
    id: 4,
    title: "PokeDex Web Application",
    tags: ["React.js", "JavaScript", "HTML5"],
    shortDesc: "Developed a dynamic, interactive web application utilizing efficient state management and data rendering for complex visual datasets.",
    architecture: "Component-driven React frontend architecture, utilizing advanced hooks for state management and integrating with external RESTful APIs to fetch dynamic datasets.",
    challenge: "Optimizing rendering performance and managing asynchronous state updates when handling large, image-heavy API payloads to ensure a seamless user experience.",
    impact: "Demonstrated strong mastery of modern React paradigms, resulting in a highly performant, visually engaging application capable of handling complex UI states."
  }
];

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); 
  
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Yash's AI Assistant, powered by Gemini. Ask me anything about his tech stack, experience, or projects." }
  ]);
  const chatEndRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBotTyping]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProject]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in the required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "YOUR_WEB3FORMS_ACCESS_KEY_HERE", 
          name: formData.name, email: formData.email, phone: formData.mobile, message: formData.message, subject: "New Portfolio Message",
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Message Sent Successfully!');
        setFormData({ name: '', email: '', mobile: '', message: '' });
      } else { alert('Error sending message.'); }
    } catch (error) { alert('Network error. Please try again.'); } finally { setIsSubmitting(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      const systemInstruction = `
        You are an AI assistant integrated into the professional portfolio of Yash Bhalchandra Hulge. 
        Your job is to answer questions about Yash in a concise, professional tone. Keep answers short.
        Facts: Student at Savitribai Phule Pune University (NMIET) with 8.4 CGPA. Frontend developer (HTML5, CSS3, JavaScript, React.js), Python, C++. AI Intern at Coincent. Projects: Bharat-Setu, AI Financial Web App, DeepFake Model, PokeDex Web App. Email: hulgeyash12@gmail.com
      `;
      const history = messages.map(msg => ({ role: msg.sender === 'bot' ? 'model' : 'user', parts: [{ text: msg.text }] }));
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chat = model.startChat({
        history: [ { role: 'user', parts: [{ text: systemInstruction }] }, { role: 'model', parts: [{ text: 'Understood.' }]}, ...history.slice(1) ],
      });
      const result = await chat.sendMessage(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: result.response.text() }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm experiencing high traffic right now. Please email Yash directly!" }]);
    } finally { setIsBotTyping(false); }
  };

  return (
    <>
      <nav className="navbar">
        <a href="#" className="nav-logo" onClick={(e) => {e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'})}}>Yash Hulge</a>
        <div className="nav-links">
          <button onClick={() => scrollToSection('about')}>About</button>
          <button onClick={() => scrollToSection('skills')}>Skills</button>
          <button onClick={() => scrollToSection('projects')}>Projects</button>
          <button onClick={() => scrollToSection('experience')}>Experience</button>
          <button onClick={() => scrollToSection('contact')}>Contact</button>
        </div>
      </nav>

      <div className="container">
        
        <motion.section id="about" className="hero-section" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.h1 variants={fadeInUp}>Hi, I'm <span className="text-gradient">Yash Bhalchandra Hulge</span></motion.h1>
          <motion.h2 variants={fadeInUp}>Computer Engineering Student & Frontend Developer</motion.h2>
          <motion.p className="hero-description" variants={fadeInUp}>
            Dedicated Computer Engineering student with a strong foundation in software development and a sharp focus on modern frontend technologies. Highly proficient in HTML5, CSS3, JavaScript, and React.js, complemented by core programming skills in Python and C++. Adept at adapting to new challenges and building user-centric applications.
          </motion.p>
          <motion.button className="btn-glow" variants={fadeInUp} onClick={() => scrollToSection('projects')}>View My Work</motion.button>
        </motion.section>

        <section id="skills" style={{ paddingTop: '4rem' }}>
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>Technical Skills</motion.h2>
          <motion.div className="skills-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3>Web/Frontend</h3><ul className="skill-list"><li>HTML5</li><li>CSS3</li><li>JavaScript</li><li>React.js</li></ul>
            </motion.div>
            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3>Programming</h3><ul className="skill-list"><li>Python</li><li>C++</li><li>SQL</li></ul>
            </motion.div>
            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3>Cloud & Databases</h3><ul className="skill-list"><li>MySQL</li><li>Google Cloud Platform</li><li>Microsoft Azure Cloud</li></ul>
            </motion.div>
            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3>Tools & Frameworks</h3><ul className="skill-list"><li>Git / GitHub</li><li>Jupyter</li><li>React-Bootstrap</li></ul>
            </motion.div>
          </motion.div>
        </section>

        <section id="projects" style={{ paddingTop: '6rem' }}>
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>Featured Projects</motion.h2>
          <motion.div className="projects-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            
            {projectsData.map((project) => (
              <motion.div key={project.id} className="project-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
                <h3>{project.title}</h3>
                <div className="tech-tags">
                  {project.tags.map((tag, idx) => <span key={idx} className="tech-tag">{tag}</span>)}
                </div>
                <p>{project.shortDesc}</p>
                <button className="read-more-btn" onClick={() => setSelectedProject(project)}>
                  Read Case Study →
                </button>
              </motion.div>
            ))}

          </motion.div>
        </section>

        <section id="experience" style={{ paddingTop: '6rem' }}>
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>Experience & Education</motion.h2>
          <motion.div className="skills-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Experience</h3>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.2rem', fontWeight: '600', fontSize: '1.05rem' }}>Coincent | Artificial Intelligence Intern</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>July 2022 - Aug 2022</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>Completed an intensive AI training program in collaboration with Microsoft and Languify, focusing on Python and deep-learning fundamentals.</p>
            </motion.div>

            <motion.div className="skill-card" variants={fadeInUp} style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Education</h3>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.2rem', fontWeight: '600', fontSize: '1.05rem' }}>Savitribai Phule Pune University | Computer Engineer</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>NMIET, Talegaon Pune</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>Aggregate: 8.4 CGPA (75.8%)<br />Awards: Runner-up at Inter-College Project Competition; Gaurav Chinha Award for Academic Excellence.</p>
            </motion.div>
          </motion.div>
        </section>

        <section id="contact" style={{ paddingTop: '6rem' }}>
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>Get In Touch</motion.h2>
          <motion.div className="contact-container" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
            <form onSubmit={validateForm}>
              <div className="form-group"><input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} disabled={isSubmitting} /></div>
              <div className="form-group"><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} disabled={isSubmitting} /></div>
              <div className="form-group"><input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleInputChange} disabled={isSubmitting} /></div>
              <div className="form-group"><textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleInputChange} disabled={isSubmitting}></textarea></div>
              <button type="submit" className="btn-glow submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</button>
            </form>
          </motion.div>
        </section>

        <footer className="footer">
          <p><a href="mailto:hulgeyash12@gmail.com">hulgeyash12@gmail.com</a> • <a href="https://www.linkedin.com/in/yash-hulge/" target="_blank" rel="noopener noreferrer">LinkedIn</a> • <a href="https://github.com/YashHulge" target="_blank" rel="noopener noreferrer">GitHub</a></p>
        </footer>
      </div>

      {/* --- CASE STUDY MODAL --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}>
            <motion.div className="modal-content" variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedProject(null)}>×</button>
              
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{selectedProject.title}</h2>
              <div className="tech-tags" style={{ marginBottom: '2rem' }}>
                {selectedProject.tags.map((tag, idx) => <span key={idx} className="tech-tag">{tag}</span>)}
              </div>

              <div className="case-study-section">
                <h4>System Architecture</h4>
                <p>{selectedProject.architecture}</p>
              </div>

              <div className="case-study-section">
                <h4>The Hardest Challenge</h4>
                <p>{selectedProject.challenge}</p>
              </div>

              <div className="case-study-section">
                <h4>Business & Technical Impact</h4>
                <p>{selectedProject.impact}</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-widget-container">
        {isChatOpen && (
          <div className="chat-window">
            <div className="chat-header"><h4>💬 Yash-Bot (Gemini)</h4><button className="close-btn" onClick={() => setIsChatOpen(false)}>×</button></div>
            <div className="chat-messages">
              {messages.map((msg, index) => (<div key={index} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>))}
              {isBotTyping && <div className="chat-bubble bot"><em>Thinking...</em></div>}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input type="text" placeholder="Ask about my projects..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isBotTyping} />
              <button type="submit" className="chat-send-btn" disabled={isBotTyping}>Send</button>
            </form>
          </div>
        )}
        {!isChatOpen && <button className="chat-toggle-btn" onClick={() => setIsChatOpen(true)}>✦</button>}
      </div>
    </>
  );
}