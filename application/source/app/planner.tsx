"use client";
import {useEffect,useState,useRef} from "react";
import {ArrowUpRight,ArrowLeft,Check,CalendarDays,BookOpen,LayoutGrid,Sun,Cloud,RefreshCw,Plus,ChevronRight,CheckCircle2,Clock3,AlertCircle,Download,Search} from "lucide-react";
import programData from "../lib/programs.json";
import {useCloudState} from "../lib/use-cloud-state";
import {chinaToday,addDays,monthDay,milestones,dailyTasks,checklist,targetDate,shortNames,targets,type Program,type Task} from "../lib/plan";

const programs=programData as Program[];
const countries=["全部","英国","新加坡","中国香港","美国","澳大利亚"];
const colorClass=(p:Program)=>({"英国":"uk","新加坡":"sg","中国香港":"hk","美国":"us","澳大利亚":"au"}[p.country]||"uk");
const categoryNames={apply:"申请",admin:"材料与联络",toefl:"托福",gym:"健身"};
const alerts:Record<string,string>={
 "monash-integrated":"先确认7月入学的Entry level 2资格，再按12月1日提交。",
 "rutgers-phd":"旧制托福口语最低23；核对语言豁免或补交新成绩。",
 "hku-aies":"文书先写；托福出分后申请。创建账户后4周内或官方截止前完成，取更早。",
 "penn-lst":"海外学历逐科认证可能需要8—12周，现在就启动。",
 "jhu-isai":"提前办理认可机构的海外学历逐科认证。",
 "uiuc-msim":"主文书之外，还有两道必答短文，各不超过250词。",
 "lse-hro":"两个LSE项目在同一申请中填报，注意志愿顺序；分别准备文书。",
 "lse-misdi":"两个LSE项目在同一申请中填报，注意志愿顺序；分别准备文书。"
};
const toeflSites=[{name:"WOFO 托福",url:"https://wofo.cc/toefl"},{name:"LingoLeap 听力套题",url:"https://app.lingoleap.cn/toefl/listening?fullset=true"},{name:"Koala 备考",url:"https://app.koalakoala.xyz"}];
function ToeflLinks(){return <div className="toefl-links" aria-label="托福备考网站">{toeflSites.map(site=><a key={site.url} href={site.url} target="_blank" rel="noopener noreferrer"><span>{site.name}</span><ArrowUpRight size={19}/></a>)}</div>;}
function External({href,children,className=""}:{href:string,children:React.ReactNode,className?:string}){return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<ArrowUpRight size={15}/></a>;}
export default function Planner({userId}:{userId:string}) {
 const {state,status,ready,update,sync}=useCloudState(userId);
 const [tab,setTab]=useState("today");
 const [selected,setSelected]=useState<string|null>(null);
 const [today,setToday]=useState(chinaToday);
 const [day,setDay]=useState(chinaToday);
 const [filter,setFilter]=useState("全部");
 const [search,setSearch]=useState("");
 const [showDone,setShowDone]=useState(true);
 const [showTranslation,setShowTranslation]=useState(false);
 const [newTask,setNewTask]=useState("");
 const [note,setNote]=useState("");
 const noteDirty=useRef(false);
 const [lastDone,setLastDone]=useState<string|null>(null);
 useEffect(()=>{const tick=setInterval(()=>{const n=chinaToday();setToday(old=>{if(old!==n)setDay(d=>d===old?n:d);return n;});},30000);return()=>clearInterval(tick);},[]);
 useEffect(()=>{const onHash=()=>{const h=location.hash.slice(1);if(h.startsWith("project/")){setSelected(h.slice(8));setTab("projects");}else if(["today","timeline","projects","routine"].includes(h)){setSelected(null);setTab(h);}};onHash();window.addEventListener("hashchange",onHash);return()=>window.removeEventListener("hashchange",onHash);},[]);
 useEffect(()=>{noteDirty.current=false;},[selected]);
 useEffect(()=>{if(!noteDirty.current)setNote(selected&&typeof state[`note:${selected}`]==="string"?String(state[`note:${selected}`]):"");},[selected,state]);
 const navigate=(next:string)=>{setSelected(null);setTab(next);location.hash=next;window.scrollTo({top:0,behavior:"smooth"});};
 const openProgram=(id:string)=>{setSelected(id);setTab("projects");location.hash="project/"+id;window.scrollTo({top:0,behavior:"smooth"});};
 const allMilestones=milestones(state);
 const customTasks:Task[]=Object.entries(state).filter(([key,value])=>key.startsWith("custom:")&&typeof value==="string").flatMap(([id,value])=>{try{const t=JSON.parse(value as string);return t.title&&t.date?[{id,title:t.title,date:t.date,category:"admin" as const}]:[];}catch{return[];}});
 const allTasks=[...allMilestones,...customTasks].sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));
 const done=(id:string)=>state[`done:${id}`]===true;
 const toggle=(id:string)=>{const value=!done(id);update(`done:${id}`,value);setLastDone(value?id:null);};
 const remaining=allTasks.filter(t=>!done(t.id)&&t.date);
 const daily=dailyTasks(day);
 const dayCustom=customTasks.filter(t=>t.date===day);
 const near=remaining.filter(t=>t.date<=addDays(day,2));
 const visiblePriorities=day>="2026-12-08"&&day<="2026-12-11"?[...daily.filter(t=>t.category==="toefl"),...near].slice(0,3):[...near.slice(0,2),...(daily.filter(t=>t.category==="toefl").slice(0,1))].slice(0,3);
 const fallbackPriorities=visiblePriorities.length?visiblePriorities:remaining.slice(0,3);
 const submitted=programs.filter(p=>done(`p:${p.id}:submitted`)).length;
 const daysToExam=Math.max(0,Math.ceil((Date.parse("2026-12-12T00:00:00+08:00")-Date.parse(today+"T00:00:00+08:00"))/86400000));
 const currentProgram=programs.find(p=>p.id===selected);
 const progress=(p:Program)=>{const list=checklist(p.id);return {n:list.filter(x=>done(`p:${p.id}:${x.id}`)).length,total:list.length};};
 const addTask=(e:React.FormEvent)=>{e.preventDefault();if(!newTask.trim())return;update(`custom:${crypto.randomUUID()}`,JSON.stringify({title:newTask.trim(),date:day}));setNewTask("");};
 function TaskRow({task,compact=false}:{task:Task,compact?:boolean}){return <div className={`task-row task-${task.category} ${done(task.id)?"is-done":""} ${compact?"compact":""} ${task.programId?"link-row":""}`} role={task.programId?"link":undefined} tabIndex={task.programId?0:undefined} aria-label={task.programId?`查看详情：${task.title}`:undefined} onClick={()=>{if(task.programId)openProgram(task.programId);}} onKeyDown={e=>{if(task.programId&&e.target===e.currentTarget&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openProgram(task.programId);}}}>
   <button className="check-button" aria-label={`${done(task.id)?"撤销完成":"标记完成"}：${task.title}`} aria-pressed={done(task.id)} onClick={e=>{e.stopPropagation();toggle(task.id);}}>{done(task.id)&&<Check size={16}/>}</button>
   <div className="task-copy"><span className="task-title">{task.title}</span>{!compact&&task.detail&&<p className="muted small">{task.detail}</p>}
   <div className="task-meta"><span className={`tag ${task.category}`}>{categoryNames[task.category]}</span>{task.date&&<span className={task.date<day&&!done(task.id)?"late":""}>{task.date<day&&!done(task.id)?"待补 · ":""}{monthDay(task.date)}</span>}{done(task.id)&&<span className="complete-label">已完成</span>}</div></div>
   {task.programId&&<button className="icon-button" aria-label={`查看${shortNames[task.programId]}`} onClick={e=>{e.stopPropagation();openProgram(task.programId!);}}><ChevronRight size={18}/></button>}
   {task.id.startsWith("custom:")&&<button className="text-button muted small" onClick={e=>{e.stopPropagation();if(confirm("删除这条自定义任务？"))update(task.id,null);}}>删除</button>}
  </div>;}
 const completedToday=[...allTasks.filter(t=>t.date===day),...daily].filter(t=>done(t.id));
 return <div className="shell">
   <aside className="sidebar"><a className="brand" href="#today" onClick={()=>navigate("today")}><span className="brand-mark">A</span><span>申请计划<small>TAIAN · 2027</small></span></a>
   <nav aria-label="主导航">{[["today","今天",Sun],["timeline","申请时间线",CalendarDays],["projects","院校与项目",BookOpen],["routine","每日安排",Clock3]].map(([key,label,Icon])=>{const I=Icon as typeof Sun;return <button key={String(key)} className={`nav-item ${tab===key?"active":""}`} onClick={()=>navigate(String(key))}><I size={19}/>{String(label)}{key==="projects"&&<span className="nav-count">17</span>}</button>;})}</nav>
   <div className="sidebar-bottom"><p className="small muted">一步一步，按计划完成。</p><a href="/signout-with-chatgpt?return_to=%2F" target="_top" className="small muted">退出登录</a></div></aside>
   <main className="main"><header className="topbar"><span className="top-title">2027 入学申请</span><div className="top-actions"><span className={`sync-status ${status.includes("未")||status.includes("登录")?"warning":""}`} role="status"><Cloud size={15}/>{status}</span><button className="icon-button" onClick={()=>void sync()} aria-label="同步进度"><RefreshCw size={16}/></button></div></header>
   {status==="请重新登录"&&<a className="notice" href="/signin-with-chatgpt?return_to=%2F" target="_top">登录已过期，点击重新登录；未同步的修改仍保留在当前设备。</a>}
   {status==="暂未同步"&&<div className="notice">暂时无法连接云端，修改已保留在当前浏览器。恢复连接后会自动重试。</div>}
   <div className="page-content">
   {tab==="today"&&<>
     <div className="page-heading"><div><p className="eyebrow">TODAY</p><h1>{day===today?"今天，先完成这几件事。":"这一天的计划"}</h1><p className="muted">{new Date(day+"T12:00:00+08:00").toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"long",day:"numeric",weekday:"long"})} · 北京时间</p></div><div className="date-controls"><label className="sr-only" htmlFor="view-date">查看日期</label><input id="view-date" type="date" value={day} onChange={e=>{if(e.target.value)setDay(e.target.value);}}/>{day!==today&&<button className="text-button" onClick={()=>setDay(today)}>回到今天</button>}</div></div>
     <section className="priority-card"><div className="section-heading"><h2><Sun size={21}/> 最重要的三件事</h2><span className="small">按到期时间排列</span></div>{!ready?<p className="empty">正在读取你的进度…</p>:fallbackPriorities.length?fallbackPriorities.map(t=><TaskRow key={t.id} task={t}/>):<p className="empty"><CheckCircle2/> 当前没有待办，休息一下。</p>}</section>
     <div className="overview-row"><div><span className="muted small">已提交项目</span><strong>{submitted}<small> / 17</small></strong></div><div><span className="muted small">托福 · 12月12日</span><strong>{today>"2026-12-12"?"已到考后阶段":`${daysToExam} 天`}<small>总分目标5.5</small></strong></div><div><span className="muted small">当前节奏</span><strong className="text-value">{day<="2026-11-30"?"申请＋托福":day<="2026-12-07"?"托福逐步加量":day<="2026-12-12"?"托福优先":"考后申请收尾"}</strong></div></div>
     <div className="two-columns"><section><div className="section-heading"><h2>每日固定安排</h2><button className="text-button" onClick={()=>navigate("routine")}>完整作息 <ChevronRight size={15}/></button></div><ToeflLinks/><div className="paper">{daily.length?daily.map(t=><TaskRow compact key={t.id} task={t}/>):<p className="empty">考试已结束，按剩余申请进度推进。</p>}</div></section>
     <section><div className="section-heading"><h2>近期申请</h2><button className="text-button" onClick={()=>navigate("timeline")}>全部 <ChevronRight size={15}/></button></div><div className="paper">{remaining.filter(t=>t.category==="apply").slice(0,4).map(t=><TaskRow compact key={t.id} task={t}/>)}</div></section></div>
     <section><div className="section-heading"><h2>这一天的补充待办</h2></div><form className="add-task" onSubmit={addTask}><input aria-label="添加待办" maxLength={180} placeholder="添加一件要完成的事…" value={newTask} onChange={e=>setNewTask(e.target.value)}/><button className="primary-button" type="submit"><Plus size={17}/>添加</button></form>{dayCustom.map(t=><TaskRow key={t.id} task={t}/>)}</section>
     {!!completedToday.length&&<details className="completed-section"><summary>已完成 {completedToday.length} 项</summary>{completedToday.map(t=><TaskRow compact key={t.id} task={t}/>)}</details>}
     <div className="notice"><AlertCircle size={18}/><span>本周先启动学历认证、确认Monash 7月入学资格。<button className="text-button" onClick={()=>openProgram("monash-integrated")}>查看要求</button></span></div>
   </>}
   {tab==="timeline"&&<>
     <div className="page-heading"><div><p className="eyebrow">TIMELINE</p><h1>申请完成时间线</h1><p className="muted">这里是你的完成目标；官网截止日期在各项目详情中。</p></div><label className="toggle-label"><input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)}/>显示已完成</label></div>
     <div className="plan-banner"><span>11月 · 香港三项提交</span><span>12/01 · Monash开申即交*</span><span>港大AI · 托福出分后提交</span></div>
     <p className="small muted plan-footnote">* Monash先确认7月入学资格；Rutgers语言材料需另核对。网申提交与材料齐全分别勾选。</p>
     {Array.from(new Set(allTasks.filter(t=>showDone||!done(t.id)).map(t=>t.date.slice(0,7)||"after-score"))).map(month=><section className="timeline-month" key={month}><h2>{month==="after-score"?"托福出分后":`${Number(month.slice(5))}月`}</h2>{allTasks.filter(t=>(t.date.slice(0,7)||"after-score")===month&&(showDone||!done(t.id))).map(t=><div className="timeline-row" key={t.id}><span className="timeline-date">{monthDay(t.date)}</span><TaskRow task={t}/></div>)}</section>)}
     <section className="score-panel"><h2>托福出分日期</h2><p className="muted small">填写后，港大AI的提交目标自动设为次日；仍需核对成绩符合要求并完成送分。</p><input type="date" aria-label="托福出分日期" min="2026-12-12" value={String(state.scoreDate||"")} onChange={e=>update("scoreDate",e.target.value)}/></section>
   </>}
   {tab==="projects"&&!currentProgram&&<>
     <div className="page-heading"><div><p className="eyebrow">PROGRAMMES</p><h1>院校与项目</h1><p className="muted">14个硕士 · 3个博士／Integrated PhD · 点击项目查看申请信息</p></div></div>
     <div className="filter-bar"><div className="country-filters">{countries.map(c=><button key={c} className={filter===c?"selected":""} onClick={()=>setFilter(c)}>{c}</button>)}</div><label className="search-box"><Search size={17}/><input aria-label="搜索院校项目" placeholder="搜索院校或项目" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
     <div className="program-grid">{programs.filter(p=>(filter==="全部"||p.country===filter)&&`${p.school} ${p.name} ${shortNames[p.id]}`.toLowerCase().includes(search.toLowerCase())).map(p=>{const pr=progress(p);return <button className={`program-card ${colorClass(p)}`} key={p.id} onClick={()=>openProgram(p.id)}><div className="program-card-top"><span className="country-badge">{p.country}</span><ArrowUpRight size={18}/></div><h2>{p.school}</h2><p className="program-name">{p.name}</p><p className="program-cn">{shortNames[p.id]?.split(" · ")[1]}</p><div className="program-card-bottom"><span>{done(`p:${p.id}:submitted`)?"网申已提交":`计划 ${monthDay(targetDate(p.id,state))}`}</span><span>{pr.n}/{pr.total} 项</span></div><div className="progress-track"><span style={{width:`${pr.n/pr.total*100}%`}}/></div></button>;})}</div>
   </>}
   {tab==="projects"&&currentProgram&&(()=>{const p=currentProgram,pr=progress(p);return <>
     <button className="back-button" onClick={()=>navigate("projects")}><ArrowLeft size={17}/>所有项目</button>
     <div className={`detail-heading ${colorClass(p)}`}><span className="country-badge">{p.country} · {p.degree}</span><h1>{p.school}</h1><h2>{p.name}</h2><div className="detail-links"><External href={p.applyUrl} className="primary-button">{p.applyLabel||"Applicant登录／申请入口"}</External><External href={p.officialUrl} className="secondary-button">项目官网</External></div></div>
     {alerts[p.id]&&<div className="notice"><AlertCircle size={19}/><span>{alerts[p.id]}</span></div>}
     <div className="detail-columns"><section className="checklist-panel"><div className="section-heading"><h2>申请清单</h2><span className="muted small">{pr.n}/{pr.total}</span></div><div className="progress-track"><span style={{width:`${pr.n/pr.total*100}%`}}/></div>{checklist(p.id).map(item=><TaskRow compact key={item.id} task={{id:`p:${p.id}:${item.id}`,title:item.label,date:"",category:"apply"}}/>)}<p className="small muted">核对项用于确认材料，不表示每校要求相同。具体必交内容以下方官网要求和网申为准。</p>
      <label className="date-label">我的计划提交日<input type="date" value={targetDate(p.id,state)} onChange={e=>update(`date:${p.id}`,e.target.value)}/></label>{p.id==="hku-aies"&&<p className="small muted">默认等待托福出分，也可自行调整。</p>}
      <label className="note-label">我的备注<textarea placeholder="记录待确认的问题、反馈或下一步…" value={note} onChange={e=>{noteDirty.current=true;setNote(e.target.value);}} onBlur={()=>{noteDirty.current=false;update(`note:${p.id}`,note);}} maxLength={10000}/></label><span className="small muted">离开输入框后自动保存</span>
     </section><section className="requirements-panel"><h2>官网日期</h2><div className="deadline-list">{p.deadlines.map((d,i)=><div key={i}><strong>{d.date==="rolling"?"滚动录取":d.date}</strong><span>{d.label}</span></div>)}</div><div className="section-heading requirements-heading"><h2>Application requirements</h2><External href={p.officialUrl} className="source-link">官网要求</External></div><p className="small muted english-explanation">官网英文短引与要求字段；完整措辞见官网。</p><label className="toggle-label translation-toggle"><input type="checkbox" checked={showTranslation} onChange={e=>setShowTranslation(e.target.checked)}/>显示中文翻译</label><div className="requirements">{p.requirements.map((r,i)=><section key={i}><h3>{r.label}</h3>{r.englishContext&&<p className="english-context" lang="en">{r.englishContext}</p>}<p className={`english-requirement ${r.englishMode==="quote"?"official-quote":""}`} lang="en">{r.english || "Official English details are being verified."}</p>{showTranslation&&<p className="translation" lang="zh-CN">{r.text}</p>}</section>)}</div>
      {!!p.notes.length&&<section className="notes-block"><h2>需要注意</h2><ul>{p.notes.map((n,i)=><li key={i}>{n}</li>)}</ul></section>}
      <details className="sources-block"><summary>其他官网链接</summary>{p.sources.map((s,i)=><External key={i} href={s.url}>{s.label}</External>)}</details><p className="small muted verification-note">资料核对：{p.verifiedAt}。条件以官网及网申为准。</p>
     </section></div>
   </>;})()}
   {tab==="routine"&&<>
    <div className="page-heading"><div><p className="eyebrow">DAILY RHYTHM</p><h1>把时间留给最重要的事。</h1><p className="muted">健身每周4天，第5天可选；每天21:00收工。</p></div></div>
    <div className="routine-grid"><section><h2>典型健身日</h2><div className="routine-list">{[
     ["06:00—07:10","起床、早餐，准备出门","rest"],["07:10—10:30","通勤、健身、回家洗澡","gym"],["10:30—12:30","博士文书／最紧急的文书","apply"],["12:30—13:30","午饭、休息","rest"],["13:30—15:30","硕士文书／修改反馈","apply"],["15:30—16:00","休息","rest"],["16:00—17:30","托福：写作60分＋口语30分","toefl"],["17:30—19:00","晚饭、休息","rest"],["19:00—20:00","托福：读听轮换＋复盘","toefl"],["20:00—20:45","网申、邮件、推荐信／套磁","admin"],["20:45—21:00","确定明天三件事","admin"],["21:00—22:30","放松，准备睡觉","rest"]].map(([time,title,tone])=><div className="routine-row" key={time}><time>{time}</time><span className={`routine-block ${tone}`}>{title}</span></div>)}</div></section><section><h2>托福备考节奏</h2><ToeflLinks/><p className="goal-line">总分 <strong>5.5</strong> · 写作按 <strong>5.5</strong> 准备</p>{[["11/05—06","每天1小时","推荐信收尾，保留写作和口语。"],["11/07—30","每天2.5小时","写作修改、口语录音，读听轮换。"],["12/01—07","每天3—3.5小时","从申请时段调出30—60分钟。"],["12/08—10","每天约4小时","托福优先，文书暂停新增。"],["12/11","轻复习1—1.5小时","确认考务，早点结束。"],["12/12","考试","当天不安排文书。"]].map(([date,hours,desc])=><div className="study-phase" key={date}><span className="tag toefl">{date}</span><h3>{hours}</h3><p className="small muted">{desc}</p></div>)}<div className="routine-notes"><p>每周一次模考，替换普通练习。</p><p>周一、二、四、六健身；非健身日用于模考或缓冲。</p><p>每周留一个下午休息；套磁每周两次，12/8—11暂停。</p></div><External href="https://www.ets.org/toefl/test-takers/ibt/prepare.html" className="secondary-button">ETS官方备考</External></section></div>
   </>}
   </div><footer><span>Taian · Application planner</span><button className="text-button small" onClick={()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),state},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`application-progress-${today}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}}><Download size={14}/>导出进度备份</button></footer>
   </main>
   {lastDone&&<div className="toast" role="status"><CheckCircle2 size={18}/>已标记完成<button onClick={()=>{update(`done:${lastDone}`,false);setLastDone(null);}}>撤销</button><button aria-label="关闭完成提示" onClick={()=>setLastDone(null)}>关闭</button></div>}
 </div>;
}
