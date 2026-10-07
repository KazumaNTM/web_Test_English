/* ============================================================
   QR — codificador embebido (modo byte, corrección L, v1–10)
   Sin dependencias externas. Dibuja en <canvas> con zona muda.
   ============================================================ */
const QR=(()=>{
"use strict";
/* GF(256) con polinomio 0x11D */
const EXP=new Uint8Array(512),LOG=new Uint8Array(256);
{let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11D;}for(let i=255;i<512;i++)EXP[i]=EXP[i-255];}
const gmul=(a,b)=>(a===0||b===0)?0:EXP[LOG[a]+LOG[b]];

/* Tablas (nivel L): capacidad de datos y estructura de bloques */
const CAP_L=[0,19,34,55,80,108,136,156,194,232,274];
const BLOQ=[null,
 {e:7,g:[[1,19]]},{e:10,g:[[1,34]]},{e:15,g:[[1,55]]},{e:20,g:[[1,80]]},{e:26,g:[[1,108]]},
 {e:18,g:[[2,68]]},{e:20,g:[[2,78]]},{e:24,g:[[2,97]]},{e:30,g:[[2,116]]},{e:18,g:[[2,68],[2,69]]}];
const ALINEA=[null,null,[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];

function genRS(n){
  let p=[1];
  for(let i=0;i<n;i++){
    const nx=new Array(p.length+1).fill(0);
    for(let j=0;j<p.length;j++){nx[j]^=p[j];nx[j+1]^=gmul(p[j],EXP[i]);}
    p=nx;
  }
  return p;
}
function rsEncode(datos,nEcc){
  const gen=genRS(nEcc);
  const res=datos.concat(new Array(nEcc).fill(0));
  for(let i=0;i<datos.length;i++){
    const c=res[i];
    if(c!==0)for(let j=0;j<gen.length;j++)res[i+j]^=gmul(gen[j],c);
  }
  return res.slice(datos.length);
}
function elegirVersion(bytes){
  for(let v=1;v<=10;v++){
    if(4+(v<10?8:16)+bytes.length*8+4<=CAP_L[v]*8)return v;
  }
  return 0;
}
function codificar(bytes,v){
  const bits=[];
  const push=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>i)&1);};
  push(4,4);                       /* modo byte */
  push(bytes.length,v<10?8:16);    /* contador de caracteres */
  for(const b of bytes)push(b,8);
  const maxBits=CAP_L[v]*8;
  const term=Math.min(4,maxBits-bits.length);
  if(term>0)push(0,term);
  while(bits.length%8)bits.push(0);
  const pads=[0xEC,0x11];let pi=0;
  while(bits.length<maxBits)push(pads[pi++%2],8);
  const cw=[];
  for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];cw.push(b);}
  return cw;
}
function mensajeFinal(cw,v){
  const{e,g}=BLOQ[v];
  const bloques=[];let pos=0;
  for(const[n,len]of g)for(let i=0;i<n;i++){const d=cw.slice(pos,pos+len);pos+=len;bloques.push({d,r:rsEncode(d,e)});}
  const out=[];
  const maxD=Math.max(...bloques.map(b=>b.d.length));
  for(let i=0;i<maxD;i++)for(const b of bloques)if(i<b.d.length)out.push(b.d[i]);
  for(let i=0;i<e;i++)for(const b of bloques)out.push(b.r[i]);
  return out;
}
/* Matriz con patrones de función (sin formato ni datos) */
function baseMatrix(v){
  const size=17+4*v;
  const m=Array.from({length:size},()=>new Array(size).fill(0));
  const r=Array.from({length:size},()=>new Array(size).fill(false));
  const finder=(row,col)=>{
    for(let dr=-1;dr<=7;dr++)for(let dc=-1;dc<=7;dc++){
      const rr=row+dr,cc=col+dc;
      if(rr<0||rr>=size||cc<0||cc>=size)continue;
      m[rr][cc]=(dr>=0&&dr<=6&&dc>=0&&dc<=6&&(dr===0||dr===6||dc===0||dc===6||(dr>=2&&dr<=4&&dc>=2&&dc<=4)))?1:0;
      r[rr][cc]=true;
    }
  };
  finder(0,0);finder(0,size-7);finder(size-7,0);
  if(v>=2){
    for(const ar of ALINEA[v])for(const ac of ALINEA[v]){
      if((ar===6&&ac===6)||(ar===6&&ac===size-7)||(ar===size-7&&ac===6))continue;
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){
        m[ar+dr][ac+dc]=(Math.max(Math.abs(dr),Math.abs(dc))!==1)?1:0;
        r[ar+dr][ac+dc]=true;
      }
    }
  }
  for(let i=8;i<size-8;i++){
    m[6][i]=(i%2===0)?1:0;r[6][i]=true;
    m[i][6]=(i%2===0)?1:0;r[i][6]=true;
  }
  m[size-8][8]=1;r[size-8][8]=true; /* módulo oscuro */
  for(let i=0;i<=8;i++){if(i!==6){r[8][i]=true;r[i][8]=true;}}
  for(let i=0;i<8;i++){r[8][size-1-i]=true;r[size-1-i][8]=true;}
  if(v>=7){
    for(let rr=0;rr<6;rr++)for(let cc=size-11;cc<=size-9;cc++)r[rr][cc]=true;
    for(let rr=size-11;rr<=size-9;rr++)for(let cc=0;cc<6;cc++)r[rr][cc]=true;
  }
  return{m,r,size};
}
const MASCARAS=[
 (r,c)=>((r+c)%2)===0,
 (r,c)=>(r%2)===0,
 (r,c)=>(c%3)===0,
 (r,c)=>((r+c)%3)===0,
 (r,c)=>(((r>>1)+Math.floor(c/3))%2)===0,
 (r,c)=>(((r*c)%2)+((r*c)%3))===0,
 (r,c)=>(((((r*c)%2)+((r*c)%3))%2)===0),
 (r,c)=>(((((r+c)%2)+((r*c)%3))%2)===0)
];
function bitsFormato(mascara){
  const datos=8|mascara; /* EC nivel L (01) + máscara */
  let rem=datos;
  for(let i=0;i<10;i++)rem=(rem<<1)^((rem>>>9)*0x537);
  return((datos<<10)|rem)^0x5412;
}
function bitsVersion(v){
  let rem=v;
  for(let i=0;i<12;i++)rem=(rem<<1)^((rem>>>11)*0x1F25);
  return(v<<12)|rem;
}
function pintarFormato(m,size,mk){
  const b=bitsFormato(mk),bit=i=>(b>>>i)&1;
  for(let i=0;i<=5;i++)m[i][8]=bit(i);
  m[7][8]=bit(6);m[8][8]=bit(7);m[8][7]=bit(8);
  for(let i=9;i<15;i++)m[8][14-i]=bit(i);
  for(let i=0;i<8;i++)m[8][size-1-i]=bit(i);
  for(let i=8;i<15;i++)m[size-15+i][8]=bit(i);
}
function pintarVersion(m,size,v){
  if(v<7)return;
  const b=bitsVersion(v);
  for(let i=0;i<18;i++){
    const bit=(b>>>i)&1;
    m[Math.floor(i/3)][i%3+size-11]=bit;
    m[i%3+size-11][Math.floor(i/3)]=bit;
  }
}
function colocarDatos(m,r,cw,fn){
  const size=m.length;
  let bi=0,sube=true;
  for(let col=size-1;col>=1;col-=2){
    if(col===6)col--;
    for(let v=0;v<size;v++){
      const row=sube?size-1-v:v;
      for(const cc of[col,col-1]){
        if(r[row][cc])continue;
        const bit=((cw[bi>>3]||0)>>>(7-(bi&7)))&1;
        m[row][cc]=bit^(fn(row,cc)?1:0);
        bi++;
      }
    }
    sube=!sube;
  }
}
/* Penalización (4 reglas del estándar) para elegir la mejor máscara */
function penalizacion(m){
  const size=m.length;let pen=0;
  const linea=f=>{
    let run=1;
    for(let i=1;i<=f.length;i++){
      if(i<f.length&&f[i]===f[i-1])run++;
      else{if(run>=5)pen+=3+(run-5);run=1;}
    }
  };
  for(let r2=0;r2<size;r2++)linea(m[r2]);
  for(let c=0;c<size;c++){const col=[];for(let r2=0;r2<size;r2++)col.push(m[r2][c]);linea(col);}
  for(let r2=0;r2<size-1;r2++)for(let c=0;c<size-1;c++){
    const v=m[r2][c];
    if(v===m[r2][c+1]&&v===m[r2+1][c]&&v===m[r2+1][c+1])pen+=3;
  }
  const pat=[1,0,1,1,1,0,1];
  const buscar=s=>{
    for(let i=0;i+11<=s.length;i++){
      let ok=true;
      for(let j=0;j<7;j++)if(s[i+4+j]!==pat[j]){ok=false;break;}
      if(ok){
        const izq=s[i]===0&&s[i+1]===0&&s[i+2]===0&&s[i+3]===0;
        const der=s[i+7]===0&&s[i+8]===0&&s[i+9]===0&&s[i+10]===0;
        if(izq||der)pen+=40;
      }
    }
  };
  for(let r2=0;r2<size;r2++)buscar(m[r2]);
  for(let c=0;c<size;c++){const col=[];for(let r2=0;r2<size;r2++)col.push(m[r2][c]);buscar(col);}
  let osc=0;
  for(const f of m)for(const v of f)osc+=v;
  pen+=Math.floor(Math.abs(osc*100/(size*size)-50)/5)*10;
  return pen;
}
function generar(texto){
  const bytes=new TextEncoder().encode(texto);
  const v=elegirVersion(bytes);
  if(!v)return null;
  const fin=mensajeFinal(codificar(bytes,v),v);
  const{m,r,size}=baseMatrix(v);
  let mejor=null,mejorPen=Infinity;
  for(let mk=0;mk<8;mk++){
    const mm=m.map(f=>f.slice());
    colocarDatos(mm,r,fin,MASCARAS[mk]);
    pintarFormato(mm,size,mk);
    pintarVersion(mm,size,v);
    const p=penalizacion(mm);
    if(p<mejorPen){mejorPen=p;mejor=mm;}
  }
  return{size,m:mejor};
}
/* Dibujo en canvas con zona muda de 4 módulos */
function dibujar(canvas,texto,px){
  px=px||240;
  const q=generar(String(texto));
  if(!q)return false;
  const quiet=4,total=q.size+quiet*2;
  const esc=Math.max(2,Math.floor(px/total));
  const real=esc*total;
  canvas.width=real;canvas.height=real;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,real,real);
  ctx.fillStyle="#111827";
  for(let r=0;r<q.size;r++)for(let c=0;c<q.size;c++)
    if(q.m[r][c])ctx.fillRect((c+quiet)*esc,(r+quiet)*esc,esc,esc);
  return true;
}
return{generar,dibujar};
})();