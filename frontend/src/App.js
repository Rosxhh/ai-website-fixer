import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Zap, AlertCircle, MessageSquare, X, Download, Eye, Sparkles, Layout, Columns, CheckCircle, Loader2, Play, ChevronRight, Activity, TrendingUp, Monitor, Settings, RotateCcw, RotateCw, Smartphone, Tablet, Smartphone as Mobile
} from 'lucide-react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [viewMode, setViewMode] = useState('compare'); // compare, slider, mobile, tablet
  const [sliderVal, setSliderVal] = useState(50);
  const [stylePreset, setStylePreset] = useState('modern');
  
  const [modifiedHtml, setModifiedHtml] = useState('');
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([{ sender: 'ai', text: "PRO AI Designer Ready. Feed me a URL and set your Gemini Brain in Settings! ⚙️" }]);
  const [chatInput, setChatInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [buildLogs, setBuildLogs] = useState([]);
  const [showProceed, setShowProceed] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState(new Set());

  const chatEndRef = useRef(null);
  const leftIframeRef = useRef(null);
  const rightIframeRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, buildLogs]);

  const saveApiKey = (key) => { setApiKey(key); localStorage.setItem('gemini_api_key', key); setShowSettings(false); };

  const handleSyncScroll = (e) => {
    if (viewMode !== 'compare') return;
    const { scrollTop } = e.target;
    if (leftIframeRef.current) leftIframeRef.current.contentWindow.scrollTo(0, scrollTop);
    if (rightIframeRef.current) rightIframeRef.current.contentWindow.scrollTo(0, scrollTop);
  };

  const handleAnalyze = async (u = url) => {
    if (!u) return alert("URL Required");
    setLoading(true); setEditorMode(false); setShowProceed(false); setAppliedFixes(new Set());
    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u, api_key: apiKey, style: stylePreset })
      });
      const r = await res.json();
      if (r.status === "success") {
        setData(r); setModifiedHtml(r.original_html); setHistory([r.original_html]);
        setMessages([{ sender: 'ai', text: `PRO Analysis complete for ${r.niche}. Should I begin the redesign sequence?` }]);
      } else { alert(r.message); }
    } catch (e) { alert("Backend Error"); }
    setLoading(false);
  };

  const startBuildSequence = async (fixes) => {
    if (isBuilding) return; setIsBuilding(true); setBuildLogs(["Initializing Design Engine..."]);
    let currentHtml = modifiedHtml;
    for (let i = 0; i < fixes.length; i++) {
        const fix = fixes[i]; if (appliedFixes.has(fix.id)) continue;
        setBuildStep(i + 1); setBuildLogs(prev => [...prev, fix.step]);
        await new Promise(r => setTimeout(r, 2200)); 
        const temp = document.createElement('div'); temp.innerHTML = currentHtml;
        const target = temp.querySelector(fix.selector);
        if (target) {
            if (fix.action === "prepend") target.innerHTML = fix.payload + target.innerHTML;
            else if (fix.action === "append") target.innerHTML += fix.payload;
            else if (fix.action === "replace") target.outerHTML = fix.payload;
            currentHtml = temp.innerHTML;
        }
        setAppliedFixes(prev => new Set(prev).add(fix.id)); setModifiedHtml(currentHtml);
        setHistory(prev => [...prev, currentHtml]);
    }
    setBuildLogs(prev => [...prev, "✨ Build Finalized."]); setIsBuilding(false);
    setMessages(prev => [...prev, { sender: 'ai', text: "Website Redesign Complete. Verify in the Comparison Hub." }]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history]; newHistory.pop();
    setHistory(newHistory); setModifiedHtml(newHistory[newHistory.length - 1]);
  };

  const handleChat = async (e, forced = null) => {
    if (e) e.preventDefault(); const userMsg = forced || chatInput; if (!userMsg) return;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]); setChatInput('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, niche: data?.niche })
      });
      const result = await res.json(); setMessages(prev => [...prev, { sender: 'ai', text: result.text }]);
      if (result.action === "START_BUILD" && data?.fixes) startBuildSequence(data.fixes);
      if (result.action === "PLAN_READY") setShowProceed(true);
    } catch (e) { setMessages(prev => [...prev, { sender: 'ai', text: "Offline." }]); }
  };

  if (editorMode && data) {
    const iframeWidth = viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%';
    return (
      <div className="SaaS-Container dark-theme">
        <div className="SaaS-Sidebar">
          <div className="Sidebar-Header">
             <div className="Agent-Avatar"><Zap size={20} fill="currentColor" /></div>
             <div><h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>PRO Designer</h2><span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{data.niche} Mode</span></div>
          </div>
          <div className="Chat-Interface">
            {messages.map((m, i) => (
              <div key={i} className={`Chat-Bubble ${m.sender}`}>{m.text}</div>
            ))}
            {isBuilding && (
              <div className="Build-Queue">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><Loader2 className="animate-spin" size={16} color="#6366f1" /><b>LIVE BUILD</b></div>
                 {buildLogs.map((log, i) => (<div key={i} className="Build-Step">{log}</div>))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChat} className="Sidebar-Input-Container">
             <input type="text" placeholder="Talk to Agent..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
             <button type="submit" className="SaaS-Circle-Btn"><ChevronRight size={18} /></button>
          </form>
          <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handleUndo} className="SaaS-Btn SaaS-Btn-Dark" style={{ flex: 1 }}><RotateCcw size={16} /> Undo</button>
                <div style={{ flex: 1 }} className="Dash-Stat"><Activity size={14} /><span style={{ color: '#10b981' }}>{data.scores.ui}% UI</span></div>
             </div>
             <button className="SaaS-Btn SaaS-Btn-Success" onClick={() => fetch('http://127.0.0.1:8000/api/export/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html_content: modifiedHtml }) }).then(r => r.blob()).then(b => {
                const u = window.URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = `${data.niche}_elite.html`; l.click();
             })}><Download size={18} /> Export Elite Assets</button>
          </div>
        </div>
        <div className="SaaS-Preview-Area">
          <div className="SaaS-Preview-Toolbar">
             <div className="Toolbar-Group">
                <div className="Glass-Toggle">
                  <button onClick={() => setViewMode('compare')} className={viewMode === 'compare' ? 'active' : ''}><Columns size={14} /> Split</button>
                  <button onClick={() => setViewMode('slider')} className={viewMode === 'slider' ? 'active' : ''}><Layout size={14} /> Slider</button>
                </div>
                <div className="Glass-Toggle">
                  <button onClick={() => setViewMode('mobile')} className={viewMode === 'mobile' ? 'active' : ''}><Smartphone size={14} /></button>
                  <button onClick={() => setViewMode('tablet')} className={viewMode === 'tablet' ? 'active' : ''}><Tablet size={14} /></button>
                </div>
             </div>
             <div className="Toolbar-Group">
                <div className="URL-Display"><b>{data.niche}:</b> {data.url}</div>
                <button className="SaaS-Close-Btn" onClick={() => setEditorMode(false)}><X size={18} /></button>
             </div>
          </div>
          <div className="SaaS-Iframe-Wrapper">
             <div className={`Preview-Frame-Container ${viewMode}`} style={{ width: iframeWidth }}>
               {viewMode === 'compare' ? (
                 <div className="Comparison-Grid">
                   <div className="Comparison-Slide"><div className="Tag-Compare Tag-Original">Before</div><iframe ref={leftIframeRef} srcDoc={data.original_html} /></div>
                   <div className="Comparison-Slide"><div className="Tag-Compare Tag-Improved">After</div><iframe ref={rightIframeRef} srcDoc={modifiedHtml} /></div>
                   <div className="Sync-Scroll-Overlay" onScroll={handleSyncScroll}><div style={{ height: '5000px' }}></div></div>
                 </div>
               ) : viewMode === 'slider' ? (
                 <div className="Comparison-Slider-Grid">
                   <iframe className="Slider-Iframe bg-orig" srcDoc={data.original_html} style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }} />
                   <iframe className="Slider-Iframe bg-mod" srcDoc={modifiedHtml} style={{ clipPath: `inset(0 0 0 ${sliderVal}%)` }} />
                   <input type="range" className="Slider-Range" value={sliderVal} onChange={e => setSliderVal(e.target.value)} />
                   <div className="Slider-Handle" style={{ left: `${sliderVal}%` }}></div>
                 </div>
               ) : (
                 <iframe className="Full-Preview-Iframe" srcDoc={modifiedHtml} />
               )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="Landing-Container dark-theme">
      {showSettings && (
        <div className="Modal-Overlay"><div className="Settings-Card"><h2>PRO Designer Brain</h2><p>Integrated with Google Gemini Pro. 🛸</p><input type="password" placeholder="Gemini API Key..." value={apiKey} onChange={e => setApiKey(e.target.value)} /><button onClick={() => saveApiKey(apiKey)}>Authorize</button><button className="btn-text" onClick={() => setShowSettings(false)}>Cancel</button></div></div>
      )}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="Landing-Content">
        <header className="Landing-Header"><div className="Brand"><div className="Brand-Dot"></div><h1>AI Website Fixer</h1></div><p className="Tagline">Antigravity-Grade Agentic Designer</p></header>
        <div className="Global-Analyze-Box">
           <div className="Search-Input-Wrapper">
              <input type="text" placeholder="Design URL..." value={url} onChange={e => setUrl(e.target.value)} />
              <button onClick={() => handleAnalyze()} disabled={loading} className="SaaS-Btn-Gradient">{loading ? <Loader2 className="animate-spin" /> : <Rocket />} {loading ? "Analyzing..." : "Redesign Website"}</button>
           </div>
           <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="settings-trigger" onClick={() => setShowSettings(true)}><Settings size={18} /> API Key</button>
              <select className="Style-Select" value={stylePreset} onChange={e => setStylePreset(e.target.value)}><option value="modern">Modern</option><option value="minimal">Minimal</option><option value="dark">Dark Theme</option></select>
           </div>
        </div>
        {data && !loading && (
          <div className="Dashboard-Summary">
             <div className="Score-Grid"><div className="Summary-Card"><div className="Card-Value">{data.scores.seo}%</div><div className="Card-Label">SEO</div></div><div className="Summary-Card"><div className="Card-Value">ACTIVE</div><div className="Card-Label">{data.niche}</div></div><div className="Summary-Card"><div className="Card-Value">{data.scores.ui}%</div><div className="Card-Label">Vibe</div></div></div>
             <button className="SaaS-Btn SaaS-Btn-Launch" onClick={() => setEditorMode(true)}><Monitor size={24} /> Enter Designer Suite</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
