// Local vector scenery: one cached painting plus a small animated overlay.
export const BACKDROP_NAMES=['earth','moon','space','jupiter','sun','water','storm','chaos'];
export class BackdropRenderer {
 constructor(){this.name='earth';this.previous=null;this.changedAt=0;this.cache=new Map();this.motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');}
 setTheme(name){name=BACKDROP_NAMES.includes(name)?name:'earth';if(this.name===name)return;this.previous=this.name;this.name=name;this.changedAt=performance.now();}
 draw(ctx,w,h,time){
  if(w<=0||h<=0)return;
  const fade=this.motion?.matches?1:Math.min(1,(performance.now()-this.changedAt)/700);
  ctx.save();
  if(this.previous&&fade<1){ctx.drawImage(this.painting(this.previous,w,h),0,0,w,h);ctx.globalAlpha=fade;}
  ctx.drawImage(this.painting(this.name,w,h),0,0,w,h);
  this.animate(ctx,w,h,this.motion?.matches?0:time,this.name);
  ctx.restore();
  if(fade>=1&&this.previous){this.cache.delete(this.previous);this.previous=null;}
 }
 painting(name,w,h){
  const dpr=Math.min(globalThis.devicePixelRatio||1,2),pw=Math.ceil(w*dpr),ph=Math.ceil(h*dpr),cached=this.cache.get(name);
  if(cached&&cached.width===pw&&cached.height===ph)return cached;
  const canvas=document.createElement('canvas');canvas.width=pw;canvas.height=ph;
  const c=canvas.getContext('2d');c.scale(dpr,dpr);
  let seed=7281;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const palettes={earth:['#a9cedd','#e3e6d5'],moon:['#182238','#697288'],space:['#101d35','#352d4e'],jupiter:['#d7b49a','#edddbe'],sun:['#df8554','#f7d395'],water:['#a1d8d5','#285c76'],storm:['#37465f','#8a9eae'],chaos:['#d9cfe5','#d2e5df']};
  const colors=palettes[name],sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,colors[0]);sky.addColorStop(1,colors[1]);c.fillStyle=sky;c.fillRect(0,0,w,h);
  const glow=(x,y,r,color)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);};
  const ellipse=(x,y,rx,ry,color,rotation=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill();};
  const stars=(count,opacity=.55)=>{for(let i=0;i<count;i++)ellipse(random()*w,random()*h*.87,.5+random()*.9,.5+random()*.7,`rgba(233,242,248,${opacity*(.3+random()*.7)})`);};
  const ridge=(base,amp,color,seedOffset)=>{c.fillStyle=color;c.beginPath();c.moveTo(0,h);c.lineTo(0,h*base);for(let x=0;x<=w+12;x+=12)c.lineTo(x,h*base+Math.sin(x/w*8+seedOffset)*h*amp+Math.cos(x/w*19+seedOffset)*h*amp*.25);c.lineTo(w,h);c.closePath();c.fill();};
  if(name==='earth'){
   glow(w*.78,h*.17,h*.42,'#fff7d477');ellipse(w*.78,h*.17,Math.min(w,h)*.052,Math.min(w,h)*.052,'#fff9dfbb');
   ridge(.83,.027,'#9db5ae',1);ridge(.91,.034,'#7d9f91',3);ridge(.98,.025,'#6d8f7e',5);
  }else if(name==='moon'){
   stars(80);glow(w*.82,h*.19,h*.19,'#b4dfe622');
   ellipse(w*.82,h*.19,h*.043,h*.043,'#8baebb');ellipse(w*.814,h*.18,h*.027,h*.02,'#b6c9b9');
   ridge(.82,.055,'#6d7484',2);ridge(.91,.035,'#9297a4',4);
   for(let i=0;i<12;i++){const x=random()*w,y=h*(.9+random()*.1),r=8+random()*w*.027;ellipse(x,y,r,r*.28,'#535d7355');ellipse(x,y+2,r*.75,r*.17,'#bcc0cb44');}
  }else if(name==='space'){
   glow(w*.3,h*.42,w*.55,'#77689e33');glow(w*.87,h*.74,h*.65,'#6488b52b');stars(145,.7);
   c.save();c.translate(w*.8,h*.25);c.rotate(-.3);c.strokeStyle='#beb5d133';c.lineWidth=h*.012;c.beginPath();c.ellipse(0,0,h*.095,h*.026,0,0,Math.PI*2);c.stroke();ellipse(0,0,h*.048,h*.048,'#9a97b755');c.restore();
  }else if(name==='jupiter'){
   for(let i=0;i<13;i++){
    const y=h*i/12;c.fillStyle=['#a5756330','#fff0d742','#af856f33','#e6c69b65'][i%4];c.beginPath();c.moveTo(0,y);
    for(let x=0;x<=w+16;x+=16)c.lineTo(x,y+Math.sin(x/w*8+i)*h*.014);
    for(let x=w+16;x>=0;x-=16)c.lineTo(x,y+h*(.035+(i%3)*.009)+Math.sin(x/w*8+i+.6)*h*.013);c.closePath();c.fill();
   }
   for(let i=5;i>0;i--)ellipse(w*.72,h*.69,w*(.07+i*.012),h*(.025+i*.008),i%2?'#ba7e6230':'#eac4a64a',-.08);
   glow(w*.25,h*.2,w*.8,'#fff4df33');
  }else if(name==='sun'){
   glow(w*.52,h*1.15,h*1.2,'#fff3b68c');
   for(let i=0;i<110;i++){const x=random()*w,y=random()*h,r=6+random()*25;ellipse(x,y,r,r*.7,i%2?'#ffecc51c':'#a94a3812');}
   c.strokeStyle='#ffeac538';c.lineWidth=3;for(let i=0;i<7;i++){c.beginPath();c.ellipse(w*(.08+i*.16),h*1.02,w*.12,h*(.13+(i%3)*.04),-.4+i*.1,Math.PI,Math.PI*2);c.stroke();}
  }else if(name==='water'){
   for(let i=0;i<6;i++){const x=w*(i*.2-.1);const ray=c.createLinearGradient(x,0,x+h*.3,h*.9);ray.addColorStop(0,'#eafff344');ray.addColorStop(1,'#eafff300');c.fillStyle=ray;c.beginPath();c.moveTo(x,0);c.lineTo(x+w*.05,0);c.lineTo(x+w*.3,h*.9);c.lineTo(x+w*.15,h*.9);c.closePath();c.fill();}
   ridge(.91,.022,'#426e7788',2);ridge(.98,.027,'#345d66aa',5);
   c.strokeStyle='#78a89e44';c.lineWidth=3;for(let i=0;i<14;i++){const x=w*(i/13);c.beginPath();c.moveTo(x,h);c.bezierCurveTo(x-15,h*.94,x+20,h*.91,x+6,h*(.86+random()*.08));c.stroke();}
  }else if(name==='storm'){
   glow(w*.5,h*.5,h*.7,'#c2d2dc44');
   ridge(.96,.022,'#354c5a66',2);
  }else if(name==='chaos'){
   glow(w*.15,h*.3,h*.6,'#eeb1b34a');glow(w*.85,h*.7,h*.6,'#9ebedc55');
   for(let i=0;i<14;i++){c.save();c.translate(random()*w,random()*h);c.rotate(random()*4);c.strokeStyle=['#a49abe44','#b4a17d44','#88a79e44'][i%3];c.lineWidth=1.5;c.strokeRect(-12,-12,24,24);c.restore();}
  }
  this.cache.set(name,canvas);for(const key of this.cache.keys())if(key!==this.name&&key!==this.previous)this.cache.delete(key);
  return canvas;
 }
 animate(c,w,h,t,name){
  c.save();const dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  if(name==='earth'){
   c.fillStyle='#ffffff38';
   for(let i=0;i<5;i++){const x=((i*.27*w+t*(3+i*.3))%(w+w*.35))-w*.17,y=h*(.22+(i%3)*.15),r=w*(.04+(i%2)*.02);c.beginPath();c.ellipse(x,y,r*1.8,r*.36,0,0,Math.PI*2);c.ellipse(x-r*.5,y-r*.17,r*.65,r*.45,0,0,Math.PI*2);c.ellipse(x+r*.35,y-r*.2,r*.8,r*.48,0,0,Math.PI*2);c.fill();}
  }else if(name==='moon'||name==='space'){
   for(let i=0;i<17;i++){const x=((i*137.508)%1000)/1000*w,y=((i*237.31+73)%800)/1000*h;dot(x,y,.9,`rgba(230,240,255,${.2+.18*Math.sin(t*.5+i)})`);}
  }else if(name==='water'){
   c.strokeStyle='#e1fff02e';c.lineWidth=1;
   for(let i=0;i<23;i++){const x=w*((i*.618)%1)+Math.sin(t*.28+i)*10,y=h-((i*71+t*(7+i%4*2))%(h+40))+20,r=2+i%4*1.5;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
   c.strokeStyle='#e6fff51f';for(let j=0;j<3;j++){c.beginPath();for(let x=0;x<=w;x+=15){const y=h*(.08+j*.035)+Math.sin(x/w*12+t*.3+j)*5;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
  }else if(name==='storm'){
   c.save();c.translate(w*.5,h*.5);c.scale(1,.7);c.rotate(t*.035);
   for(let j=0;j<6;j++){c.beginPath();for(let i=0;i<95;i++){const a=i*.055+j*Math.PI/3,r=18+i*Math.min(w,h)*.0055,x=Math.cos(a)*r,y=Math.sin(a)*r;if(!i)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=j%2?'#dce5ed1c':'#182b4524';c.lineWidth=Math.min(w,h)*.035;c.lineCap='round';c.stroke();}c.restore();
   c.strokeStyle='#e8efff1b';c.lineWidth=1;for(let i=0;i<32;i++){const x=((i*117+t*14)%(w+50))-25,y=(i*93+t*80)%(h+40)-20;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+12);c.stroke();}
  }else if(name==='jupiter'){
   c.strokeStyle='#fff3df20';c.lineWidth=2;
   for(let j=0;j<5;j++){c.beginPath();for(let x=0;x<=w;x+=18){const y=h*(.15+j*.18)+Math.sin(x/w*12+t*.14+j)*7;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
  }else if(name==='sun'){
   for(let i=0;i<24;i++){const x=w*((i*.618)%1)+Math.sin(t*.2+i)*10,y=h-((i*51+t*(4+i%3))%(h+20));dot(x,y,1+i%3,'#fff2c044');}
  }else if(name==='chaos'){
   for(let i=0;i<6;i++){c.save();c.translate(w*(.12+i*.15),h*(.3+Math.sin(t*.12+i)*.17));c.rotate(t*.06+i);c.strokeStyle='#f9fcf64d';c.lineWidth=2;c.beginPath();c.ellipse(0,0,25+i*5,12+i*3,0,0,Math.PI*2);c.stroke();c.restore();}
  }
  c.restore();
 }
}
