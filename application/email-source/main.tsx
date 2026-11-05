import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {User} from '@supabase/supabase-js';
import Planner from './app/planner';
import {client,validateBackup} from './lib/backend';
import './app/globals.css';
import './login.css';
function App(){
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[email,setEmail]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[version,setVersion]=useState(0);
 useEffect(()=>{client.auth.getUser().then(({data})=>{setUser(data.user);setLoading(false)});const {data}=client.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null);setLoading(false)});return()=>data.subscription.unsubscribe()},[]);
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');const {error}=await client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:'https://taianshi04.github.io/apply/'}});setMessage(error?'发送失败：'+error.message:'登录链接已发送，请到邮箱打开邮件中的链接。');setBusy(false)}
 async function importFile(file?:File){if(!file||!user)return;setBusy(true);try{if(file.size>2000000)throw new Error('备份文件过大');const state=validateBackup(JSON.parse(await file.text()));const {data,error}=await client.from('application_progress').select('state_key');if(error)throw error;const existing=new Set((data||[]).map(x=>x.state_key));const rows=Object.entries(state).filter(([k])=>!existing.has(k)).map(([k,v])=>({user_id:user.id,state_key:k,value:v}));for(let i=0;i<rows.length;i+=100){const {error}=await client.from('application_progress').upsert(rows.slice(i,i+100),{onConflict:'user_id,state_key',ignoreDuplicates:true});if(error)throw error;}setMessage(`已导入 ${rows.length} 条进度，保留新账号已有记录。`);setVersion(v=>v+1)}catch(e){setMessage(e instanceof Error?e.message:'导入失败，请重试')}finally{setBusy(false)}}
 if(loading)return <div className="login-card">正在打开申请小站…</div>;
 if(!user)return <main className="login-card"><span className="brand-mark">A</span><h1>申请小站</h1><p>用邮箱登录，手机与电脑同步。</p><form onSubmit={send}><label>登录邮箱<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="输入你的邮箱"/></label><button className="login-primary" disabled={busy}>{busy?'正在发送…':'发送登录链接'}</button></form><p role="status">{message}</p><small>收到邮件后，点击链接即可登录。</small><p><a href="https://apply.halvedbarracuda.chatgpt.site" target="_blank" rel="noreferrer">打开原版，导出进度备份 ↗</a></p></main>;
 return <><div className="account-bar"><details><summary>账号与进度迁移</summary><p>{user.email}</p><p>首次迁移：在原版页面底部点击“导出进度备份”，再导入此处。</p><a href="https://apply.halvedbarracuda.chatgpt.site" target="_blank" rel="noreferrer">打开原版 ↗</a><label className="import-button">{busy?'正在导入…':'导入原进度'}<input type="file" accept="application/json,.json" disabled={busy} onChange={e=>void importFile(e.target.files?.[0])}/></label><button onClick={()=>client.auth.signOut()}>退出登录</button><p role="status">{message}</p></details></div><Planner key={user.id+version} userId={'email:'+user.id}/></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
