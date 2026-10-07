/* ============================================================
   APP — motor del test (agnóstico del contenido y del disco)
   ============================================================ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const LETRAS=["A","B","C","D","E","F"];
const SEC=BANCO.secciones;
const NBANCO=BANCO.preguntas.length;

let state={order:[],cur:0,answers:{},mode:"instant",filter:null,start:0,timerId:null,esRepaso:false,falladasHash:null};
let ultimoIntento=null,revFilter="all",overlayActivo=null,menuAbierto=false,menuCtx=null,menuTrigger=null;
let histVolver="#s-start",toastId=null,cbConfirm=null,temaActual="claro";
const secMenu=$("#secmenu");

/* ---- utilidades ---- */
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function show(id){$$(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");window.scrollTo({top:0});}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}}
function fmt(ms){const s=ms/1000|0;return String(s/60|0).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
function fmtDur(s){s=s||0;if(s<60)return s+" s";return Math.round(s/60)+" min";}
function fechaCorta(iso){const d=new Date(iso);return d.toLocaleDateString("es",{day:"2-digit",month:"short",year:"numeric"})+" · "+d.toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"});}
function huella(i){return Memoria.hash(BANCO.preguntas[i].q);}
function letra(i){return LETRAS[i]||String.fromCharCode(65+i);}
function seccionesVisibles(){return Object.keys(SEC).filter(k=>BANCO.preguntas.some(q=>q.s===k));}
function conteo(k){return BANCO.preguntas.filter(q=>q.s===k).length;}

/* ---- toast ---- */
function toast(msg){
  const t=$("#toast");
  t.textContent=msg;t.classList.remove("hidden");
  clearTimeout(toastId);toastId=setTimeout(()=>t.classList.add("hidden"),2600);
}

/* ---- overlay / modales ---- */
/* ⭐ CAMBIO: el overlay (desenfoque de página) se muestra siempre que
   el menú de secciones esté abierto, también desde la pantalla de inicio */
function sincOverlay(){$("#overlay").classList.toggle("hidden",!(!!overlayActivo||menuAbierto));}
function abrirOverlay(tipo){
  if(menuAbierto)cerrarMenu(false);
  overlayActivo=tipo;sincOverlay();
  $("#qrmodal").classList.toggle("hidden",tipo!=="qr");
  $("#confirmmodal").classList.toggle("hidden",tipo!=="confirm");
}
function cerrarOverlay(){
  overlayActivo=null;
  $("#qrmodal").classList.add("hidden");
  $("#confirmmodal").classList.add("hidden");
  if(menuAbierto)cerrarMenu(false);
  sincOverlay();
}
 $("#overlay").onclick=cerrarOverlay;
 $("#qr-close").onclick=cerrarOverlay;
 $("#qr-close2").onclick=cerrarOverlay;
 $("#cf-cancel").onclick=cerrarOverlay;
 $("#cf-ok").onclick=()=>{const cb=cbConfirm;cbConfirm=null;cerrarOverlay();if(cb)cb();};
function pedirConfirmacion(titulo,msg,txtOk,cb){
  $("#cf-titulo").textContent=titulo;
  $("#cf-msg").textContent=msg;
  $("#cf-ok").textContent=txtOk||"Sí, continuar";
  cbConfirm=cb;
  abrirOverlay("confirm");
}

/* ---- tema ---- */
function aplicarTema(t,guardar){
  temaActual=t;
  document.documentElement.setAttribute("data-theme",t);
  $("#ico-sol").style.display=t==="claro"?"none":"block";
  $("#ico-luna").style.display=t==="claro"?"block":"none";
  if(guardar)Memoria.guardarTema(t);
}
 $("#btn-tema").onclick=()=>aplicarTema(temaActual==="claro"?"oscuro":"claro",true);

/* ---- menú de secciones ---- */
function rangoLetras(){
  const ls=seccionesVisibles();
  if(ls.length<3)return ls.join("–");
  const a=ls[0].charCodeAt(0);
  if(ls.every((l,i)=>l.charCodeAt(0)===a+i))return ls[0]+"–"+ls[ls.length-1];
  return ls.join("·");
}
function itemMenu(clave,nombre,n,color){
  const b=document.createElement("button");
  b.className="sm-item";b.type="button";b.setAttribute("role","menuitemradio");
  b.dataset.sec=clave===null?"all":clave;
  b.innerHTML='<span class="sec" style="background:'+color+'">'+(clave||"T")+'</span><span class="sm-name">'+esc(nombre)+'</span><span class="sm-count">'+n+'</span><span class="sm-check">✓</span>';
  b.onclick=()=>elegirSeccion(b.dataset.sec);
  return b;
}
function construirMenu(){
  const cont=$("#sm-items");cont.innerHTML="";
  seccionesVisibles().forEach(k=>cont.appendChild(itemMenu(k,SEC[k].nombre,conteo(k),SEC[k].color)));
  const sep=document.createElement("div");sep.className="sm-sep";cont.appendChild(sep);
  cont.appendChild(itemMenu(null,"Todas las secciones",NBANCO,"linear-gradient(90deg,#6d7cff,#38bdf8)"));
  const lg=$("#sm-legend");lg.innerHTML="";
  seccionesVisibles().forEach(k=>{
    const s=document.createElement("span");
    s.innerHTML='<i style="background:'+SEC[k].color+'"></i>'+esc(k);
    lg.appendChild(s);
  });
  const nota=document.createElement("span");nota.className="sm-lgnote";
  nota.textContent="Los colores coinciden con los badges del test y las barras de resultados.";
  lg.appendChild(nota);
}
function updateFilterUI(){
  const f=state.filter;
  $("#nq").textContent=f?conteo(f):NBANCO;
  $("#secfilter").innerHTML=f
    ?"Sección "+esc(f)+'<span class="caret">▾</span>'
    :"<b>"+seccionesVisibles().length+"</b> secciones ("+esc(rangoLetras())+')<span class="caret">▾</span>';
  $("#secfilter").style.borderColor=f?SEC[f].color:"";
  $("#btn-start").textContent=f?("Comenzar: Sección "+f+" →"):"Comenzar el test →";
  $$("#sm-items .sm-item").forEach(b=>{
    const v=b.dataset.sec==="all"?null:b.dataset.sec;
    b.setAttribute("aria-checked",v===f?"true":"false");
  });
}
function abrirMenu(trigger,ctx){
  menuAbierto=true;menuCtx=ctx;menuTrigger=trigger;
  secMenu.classList.remove("hidden");
  secMenu.classList.toggle("inquiz",ctx==="quiz");
  $("#sm-title").textContent=ctx==="quiz"?"Cambiar de sección":"Elegir sección";
  const r=trigger.getBoundingClientRect();
  const w=Math.min(280,window.innerWidth-16);
  secMenu.style.left=Math.max(8,Math.min(r.left,window.innerWidth-w-8))+"px";
  secMenu.style.top=(r.bottom+8)+"px";
  trigger.setAttribute("aria-expanded","true");
  sincOverlay();
  const items=$$("#sm-items .sm-item");
  const ini=items.find(b=>b.getAttribute("aria-checked")==="true")||items[0];
  if(ini)ini.focus({preventScroll:true});
}
function cerrarMenu(refocus){
  if(!menuAbierto)return;
  menuAbierto=false;
  secMenu.classList.add("hidden");
  if(menuTrigger){
    menuTrigger.setAttribute("aria-expanded","false");
    if(refocus)menuTrigger.focus();
  }
  menuTrigger=null;menuCtx=null;
  sincOverlay();
}
function elegirSeccion(sec){
  const nf=sec==="all"?null:sec;
  const cambio=nf!==state.filter;
  const eraQuiz=menuCtx==="quiz",trig=menuTrigger;
  state.filter=nf;
  updateFilterUI();
  cerrarMenu(false);
  if(eraQuiz){
    if(cambio){Memoria.borrarSesion();startQuiz();}
    else if(trig)trig.focus();
  }else{
    $("#btn-start").focus();
  }
}
 $("#secfilter").onclick=e=>{if(menuAbierto){cerrarMenu(false);return;}abrirMenu(e.currentTarget,"start");};
 $("#qsecbtn").onclick=e=>{if(menuAbierto){cerrarMenu(false);return;}abrirMenu(e.currentTarget,"quiz");};
document.addEventListener("click",e=>{
  if(!menuAbierto)return;
  if(e.target.closest("#secmenu"))return;
  if(e.target.closest("#secfilter")||e.target.closest("#qsecbtn"))return;
  cerrarMenu(false);
});
window.addEventListener("scroll",()=>{if(menuAbierto)cerrarMenu(false);},{capture:true,passive:true});

/* ---- modo (segmented) ---- */
function pintarModo(m){
  state.mode=m;
  $("#seg-instant").classList.toggle("sel",m==="instant");
  $("#seg-final").classList.toggle("sel",m==="final");
  $("#seg-instant").setAttribute("aria-selected",m==="instant");
  $("#seg-final").setAttribute("aria-selected",m==="final");
  $("#seg").classList.toggle("pos2",m==="final");
  $("#seg-hint").textContent=m==="instant"?"Feedback y explicación tras cada respuesta":"Respondes todo y corriges de una vez";
}
 $$("#seg .seg-btn").forEach(b=>b.onclick=()=>{
  if(state.mode===b.dataset.mode)return;
  pintarModo(b.dataset.mode);
  Memoria.borrarSesion();
  ocultarBanner();
});

/* ---- sesión en curso (reanudar) ---- */
function sesionValida(s){
  return s&&s.bancoId===BANCO.meta.id&&Array.isArray(s.orden)&&s.orden.length>0&&
    s.orden.every(i=>Number.isInteger(i)&&i>=0&&i<NBANCO)&&
    s.resp&&Object.keys(s.resp).length>0&&s.cur>=0&&s.cur<s.orden.length;
}
function refrescarBanner(){
  const s=Memoria.leerSesion();
  if(sesionValida(s)){
    const et=s.falladasHash?"Repaso de falladas":(s.filtro?"Sección "+s.filtro:"Todas las secciones");
    $("#resume-info").textContent="Pregunta "+(s.cur+1)+" de "+s.orden.length+" · "+et+" · "+(s.modo==="instant"?"corrección inmediata":"corrección al final");
    $("#resume").classList.remove("hidden");
  }else ocultarBanner();
}
function ocultarBanner(){$("#resume").classList.add("hidden");}
 $("#btn-resume").onclick=continuarSesion;
 $("#btn-resume-drop").onclick=()=>{Memoria.borrarSesion();ocultarBanner();};
function continuarSesion(){
  const s=Memoria.leerSesion();
  if(!sesionValida(s))return;
  state.filter=s.filtro||null;
  pintarModo(s.modo||"instant");
  updateFilterUI();
  state.esRepaso=!!s.falladasHash;
  state.falladasHash=s.falladasHash||null;
  state.order=s.orden.slice();
  state.cur=s.cur;
  state.answers={};
  Object.keys(s.resp).forEach(k=>{state.answers[+k]=s.resp[k];});
  state.start=Date.now()-(s.transcurrido||0)*1000;
  iniciarCrono();
  show("#s-quiz");renderQ();
}
function pintarUltimo(){
  const h=Memoria.historial(BANCO.meta.id);
  const u=$("#ultimo");
  if(!h.length){u.classList.add("hidden");return;}
  const it=h[h.length-1];
  const et=it.filtro==="falladas"?"Repaso":(it.filtro?"Sección "+it.filtro:"Todas");
  u.innerHTML="Último intento: <b>"+it.aciertos+"/"+it.total+"</b> · "+esc(et)+" · "+it.porcentaje+"%";
  u.classList.remove("hidden");
}
function refrescarInicio(){updateFilterUI();refrescarBanner();pintarUltimo();}

/* ---- inicio del test ---- */
 $("#btn-start").onclick=()=>startQuiz();
function startQuiz(opts={}){
  let idxs=BANCO.preguntas.map((_,i)=>i);
  state.esRepaso=!!opts.falladas;
  state.falladasHash=opts.falladas||null;
  if(opts.falladas){
    const set=new Set(opts.falladas);
    idxs=idxs.filter(i=>set.has(huella(i)));
  }else if(state.filter){
    idxs=idxs.filter(i=>BANCO.preguntas[i].s===state.filter);
  }
  if($("#shuffle").checked)shuffle(idxs);
  if(!idxs.length){toast("No queda ninguna pregunta que repasar.");return;}
  state.order=idxs;state.cur=0;state.answers={};state.start=Date.now();
  iniciarCrono();
  show("#s-quiz");renderQ();
}
function iniciarCrono(){
  clearInterval(state.timerId);
  state.timerId=setInterval(()=>{$("#timer").textContent=fmt(Date.now()-state.start);},1000);
  $("#timer").textContent=fmt(Date.now()-state.start);
}
function guardarSesionViva(){
  if(!$("#s-quiz").classList.contains("active"))return;
  Memoria.guardarSesion({
    bancoId:BANCO.meta.id,filtro:state.filter,modo:state.mode,
    falladasHash:state.falladasHash||null,
    orden:state.order,cur:state.cur,resp:state.answers,
    transcurrido:Math.floor((Date.now()-state.start)/1000)
  });
}
 $("#btn-quit").onclick=()=>{clearInterval(state.timerId);guardarSesionViva();show("#s-start");refrescarInicio();};

/* ---- render de pregunta ---- */
function renderQ(){
  const qi=state.order[state.cur],q=BANCO.preguntas[qi],total=state.order.length,ans=state.answers[qi];
  const instant=state.mode==="instant",answered=ans!=null,reveal=instant&&answered;
  $("#qcount").textContent=(state.cur+1)+" / "+total;
  $("#prog").style.width=((state.cur+1)/total*100)+"%";
  const s=SEC[q.s]||{nombre:"—",color:"#888888"};
  $("#qsec").textContent=q.s;$("#qsec").style.background=s.color;
  $("#qseclabel").textContent=s.nombre+(state.esRepaso?" · repaso":"");
  $("#qtext").textContent=q.q;
  const box=$("#opts");box.innerHTML="";
  q.o.forEach((t,i)=>{
    const b=document.createElement("button");
    b.className="opt";b.type="button";b.disabled=reveal;
    b.innerHTML='<span class="letter">'+letra(i)+'</span><span>'+esc(t)+'</span>';
    b.onclick=()=>pick(i);
    if(reveal){
      if(i===q.c)b.classList.add("correct");
      else if(i===ans)b.classList.add("wrong");
      else b.classList.add("dim");
    }else if(i===ans)b.classList.add("sel");
    box.appendChild(b);
  });
  const fb=$("#feedback");
  if(reveal){
    fb.classList.remove("hidden");
    fb.className="feedback "+(ans===q.c?"ok":"bad");
    $("#fb-title").textContent=ans===q.c?"✔ ¡Correcto!":"✘ Incorrecto — la respuesta correcta es la "+letra(q.c)+".";
    $("#fb-expl").textContent=q.e;
  }else fb.classList.add("hidden");
  $("#btn-prev").disabled=state.cur===0;
  $("#btn-next").textContent=state.cur===total-1?"Finalizar ✓":"Siguiente →";
  $("#btn-next").disabled=instant&&!answered;
  const card=$("#qcard");card.classList.remove("pop");void card.offsetWidth;card.classList.add("pop");
  updateChip();
  guardarSesionViva();
}
function pick(i){
  const qi=state.order[state.cur];
  if(state.mode==="instant"&&state.answers[qi]!=null)return;
  state.answers[qi]=i;renderQ();
  if(state.mode==="instant")$("#feedback").scrollIntoView({behavior:"smooth",block:"nearest"});
}
 $("#btn-next").onclick=()=>{if(state.cur<state.order.length-1){state.cur++;renderQ();}else finishQuiz();};
 $("#btn-prev").onclick=()=>{if(state.cur>0){state.cur--;renderQ();}};
function updateChip(){
  const total=state.order.length;
  if(state.mode==="instant"){
    let ok=0,bad=0;
    state.order.forEach(qi=>{const a=state.answers[qi];if(a!=null){a===BANCO.preguntas[qi].c?ok++:bad++;}});
    $("#scorechip").innerHTML='<span class="okc">✔ '+ok+'</span> · <span class="badc">✘ '+bad+'</span> · pendientes '+(total-ok-bad);
  }else{
    $("#scorechip").textContent="Respondidas: "+Object.keys(state.answers).length+" / "+total;
  }
}

/* ---- resultados ---- */
function finishQuiz(){
  clearInterval(state.timerId);
  const total=state.order.length;
  let ok=0,un=0;
  const per={};seccionesVisibles().forEach(k=>per[k]=[0,0]);
  const acertadas=[],falladas=[];
  state.order.forEach(qi=>{
    const q=BANCO.preguntas[qi],a=state.answers[qi];
    if(per[q.s])per[q.s][1]++;
    if(a==null){un++;falladas.push(huella(qi));return;}
    if(a===q.c){ok++;if(per[q.s])per[q.s][0]++;acertadas.push(huella(qi));}
    else falladas.push(huella(qi));
  });
  const pct=Math.round(ok/total*100);
  const prev=Memoria.stats(BANCO.meta.id);
  const esRecord=prev.intentos>0&&pct>prev.mejor;
  Memoria.registrar({
    bancoId:BANCO.meta.id,fecha:new Date().toISOString(),
    filtro:state.esRepaso?"falladas":(state.filter||null),modo:state.mode,
    total,aciertos:ok,porcentaje:pct,
    tiempoSeg:Math.round((Date.now()-state.start)/1000),
    acertadas,falladas
  });
  Memoria.borrarSesion();
  ultimoIntento={falladas};
  $("#ring").style.setProperty("--p",pct);
  $("#ringpct").textContent=pct+"%";
  let t,m;
  if(pct>=90){t="Excelente";m="Dominio sobresaliente del material.";}
  else if(pct>=75){t="Muy bien";m="Buen dominio; repasa los fallos puntuales en la revisión.";}
  else if(pct>=60){t="Aprobado";m="Base sólida, pero conviene reforzar los patrones.";}
  else{t="Repasa la lista";m="Vuelve al material, estudia los paradigmas y reintenta el test.";}
  $("#res-title").textContent=t+" — "+ok+" de "+total+(state.esRepaso?" · repaso":"");
  $("#res-sub").textContent=m+(un>0?" · Sin responder: "+un+" (computan como error).":".");
  const st=Memoria.stats(BANCO.meta.id);
  $("#res-stats").textContent="Con este banco: "+st.intentos+" intento"+(st.intentos===1?"":"s")+" · Mejor: "+st.mejor+"% · Media: "+st.media+"%";
  $("#record").classList.toggle("hidden",!esRecord);
  $("#res-time").textContent=fmt(Date.now()-state.start);
  const el=$("#secs");el.innerHTML="";
  seccionesVisibles().forEach(k=>{
    if(!per[k]||!per[k][1])return;
    const c=per[k][0],tt=per[k][1];
    const row=document.createElement("div");row.className="secrow";
    row.innerHTML='<span class="sec" style="background:'+SEC[k].color+'">'+esc(k)+'</span><div class="secbar"><i style="width:'+Math.round(c/tt*100)+'%;background:'+SEC[k].color+'"></i></div><b class="secnum">'+c+"/"+tt+"</b>";
    el.appendChild(row);
  });
  const rf=$("#btn-retry-fail");
  if(falladas.length){rf.classList.remove("hidden");rf.textContent="Repetir mis falladas ("+falladas.length+")";}
  else rf.classList.add("hidden");
  show("#s-res");
}
 $("#btn-retry-fail").onclick=()=>startQuiz({falladas:ultimoIntento?ultimoIntento.falladas:[]});
 $("#btn-retry").onclick=()=>startQuiz();

/* ---- revisión ---- */
 $("#btn-review").onclick=()=>{renderReview();show("#s-rev");};
 $("#btn-back").onclick=()=>show("#s-res");
 $$(".rtab").forEach(b=>b.onclick=()=>{
  $$(".rtab").forEach(x=>x.classList.remove("sel"));
  b.classList.add("sel");revFilter=b.dataset.f;renderReview();
});
function renderReview(){
  const list=$("#revlist");list.innerHTML="";
  state.order.forEach((qi,pos)=>{
    const q=BANCO.preguntas[qi],a=state.answers[qi];
    if(revFilter==="wrong"&&a===q.c)return;
    const d=document.createElement("div");d.className="rev card";
    let opts="";
    q.o.forEach((t,i)=>{
      let cls="opt";
      if(i===q.c)cls+=" correct";else if(i===a)cls+=" wrong";else cls+=" dim";
      opts+='<div class="'+cls+'"><span class="letter">'+letra(i)+'</span><span>'+esc(t)+(i===a&&a!==q.c?" — tu respuesta":"")+"</span></div>";
    });
    const tag=a==null?'<span class="notans">sin responder</span>':"";
    const s=SEC[q.s]||{nombre:"—",color:"#888888"};
    d.innerHTML='<div class="qhead"><span class="sec" style="background:'+s.color+'">'+esc(q.s)+'</span><span class="seclabel">'+esc(s.nombre)+" · Pregunta "+(pos+1)+"</span>"+tag+"</div><h3>"+esc(q.q)+"</h3>"+opts+'<div class="revexp">'+esc(q.e)+"</div>";
    list.appendChild(d);
  });
  if(!list.children.length)list.innerHTML='<div class="card" style="text-align:center">No fallaste ninguna pregunta.</div>';
}

/* ---- historial ---- */
 $("#btn-hist").onclick=()=>{histVolver="#s-start";renderHist();show("#s-hist");};
 $("#btn-hist2").onclick=()=>{histVolver="#s-res";renderHist();show("#s-hist");};
 $("#btn-hist-back").onclick=()=>show(histVolver);
function btnG(txt,cb,peligro){
  const b=document.createElement("button");
  b.className="ghost"+(peligro?" peligro":"");b.type="button";b.textContent=txt;b.onclick=cb;
  return b;
}
function renderHist(){
  const body=$("#histbody");body.innerHTML="";
  const id=BANCO.meta.id;
  const st=Memoria.stats(id);
  const fall=Memoria.falladasActuales(id);
  const todos=Memoria.leer().intentos;
  /* resumen */
  const res=document.createElement("div");res.className="card histcard";
  res.innerHTML='<h3 class="hist-t">Resumen — '+esc(BANCO.meta.titulo)+'</h3><div class="histgrid">'
    +'<div class="hstat"><b>'+st.intentos+'</b><span>intentos</span></div>'
    +'<div class="hstat"><b>'+st.mejor+'%</b><span>mejor nota</span></div>'
    +'<div class="hstat"><b>'+st.media+'%</b><span>nota media</span></div>'
    +'<div class="hstat"><b>'+fmtDur(st.tiempoTotal)+'</b><span>tiempo total</span></div></div>';
  if(fall.length){
    const b=document.createElement("button");b.className="primary big";b.type="button";
    b.textContent="Entrenar mis falladas ("+fall.length+")";
    b.onclick=()=>startQuiz({falladas});
    res.appendChild(b);
  }else{
    const p=document.createElement("p");p.className="hist-ok";
    p.textContent="Sin preguntas pendientes de repaso en este banco.";
    res.appendChild(p);
  }
  body.appendChild(res);
  /* gestión */
  const ges=document.createElement("div");ges.className="card histcard";
  ges.innerHTML='<h3 class="hist-t">Documento de progreso</h3><p class="hist-note">Los intentos se guardan automáticamente en este navegador. Con el archivo <code>progreso.json</code> puedes respaldarlos, llevarlos a otro dispositivo (iPhone ↔ PC) o resetearlos a mano.</p>';
  const btns=document.createElement("div");btns.className="histbtns";
  btns.appendChild(btnG("Exportar progreso.json",()=>{descargar("progreso.json",Memoria.exportarJSON());toast("Archivo exportado.");}));
  btns.appendChild(btnG("Importar progreso.json",()=>$("#importfile").click()));
  if(Memoria.soportaArchivo()){
    const est=Memoria.estadoArchivo();
    let et,nb;
    if(est==="activo"){et="Desvincular archivo";nb="Vinculado: progreso.json se actualiza tras cada test.";}
    else if(est==="pendiente"){et="Reactivar vínculo";nb="El permiso del archivo caducó al recargar; reactívalo para seguir actualizándolo.";}
    else{et="Vincular progreso.json";nb="Guarda y actualiza el progreso en un archivo real de tu disco (PC).";}
    btns.appendChild(btnG(et,async()=>{
      if(Memoria.estadoArchivo()==="activo"){await Memoria.desvincular();toast("Archivo desvinculado.");}
      else{
        const r=Memoria.estadoArchivo()==="pendiente"?await Memoria.reactivar():await Memoria.vincularArchivo();
        toast(r.ok?"Archivo vinculado: se actualizará tras cada test.":r.msg);
      }
      renderHist();
    }));
    const np=document.createElement("p");np.className="hist-filestat";np.textContent=nb;ges.appendChild(np);
  }
  btns.appendChild(btnG("Borrar todo el progreso",()=>pedirConfirmacion(
    "¿Borrar el progreso?",
    "Se eliminarán todos los intentos registrados en este navegador (y en el archivo vinculado). Esta acción no se puede deshacer.",
    "Sí, borrar",
    ()=>{Memoria.borrar();toast("Progreso borrado.");renderHist();refrescarInicio();}
  ),true));
  ges.appendChild(btns);
  if(!Memoria.disponible()){
    const av=document.createElement("p");av.className="hist-warn";
    av.textContent="Este navegador está bloqueando el almacenamiento local: el progreso no se guardará entre sesiones. Usa exportar/importar.";
    ges.appendChild(av);
  }
  body.appendChild(ges);
  /* lista */
  const lista=document.createElement("div");lista.className="card histcard";
  lista.innerHTML='<h3 class="hist-t">Intentos registrados ('+todos.length+')</h3>';
  if(!todos.length){
    const p=document.createElement("p");p.className="hist-note";
    p.textContent="Aún no hay intentos. Termina un test para empezar tu historial.";
    lista.appendChild(p);
  }else{
    const ul=document.createElement("div");ul.className="hlist";
    [...todos].reverse().forEach(it=>{
      const row=document.createElement("div");row.className="hrow";
      const et=it.filtro==="falladas"?"Repaso":(it.filtro?"Sección "+it.filtro:"Todas");
      row.innerHTML='<span class="hfecha">'+esc(fechaCorta(it.fecha))+'</span>'
        +'<span class="hbanco">'+esc(it.bancoId)+'</span>'
        +'<span class="hetiq">'+esc(et)+'</span>'
        +'<span class="hmodo">'+(it.modo==="instant"?"inmediata":"al final")+'</span>'
        +'<b class="hnota '+(it.porcentaje>=75?"ok":it.porcentaje>=50?"mid":"bad")+'">'+it.porcentaje+'%</b>'
        +'<span class="htie">'+fmtDur(it.tiempoSeg)+'</span>';
      ul.appendChild(row);
    });
    lista.appendChild(ul);
  }
  body.appendChild(lista);
}
function descargar(nombre,texto){
  const blob=new Blob([texto],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=nombre;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
 $("#importfile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    const r=Memoria.importarJSON(rd.result);
    toast(r.ok?("Importación correcta: "+r.nuevos+" intento(s) nuevo(s)."):r.msg);
    renderHist();refrescarInicio();
  };
  rd.readAsText(f);
  e.target.value="";
};

/* ---- QR ---- */
 $("#btn-qr").onclick=abrirQR;
function abrirQR(){
  abrirOverlay("qr");
  $("#qr-canvas").style.display="none";
  $("#qr-guia").classList.add("hidden");
  $("#qr-urlzone").classList.add("hidden");
  if(location.protocol==="file:"){$("#qr-guia").classList.remove("hidden");return;}
  $("#qr-urlzone").classList.remove("hidden");
  pintarQR();
}
function esLocalhost(){
  const h=location.hostname;
  return h==="localhost"||h==="127.0.0.1"||h==="0.0.0.0"||h==="::1"||h==="[::1]";
}
function urlActual(host){
  try{
    const u=new URL(location.href);
    if(host)u.host=host;
    return u.href;
  }catch(e){return location.href;}
}
function pintarQR(){
  const host=$("#qr-host").value.trim();
  const url=urlActual(host||null);
  $("#qr-url").textContent=url;
  const ok=QR.dibujar($("#qr-canvas"),url,240);
  $("#qr-canvas").style.display=ok?"block":"none";
  $("#qr-aviso").classList.toggle("hidden",!esLocalhost());
  $("#qr-hostwrap").classList.toggle("hidden",!esLocalhost());
}
 $("#qr-host").addEventListener("input",pintarQR);
async function copiar(txt){
  try{await navigator.clipboard.writeText(txt);toast("Copiado al portapapeles.");}
  catch(e){
    const ta=document.createElement("textarea");ta.value=txt;
    document.body.appendChild(ta);ta.select();
    try{document.execCommand("copy");toast("Copiado al portapapeles.");}
    catch(e2){toast("No se pudo copiar; selecciónalo manualmente.");}
    ta.remove();
  }
}
 $("#qr-copy").onclick=()=>copiar($("#qr-url").textContent);
 $("#qr-guia-copy").onclick=()=>copiar("python -m http.server 8000");

/* ---- teclado ---- */
document.addEventListener("keydown",e=>{
  if(overlayActivo){
    if(e.key==="Escape"){e.preventDefault();cerrarOverlay();}
    return;
  }
  if(menuAbierto){
    if(e.key==="Escape"){e.preventDefault();cerrarMenu(true);return;}
    if(e.key==="Tab"){cerrarMenu(false);return;}
    const items=$$("#sm-items .sm-item");
    const idx=items.indexOf(document.activeElement);
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      e.preventDefault();
      const n=e.key==="ArrowDown"?(idx+1)%items.length:(idx-1+items.length)%items.length;
      items[Math.max(0,n)].focus({preventScroll:true});return;
    }
    if(e.key==="Home"){e.preventDefault();items[0].focus({preventScroll:true});return;}
    if(e.key==="End"){e.preventDefault();items[items.length-1].focus({preventScroll:true});return;}
    return;
  }
  if(!$("#s-quiz").classList.contains("active"))return;
  const qi=state.order[state.cur];
  if(qi==null)return;
  const n=BANCO.preguntas[qi].o.length;
  const k=e.key.toLowerCase();
  let sel=-1;
  if(/^[1-9]$/.test(k)&&+k<=n)sel=+k-1;
  else if(/^[a-z]$/.test(k)){const code=k.charCodeAt(0)-97;if(code<n)sel=code;}
  if(sel>=0&&!e.metaKey&&!e.ctrlKey&&!e.altKey){pick(sel);return;}
  if(e.key==="ArrowRight"&&!$("#btn-next").disabled)$("#btn-next").click();
  else if(e.key==="ArrowLeft"&&!$("#btn-prev").disabled)$("#btn-prev").click();
});

/* ---- persistencia de sesión al salir ---- */
document.addEventListener("visibilitychange",()=>{if(document.hidden)guardarSesionViva();});
window.addEventListener("beforeunload",guardarSesionViva);

/* ---- arranque ---- */
function init(){
  $("#titulo").innerHTML=esc(BANCO.meta.titulo)+'<br><span>'+esc(BANCO.meta.subtitulo)+'</span>';
  $("#descripcion").textContent=BANCO.meta.descripcion;
  $("#nota").textContent=BANCO.meta.nota;
  document.title=BANCO.meta.titulo+" · "+BANCO.meta.subtitulo;
  aplicarTema(Memoria.leerTema()||(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro"));
  construirMenu();
  pintarModo("instant");
  refrescarInicio();
  Memoria.init();
}
init();