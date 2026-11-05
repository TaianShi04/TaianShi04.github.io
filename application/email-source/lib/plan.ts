export type Task={id:string,title:string,date:string,category:"apply"|"admin"|"toefl"|"gym",programId?:string,detail?:string};
export type Program={id:string,school:string,name:string,country:string,degree:string,officialUrl:string,applyUrl:string,applyLabel?:string,requirements:{label:string,text:string,english?:string,englishMode?:string,englishContext?:string,source:string}[],deadlines:{date:string,label:string,source:string}[],notes:string[],sources:{label:string,url:string}[],verifiedAt:string};
export type State=Record<string,boolean|string|null>;
export const targets:Record<string,string>={"lse-hro":"2026-12-04","lse-misdi":"2026-12-04","nus-hcma":"2026-11-13","ntu-maies":"2026-12-06","ntu-eai":"2026-11-29","hku-aies":"","hku-ppa":"2026-11-18","cuhk-istm":"2026-11-22","cityu-aib":"2026-11-25","penn-lst":"2026-12-23","cornell-milr":"2026-11-26","jhu-isai":"2026-12-18","uiuc-msim":"2026-11-15","osu-mhrm":"2026-11-28","buffalo-phd":"2026-11-30","rutgers-phd":"2026-11-30","monash-integrated":"2026-12-01"};
export const shortNames:Record<string,string>={"lse-hro":"LSE · 人力资源与组织","lse-misdi":"LSE · 信息系统与数字创新","nus-hcma":"NUS · 人力资本管理与分析","ntu-maies":"NTU · AI伦理与社会","ntu-eai":"NTU · 企业AI","hku-aies":"HKU · AI伦理与社会","hku-ppa":"HKU · 人口与政策分析","cuhk-istm":"CUHK · 信息科学与技术管理","cityu-aib":"CityU · 商业人工智能","penn-lst":"UPenn · 学习科学与技术","cornell-milr":"Cornell · 工业与劳动关系","jhu-isai":"JHU · 信息系统与AI","uiuc-msim":"UIUC · 信息管理","osu-mhrm":"Ohio State · 人力资源管理","buffalo-phd":"Buffalo · Management PhD","rutgers-phd":"Rutgers · IRHR PhD","monash-integrated":"Monash · Integrated PhD"};
export const commonTasks:Task[]=[
 {id:"letters-teachers",title:"修改两位老师的四封推荐信",date:"2026-11-06",category:"admin",detail:"每位老师：PhD版＋Master版，核对事实后供老师审阅。"},
 {id:"send-teachers",title:"发老师院校清单、推荐信、CV；邮件＋微信提醒",date:"2026-11-06",category:"admin"},
 {id:"contact-employer",title:"联系前雇主，确认推荐意愿和邮箱",date:"2026-11-06",category:"admin"},
 {id:"monash-eligibility",title:"确认Monash 7月入学的entry level 2资格",date:"2026-11-06",category:"admin",programId:"monash-integrated",detail:"请招生团队书面确认你的学历是否满足7月入学入口；确认后按12月1日提交目标推进。"},
 {id:"credential-evaluation",title:"启动UPenn／JHU学历逐科认证",date:"2026-11-07",category:"admin",detail:"核对两校认可机构与报告要求，再下单并安排学校寄送。认证费用另计，尚未替你购买。"},
 {id:"cv",title:"完成学术CV和硕士申请CV",date:"2026-11-08",category:"admin"},
 {id:"experience-bank",title:"整理工作经历统一底稿",date:"2026-11-08",category:"admin",detail:"机构、职位、起止年月、工时、职责与成果；研究经历按网申栏目如实分类。"},
 {id:"employer-letter",title:"前雇主推荐信草稿送审",date:"2026-11-09",category:"admin"},
 {id:"buffalo-draft",title:"Buffalo文书第一轮修改",date:"2026-11-12",category:"apply",programId:"buffalo-phd"},
 {id:"rutgers-draft",title:"Rutgers文书第一轮修改",date:"2026-11-19",category:"apply",programId:"rutgers-phd"},
 {id:"monash-final",title:"Monash全套材料定稿",date:"2026-11-27",category:"apply",programId:"monash-integrated",detail:"包含SOP、RP、CV、补充表格及入口资格确认。"},
 {id:"hk-audit",title:"核查香港三项补件与推荐信状态",date:"2026-11-30",category:"admin"},
 {id:"monash-check",title:"Monash提交前最后检查",date:"2026-11-30",category:"admin",programId:"monash-integrated"},
 {id:"p:hku-aies:essay",title:"港大AI文书定稿，等待托福出分",date:"2026-12-06",category:"apply",programId:"hku-aies",detail:"文书先完成；该项目PS为可选材料。申请账户有4周期限，出分后再创建。"},
 {id:"dec-check",title:"近期网申、视频、推荐信与送分查漏",date:"2026-12-07",category:"admin"},
 {id:"test-logistics",title:"确认托福证件、考场／设备和出行安排",date:"2026-12-10",category:"toefl"},
 {id:"toefl-exam",title:"参加托福考试",date:"2026-12-12",category:"toefl"}
];
export function chinaToday(now=new Date()){const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);return `${p.find(x=>x.type==="year")!.value}-${p.find(x=>x.type==="month")!.value}-${p.find(x=>x.type==="day")!.value}`;}
export function addDays(day:string,n:number){const d=new Date(day+"T12:00:00+08:00");d.setUTCDate(d.getUTCDate()+n);return chinaToday(d);}
export const monthDay=(s:string)=>s?`${Number(s.slice(5,7))}/${Number(s.slice(8,10))}`:"出分后";
export function targetDate(id:string,state:State){const custom=state[`date:${id}`];if(typeof custom==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(custom))return custom;if(id==="hku-aies")return typeof state.scoreDate==="string"&&state.scoreDate?addDays(state.scoreDate,1):"";return targets[id]??"";}
export function milestones(state:State):Task[]{return [...commonTasks,...Object.keys(targets).map(id=>({id:`p:${id}:submitted`,title:`${shortNames[id]} · 提交网申`,date:targetDate(id,state),category:"apply" as const,programId:id}))].sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));}
export function dailyTasks(day:string):Task[]{
 const task=(id:string,title:string,category:Task["category"]):Task=>({id:`day:${day}:${id}`,title,date:day,category});

 if(day==="2026-12-12")return [task("test-rest","考试当天：留足出行和休息时间","toefl")];
 const list:Task[]=day>"2026-12-12"?[]:day==="2026-12-11"?[task("light","托福轻复习 1—1.5小时","toefl")]:day<="2026-11-06"?[task("toefl","托福写作／口语保温 1小时","toefl")]:[
 task("writing","托福写作＋修改 60分钟","toefl"),task("speaking","托福口语＋录音复盘 30分钟","toefl"),task("rl","托福阅读／听力＋复盘 60分钟","toefl")];
 if(day>="2026-12-01"&&day<="2026-12-07")list.push(task("extra","托福弱项加练 30—60分钟","toefl"));
 if(day>="2026-12-08"&&day<="2026-12-10")list.push(task("mock","限时模拟与复盘加练 90分钟","toefl"));
 const weekday=new Date(day+"T12:00:00+08:00").getUTCDay();
 if([1,2,4,6].includes(weekday))list.push(task("gym","早上健身 07:30—09:00","gym"));
 if([2,5].includes(weekday)&&day>="2026-11-09"&&day<"2026-12-08")list.push(task("outreach","套磁／教授回复 45分钟","admin"));
 if([1,4].includes(weekday))list.push(task("references","检查推荐信状态，需要时礼貌跟进","admin"));
 return list;
}
export function checklist(id:string):{id:string,label:string,optional?:boolean}[]{
 const items=[{id:"eligibility",label:"核对学历、语言与入学资格"},{id:"transcript",label:"成绩单、学位证明等材料备齐"},{id:"cv",label:"CV定稿"},{id:"essay",label:id==="hku-aies"?"可选PS完成／决定不提交":["ntu-eai","hku-ppa","cityu-aib"].includes(id)?"核对并完成所需文书／短答":"文书／网申短答完成",optional:id==="hku-aies"},{id:"language",label:"语言证明／豁免符合要求"},{id:"experience",label:"网申经历和个人信息核对"}];
 if(!["nus-hcma","ntu-eai","hku-aies","osu-mhrm"].includes(id))items.push({id:"references",label:"推荐人及提交要求核对、需要的推荐信已齐"});
 if(id==="osu-mhrm")items.push({id:"referees",label:"两位reference信息已填；可选推荐信另核对"});
 if(["penn-lst","jhu-isai"].includes(id))items.push({id:"evaluation",label:"学历逐科认证已按要求送达"});
 if(["jhu-isai","osu-mhrm","cornell-milr"].includes(id))items.push({id:"video",label:"按网申提示完成视频／面试环节"});
 if(id==="uiuc-msim")items.push({id:"shortanswers",label:"两道必答个人经历短文（各≤250词）完成"});
 if(id==="buffalo-phd")items.push({id:"sample",label:"独立英文写作样本（≤5页）完成"});
 if(id==="monash-integrated")items.push({id:"rp",label:"RP≤1页、SOP≤500词与补充表核对"});
 items.push({id:"submitted",label:"网申已提交并完成所需付款"},{id:"complete",label:"申请系统显示必需材料齐全"});
 return items;
}
