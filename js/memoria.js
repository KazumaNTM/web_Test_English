/* ============================================================
   MEMORIA — único módulo con acceso a la persistencia
   ============================================================ */
const Memoria=(()=>{
"use strict";
const K_PRO="tv:progreso",K_SES="tv:sesion",K_TEMA="tv:tema";
const VERSION=1;
let lsOK=true;

function lsGet(k){try{return localStorage.getItem(k);}catch(e){lsOK=false;return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true;}catch(e){lsOK=false;return false;}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}}

/* Huella estable de pregunta (FNV-1a 32 bits) — sobrevive reordenamientos */
function hash(txt){
  let h=0x811c9dc5;
  for(let i=0;i<txt.length;i++){h^=txt.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return "q"+(h>>>0).toString(36);
}

function vacio(){return{version:VERSION,intentos:[]};}
function leer(){
  const raw=lsGet(K_PRO);
  if(!raw)return vacio();
  try{
    const d=JSON.parse(raw);
    if(!d||d.version!==VERSION||!Array.isArray(d.intentos))return vacio();
    return d;
  }catch(e){return vacio();}
}
function guardar(d){return lsSet(K_PRO,JSON.stringify(d));}

/* ---- Intentos ---- */
function registrar(intento){
  const d=leer();
  d.intentos.push(intento);
  guardar(d);
  escribirArchivo(d);
}
function historial(bancoId){
  return leer().intentos.filter(i=>i.bancoId===bancoId);
}
function stats(bancoId){
  const h=historial(bancoId);
  if(!h.length)return{intentos:0,mejor:0,media:0,tiempoTotal:0};
  let t=0;
  const ps=h.map(i=>{t+=i.tiempoSeg||0;return i.porcentaje;});
  return{intentos:h.length,mejor:Math.max(...ps),media:Math.round(ps.reduce((a,b)=>a+b,0)/ps.length),tiempoTotal:t};
}
/* Falladas "actuales": la última vez que cada pregunta apareció, falló */
function falladasActuales(bancoId){
  const estado={};
  leer().intentos.forEach(i=>{
    if(i.bancoId!==bancoId)return;
    (i.acertadas||[]).forEach(h=>{delete estado[h];});
    (i.falladas||[]).forEach(h=>{estado[h]=1;});
  });
  return Object.keys(estado);
}
function borrar(){guardar(vacio());escribirArchivo(vacio());}

/* ---- Exportar / Importar ---- */
function exportarJSON(){return JSON.stringify(leer(),null,2);}
function claveIntento(i){return[i.bancoId,i.fecha,i.filtro||"",i.modo,i.total,i.aciertos].join("|");}
function importarJSON(txt){
  let d;
  try{d=JSON.parse(txt);}catch(e){return{ok:false,msg:"El archivo no es JSON válido."};}
  if(!d||d.version!==VERSION||!Array.isArray(d.intentos))
    return{ok:false,msg:"La estructura no coincide con el formato esperado (versión "+VERSION+")."};
  const actual=leer();
  const vistos=new Set(actual.intentos.map(claveIntento));
  let nuevos=0;
  for(const i of d.intentos){
    const k=claveIntento(i);
    if(!vistos.has(k)){actual.intentos.push(i);vistos.add(k);nuevos++;}
  }
  actual.intentos.sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
  guardar(actual);
  escribirArchivo(actual);
  return{ok:true,nuevos};
}

/* ---- Archivo vinculado (File System Access, PC/Chromium) ---- */
let handle=null,handlePendiente=null;
function soportaArchivo(){return typeof window!=="undefined"&&typeof window.showSaveFilePicker==="function";}
function estadoArchivo(){
  if(!soportaArchivo())return"no-soportado";
  if(handle)return"activo";
  if(handlePendiente)return"pendiente";
  return"no-vinculado";
}
function idb(){
  return new Promise((res,rej)=>{
    const rq=indexedDB.open("test-verbos",1);
    rq.onupgradeneeded=()=>{rq.result.createObjectStore("kv");};
    rq.onsuccess=()=>res(rq.result);
    rq.onerror=()=>rej(rq.error);
  });
}
async function guardarHandleIDB(h){
  try{const db=await idb();db.transaction("kv","readwrite").objectStore("kv").put(h,"handle");}catch(e){}
}
async function leerHandleIDB(){
  try{
    const db=await idb();
    return await new Promise((res,rej)=>{
      const rq=db.transaction("kv").objectStore("kv").get("handle");
      rq.onsuccess=()=>res(rq.result||null);
      rq.onerror=()=>rej(rq.error);
    });
  }catch(e){return null;}
}
async function vincularArchivo(){
  if(!soportaArchivo())return{ok:false,msg:"Tu navegador no soporta vincular archivos (disponible en Brave/Chrome de escritorio)."};
  try{
    const h=await window.showSaveFilePicker({
      suggestedName:"progreso.json",
      types:[{description:"Progreso del test (JSON)",accept:{"application/json":[".json"]}}]
    });
    handle=h;handlePendiente=null;
    await guardarHandleIDB(h);
    await escribirArchivo(leer());
    return{ok:true};
  }catch(e){return{ok:false,msg:"Vinculación cancelada."};}
}
async function escribirArchivo(datos){
  if(!handle)return;
  try{
    const w=await handle.createWritable();
    await w.write(JSON.stringify(datos,null,2));
    await w.close();
  }catch(e){handle=null;}
}
async function reactivar(){
  const h=handle||handlePendiente;
  if(!h)return{ok:false,msg:"No hay archivo vinculado."};
  try{
    if(await h.requestPermission({mode:"readwrite"})!=="granted")return{ok:false,msg:"Permiso denegado."};
    handle=h;handlePendiente=null;
    await escribirArchivo(leer());
    return{ok:true};
  }catch(e){return{ok:false,msg:"No se pudo reactivar el vínculo."};}
}
async function desvincular(){
  handle=null;handlePendiente=null;
  try{const db=await idb();db.transaction("kv","readwrite").objectStore("kv").delete("handle");}catch(e){}
}
async function init(){
  const h=await leerHandleIDB();
  if(!h)return;
  try{
    if(await h.queryPermission({mode:"readwrite"})==="granted")handle=h;
    else handlePendiente=h;
  }catch(e){handlePendiente=h;}
}

/* ---- Sesión en curso (reanudar test interrumpido) ---- */
function guardarSesion(s){lsSet(K_SES,JSON.stringify(s));}
function leerSesion(){
  const raw=lsGet(K_SES);
  if(!raw)return null;
  try{return JSON.parse(raw);}catch(e){return null;}
}
function borrarSesion(){lsDel(K_SES);}

/* ---- Tema ---- */
function leerTema(){
  const t=lsGet(K_TEMA);
  return t==="claro"||t==="oscuro"?t:null;
}
function guardarTema(t){lsSet(K_TEMA,t);}

function disponible(){return lsOK;}

return{VERSION,hash,leer,registrar,historial,stats,falladasActuales,borrar,
  exportarJSON,importarJSON,vincularArchivo,reactivar,desvincular,estadoArchivo,soportaArchivo,init,
  guardarSesion,leerSesion,borrarSesion,leerTema,guardarTema,disponible};
})();