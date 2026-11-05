import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
export const dynamic = "force-dynamic";
const response = (body: unknown, status=200) => Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET() {
  const user = await getChatGPTUser();
  if(!user) return response({error:"请登录后同步"},401);
  if(!env.DB) return response({error:"数据库暂不可用"},503);
  const rows = await env.DB.prepare("SELECT state_key, value, updated_at FROM planner_state WHERE user_id = ?").bind(user.userId).all<{state_key:string,value:string,updated_at:string}>();
  return response({state:Object.fromEntries(rows.results.map(r=>[r.state_key,JSON.parse(r.value)]))});
}
export async function PUT(req:Request) {
  const user = await getChatGPTUser();
  if(!user) return response({error:"请登录后同步"},401);
  const origin=req.headers.get("origin");
  if(origin && origin!==new URL(req.url).origin) return response({error:"不允许跨站写入"},403);
  if(req.headers.get("sec-fetch-site")==="cross-site") return response({error:"不允许跨站写入"},403);
  if(!req.headers.get("content-type")?.includes("application/json")) return response({error:"无效内容类型"},415);
  if(!env.DB) return response({error:"数据库暂不可用"},503);
  let body: {key?:unknown,value?:unknown};
  try {const raw=await req.text();if(raw.length>20000)return response({error:"内容过长"},413);body=JSON.parse(raw);} catch {return response({error:"无效内容"},400);}
  if(typeof body.key!=="string" || !/^[a-zA-Z0-9_:/.-]{1,180}$/.test(body.key))return response({error:"无效任务编号"},400);
  if(!(typeof body.value==="boolean"||typeof body.value==="string"||body.value===null))return response({error:"无效任务值"},400);
  if(typeof body.value==="string"&&body.value.length>10000)return response({error:"内容过长"},400);
  const updatedAt=new Date().toISOString();
  await env.DB.prepare("INSERT INTO planner_state (user_id,state_key,value,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id,state_key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").bind(user.userId,body.key,JSON.stringify(body.value),updatedAt).run();
  return response({ok:true,updatedAt});
}
