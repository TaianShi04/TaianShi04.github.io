import {createClient} from '@supabase/supabase-js';
export const client=createClient('https://flfaxtpgvselzjjmxouv.supabase.co','sb_publishable_mfZHHcKyjK4jHZElDsplJw_8hTwmN4_');
export async function stateRequest(_url:string, options?:RequestInit){
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user)return new Response('',{status:401});
 if(options?.method==='PUT'){
  const {key,value}=JSON.parse(options.body as string);
  const {error}=await client.from('application_progress').upsert({user_id:user.id,state_key:key,value});
  return new Response('',{status:error?503:200});
 }
 const {data,error}=await client.from('application_progress').select('state_key,value');
 return new Response(JSON.stringify({state:Object.fromEntries((data||[]).map(r=>[r.state_key,r.value]))}),{status:error?503:200});
}
export function validateBackup(raw:unknown):Record<string,boolean|string|null>{
 if(!raw||typeof raw!=='object'||!('state' in raw))throw new Error('请选择原网站导出的进度 JSON 文件');
 const state=(raw as {state:unknown}).state;
 if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('备份格式不正确');
 const entries=Object.entries(state);
 if(entries.length>5000)throw new Error('备份记录过多');
 for(const [k,v] of entries)if(!/^[a-zA-Z0-9_:/.-]{1,180}$/.test(k)||!(v===null||typeof v==='boolean'||typeof v==='string')||(typeof v==='string'&&v.length>10000))throw new Error('备份中包含不支持的记录');
 return state as Record<string,boolean|string|null>;
}
