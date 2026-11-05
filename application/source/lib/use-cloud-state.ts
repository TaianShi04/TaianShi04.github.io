"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { State } from "./plan";
export function useCloudState(userId:string) {
  const storageKey=`application-hub-v1:${userId}`;
  const [state,setState]=useState<State>({});
  const [status,setStatus]=useState("正在同步");
  const [ready,setReady]=useState(false);
  const current=useRef<State>({});
  const pending=useRef<State>({});
  const busy=useRef(false);
  const saveLocal=useCallback(()=>{try{localStorage.setItem(storageKey,JSON.stringify({state:current.current,pending:pending.current}));}catch{/* Cloud sync remains available when browser storage is disabled. */}},[storageKey]);
  const sync=useCallback(async()=>{
    if(busy.current)return;
    busy.current=true;
    try {
      for(const [key,value] of Object.entries(pending.current)){
        setStatus("正在保存");
        const r=await fetch("/api/state",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,value})});
        if(!r.ok)throw new Error(r.status===401?"请重新登录":"暂未同步");
        if(pending.current[key]===value)delete pending.current[key];
        saveLocal();
      }
      const r=await fetch("/api/state",{cache:"no-store"});
      if(!r.ok)throw new Error(r.status===401?"请重新登录":"暂未同步");
      const data=await r.json() as {state:State};
      current.current={...data.state,...pending.current};
      setState(current.current);saveLocal();setStatus(Object.keys(pending.current).length?"正在保存":"已同步");
    }catch(e){setStatus(e instanceof Error?e.message:"暂未同步");}
    finally{busy.current=false;setReady(true);}
  },[saveLocal]);
  useEffect(()=>{
    try {const data=JSON.parse(localStorage.getItem(storageKey)||"{}");current.current=data.state||{};pending.current=data.pending||{};setState(current.current);}catch{}
    void sync();
    const timer=setInterval(()=>void sync(),15000);
    const focus=()=>void sync();window.addEventListener("focus",focus);window.addEventListener("online",focus);
    return()=>{clearInterval(timer);window.removeEventListener("focus",focus);window.removeEventListener("online",focus);};
  },[storageKey,sync]);
  const update=useCallback((key:string,value:boolean|string|null)=>{
    pending.current[key]=value;current.current={...current.current,[key]:value};
    setState(current.current);setStatus("正在保存");saveLocal();void sync();
  },[saveLocal,sync]);
  return {state,status,ready,update,sync};
}
