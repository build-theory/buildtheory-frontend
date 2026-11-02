import React, {useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

const base = (import.meta.env.VITE_CHAT_API_URL || 'https://chat-api.buildtheory.dev').replace(/\/$/, '');
async function call(path, options = {}) {
  const response = await fetch(base + '/chat-api' + path, {credentials:'include', ...options,
    headers:{'Content-Type':'application/json', ...options.headers}});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || (response.status === 401 ? 'Please sign in.' : 'Service unavailable.'));
  return data;
}

export default function Chat() {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]), [text, setText] = useState(''), [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(false), [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-6.1-sol'), [key, setKey] = useState(''), [notice, setNotice] = useState('');
  const [conversations, setConversations] = useState([]), [conversation, setConversation] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('buildtheory-chat-theme') || 'light');
  const end = useRef(null);
  const [image, setImage] = useState(null);
  function addImage(file) {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type) || file.size > 4 * 1024 * 1024) { setError('Use a PNG, JPEG, WebP or GIF image up to 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setImage(reader.result); setError(''); };
    reader.onerror = () => setError('Could not read that image.');
    reader.readAsDataURL(file);
  }
  function pasteImage(e) { const file = [...e.clipboardData.items].find(item => item.type.startsWith('image/'))?.getAsFile(); if (file) { e.preventDefault(); addImage(file); } }
  async function refresh() { const [account, list] = await Promise.all([call('/session'), call('/conversations')]); const ids = list.conversations.map(c=>c.id); const current = ids.includes(conversation) ? conversation : ids[0]; const history = await call('/messages?conversation_id='+current); setUser(account); setConversations(ids); setConversation(current); setMessages(history.messages); }
  async function openConversation(id) { try { const history = await call('/messages?conversation_id='+id); setConversation(id); setMessages(history.messages); setError(''); setNotice(''); setSettings(false); } catch(e) { setError(e.message); } }
  async function newConversation() { if (busy) return; try { const result = await call('/conversations',{method:'POST'}); setConversations(c=>[result.id,...c]); setConversation(result.id); setMessages([]); setText(''); setImage(null); setSettings(false); setError(''); setNotice(''); } catch(e) {setError(e.message);} }
  function toggleTheme() { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('buildtheory-chat-theme', next); }
  useEffect(() => { refresh().catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { end.current?.scrollIntoView?.({behavior:'smooth'}); }, [messages, busy]);
  async function login(e) { e.preventDefault(); setError(''); setBusy(true); try { await call('/login',{method:'POST', body:JSON.stringify({email,password})}); setPassword(''); await refresh(); } catch(e) {setError(e.message);} finally {setBusy(false);} }
  async function saveKey(e) { e.preventDefault(); setError(''); setBusy(true); try { await call('/keys/'+provider,{method:'PUT',body:JSON.stringify({key})}); setKey(''); await refresh(); } catch(e) {setError(e.message);} finally {setBusy(false);} }
  async function removeKey() { setError(''); try { await call('/keys/'+provider,{method:'DELETE'}); await refresh(); } catch(e) {setError(e.message);} }
  async function send(e) { e.preventDefault(); const content=text.trim(); if ((!content && !image) || busy) return; const attached = image; setImage(null); setText(''); setError(''); setNotice(''); setMessages(m=>[...m,{role:'user',content,image:attached}]); setBusy(true); try { const result=await call('/send',{method:'POST',body:JSON.stringify({provider:model.startsWith('gpt-')?'openai':'moonshot',model,content,image:attached,conversation_id:conversation})}); setMessages(m=>[...m,{role:'assistant',content:result.content}]); if(result.fallback) setNotice('OpenAI unavailable — answered by Kimi K3.1 Pro.'); } catch(e) {setError(e.message); setMessages(m=>m.slice(0,-1)); setText(content); setImage(attached);} finally {setBusy(false);} }
  if (loading) return <div className="chat-loading">Loading…</div>;
  if (!user) return <div className="chat-auth"><form onSubmit={login}><div className="chat-wordmark">buildtheory <span>/ chat</span></div><h1>Welcome back.</h1><p>Sign in to continue your conversation.</p><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="chat-error" role="alert">{error}</p>}<button disabled={busy}>Sign in</button></form></div>;
  return <div className="chat-shell" data-theme={theme}><header className="chat-head"><select className="chat-model" aria-label="Model" value={model} onChange={e=>setModel(e.target.value)}><option value="gpt-6.1-sol">GPT 6.1 Sol</option><option value="kimi-k3.1-pro">Kimi K3.1 Pro</option><option value="kimi-k3">Kimi K3</option></select><div className="chat-head-actions"><button className="chat-icon" aria-label="Previous chat" title="Previous chat" disabled={busy || conversations.indexOf(conversation) >= conversations.length-1} onClick={()=>openConversation(conversations[conversations.indexOf(conversation)+1])}>‹</button><button className="chat-icon" aria-label="Next chat" title="Next chat" disabled={busy || conversations.indexOf(conversation) <= 0} onClick={()=>openConversation(conversations[conversations.indexOf(conversation)-1])}>›</button><button className="chat-icon" aria-label="New chat" title="New chat" disabled={busy} onClick={newConversation}>＋</button><button className="chat-icon" aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} title={theme==='light'?'Dark mode':'Light mode'} onClick={toggleTheme}>{theme==='light'?'☾':'☀'}</button><button className="chat-icon" aria-label={settings?'Close settings':'Settings'} onClick={()=>{setSettings(!settings);setError('');}}>{settings?'×':'⚙'}</button></div></header>
    {settings ? <div className="chat-settings"><h1>Settings</h1><p className="chat-muted">Signed in as {user.email}</p><label>Provider<select value={provider} onChange={e=>{setProvider(e.target.value);setKey('');}}><option value="openai">OpenAI</option><option value="moonshot">Moonshot AI</option></select></label><form onSubmit={saveKey}><label>API key <span className="chat-muted">{user.providers.includes(provider)?'· saved':'· not set'}</span><input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="Enter a key to save" autoComplete="off" required/></label><div className="chat-actions"><button disabled={busy}>Save key</button>{user.providers.includes(provider)&&<button type="button" className="chat-plain" onClick={removeKey}>Remove key</button>}</div></form><p className="chat-muted">Keys are encrypted on the server and available when you sign in on another device.</p><div className="chat-actions"><button className="chat-plain" onClick={async()=>{try {await call('/logout',{method:'POST'}); setUser(null); setMessages([]); setConversations([]); setConversation(null); setSettings(false);} catch(e){setError(e.message);}}}>Sign out</button></div>{error&&<p className="chat-error" role="alert">{error}</p>}</div> : <><div className="chat-messages">{messages.length===0&&<div className="chat-empty"><h1>What’s on your mind?</h1><p>Start a conversation, or add a key in settings.</p></div>}{messages.map((m,i)=><div className={'chat-message '+m.role} key={m.id || i}><span>{m.role==='user'?'You':provider==='openai'?'Assistant':'Assistant'}</span>{m.image&&<img className="chat-image" src={m.image} alt="Attached image"/>}{m.role==='assistant'?<div className="chat-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{a:({node: _node, ...props})=><a {...props} target="_blank" rel="noopener noreferrer"/>}}>{m.content}</ReactMarkdown></div>:<div>{m.content}</div>}</div>)}{busy&&<div className="chat-muted">Thinking…</div>}<div ref={end}/></div>{notice&&<div className="chat-notice" role="status">{notice}</div>}{error&&<div className="chat-error chat-send-error" role="alert">{error}</div>}<div className="chat-input-area">{image&&<div className="chat-image-preview"><img src={image} alt="Image to send"/><button type="button" aria-label="Remove image" onClick={()=>setImage(null)}>×</button></div>}<form className="chat-composer" onSubmit={send}><textarea onPaste={pasteImage} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form.requestSubmit();}}} placeholder="Message…" aria-label="Message" maxLength={12000} rows={1}/><button disabled={busy||(!text.trim()&&!image)} aria-label="Send message">↑</button></form></div></>}
  </div>;
}
