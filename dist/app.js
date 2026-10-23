import {World,MAX_BALLS} from './physics.mjs';
import {captureScene,restoreScene} from './scene.mjs';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),canvas=$('#world'),ctx=canvas.getContext('2d'),wrap=$('#canvas-wrap');
const world=new World();let tool='throw',size='random',direction='down',paused=false,raining=false,showTrails=false,drag=null,frame=0,last=0,acc=0,rainClock=0,toastTimer,chaosClock=0,chaos=false,watching=false;
const dirs={up:[0,-1,'위로 ↑'],right:[1,0,'오른쪽 →'],down:[0,1,'아래로 ↓'],left:[-1,0,'왼쪽 ←'],zero:[0,0,'무중력 ✧']};
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2300);}
function resize(){const r=canvas.getBoundingClientRect(),w=r.width,h=r.height,oldW=world.width,oldH=world.height;world.width=w;world.height=h;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);for(const b of world.balls){b.x*=w/oldW;b.y*=h/oldH;b.trail=[];world.boundary(b);}for(const hole of world.holes){hole.x*=w/oldW;hole.y*=h/oldH;}}
new ResizeObserver(resize).observe(wrap);resize();
function radius(){return size==='small'?8:size==='medium'?16:size==='large'?27:8+Math.random()*18;}
function add(x,y,vx=0,vy=0){return world.add(x,y,radius(),vx,vy);}
function shower(n){for(let i=0;i<n;i++)add(35+Math.random()*(world.width-70),40+Math.random()*world.height*.38,(Math.random()-.5)*550,Math.random()*140-70);if(world.balls.length>=MAX_BALLS)toast('공이 가득 찼어요! 최대 350개까지 놀 수 있어요.');updateCounts();}
function seed(){for(let i=0;i<44;i++)world.add(35+Math.random()*(world.width-70),55+Math.random()*(world.height-125),9+Math.random()*19,(Math.random()-.5)*380,(Math.random()-.5)*200);updateCounts();}
function updateCounts(){$('#ball-count').textContent=world.balls.length;$('#hole-count').textContent=world.holes.filter(h=>h.kind!=='white').length;$('#white-count').textContent=world.holes.filter(h=>h.kind==='white').length;}
function paintRange(el){const n=(Number(el.value)-Number(el.min))/(Number(el.max)-Number(el.min))*100;el.style.background=`linear-gradient(to right, ${el.id==='attraction'?'#a18abb':'#ee795f'} ${n}%, #eaeae3 ${n}%)`;}
function clearPreset(){chaos=false;$$('[data-preset]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});}
function setGravity(dir=direction){direction=dir;const g=Number($('#gravity').value);world.gx=dirs[dir][0]*g*900;world.gy=dirs[dir][1]*g*900;const val=dir==='zero'?0:g;$('#gravity-label').textContent=val===0?'무중력 ✧':dirs[dir][2];$('#gravity-value').textContent=val.toFixed(1)+' g';$('#g-readout').innerHTML=val.toFixed(1)+'<span>g</span>';$$('[data-dir]').forEach(b=>{const active=b.dataset.dir===dir;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});paintRange($('#gravity'));}
$$('[data-dir]').forEach(b=>b.onclick=()=>{clearPreset();setGravity(b.dataset.dir);});
$('#gravity').oninput=()=>{clearPreset();setGravity(direction==='zero'?'down':direction);};
$('#rotate').onclick=()=>{clearPreset();const list=['down','left','up','right'];setGravity(list[(list.indexOf(direction)+1)%4]);};
function setBounce(v){$('#bounce').value=v;world.restitution=v/100;$('#bounce-value').textContent=v+'%';$('#bounce-note').textContent=v<30?'폭신하게, 사뿐하게':v>90?'끝없이 튀어볼까?':'통통 튀는 하루';paintRange($('#bounce'));}
$('#bounce').oninput=e=>setBounce(Number(e.target.value));
$('#attraction').oninput=e=>{world.attraction=Number(e.target.value);$('#attraction-value').textContent=world.attraction.toFixed(1)+'×';paintRange(e.target);};
$$('[data-size]').forEach(b=>b.onclick=()=>{size=b.dataset.size;$('#size-value').textContent=({small:'작게',medium:'보통',large:'크게',random:'랜덤'})[size];$$('[data-size]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});});
function releaseDrag(){if(drag?.ball)drag.ball.held=false;drag=null;}
function selectTool(t){releaseDrag();tool=t;$$('[data-tool]').forEach(b=>{b.classList.toggle('active',b.dataset.tool===t);b.setAttribute('aria-pressed',b.dataset.tool===t);});$('#hint').textContent=({throw:'클릭하면 공이 톡! 드래그하면 쓱 날아가요.',grab:'공을 잡아 옮긴 뒤 놓으면, 휙! 날아가요.',hole:'빈 곳을 눌러 블랙홀 설치. 다시 누르면 사라져요.',white:'블랙홀이 삼킨 공이 여기서 나와요. 다시 누르면 삭제.'})[t];$('#hint-icon').textContent=({throw:'↗',grab:'✥',hole:'◉',white:'◎'})[t];canvas.style.cursor=t==='grab'?'grab':'crosshair';}
$$('[data-tool]').forEach(b=>b.onclick=()=>selectTool(b.dataset.tool));
function preset(name){releaseDrag();chaos=name==='chaos';chaosClock=0;$$('[data-preset]').forEach(b=>{b.classList.toggle('active',b.dataset.preset===name);b.setAttribute('aria-pressed',b.dataset.preset===name);});$('#gravity').value=({earth:1,moon:.2,space:0,chaos:1.4})[name];setGravity(name==='space'?'zero':'down');setBounce(name==='space'?98:name==='chaos'?96:80);if(name==='space'||name==='chaos')for(const b of world.balls){b.vx+=(Math.random()-.5)*500;b.vy-=200+Math.random()*350;}toast(({earth:'익숙한 지구, 1.0 g',moon:'달처럼 가볍게, 0.2 g',space:'중력 OFF. 마음껏 둥둥.',chaos:'3초마다 중력이 돌아가요!'})[name]);}
$$('[data-preset]').forEach(b=>b.onclick=()=>preset(b.dataset.preset));
function setPaused(v){paused=v;$('#pause').textContent=v?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',v?'재생':'일시정지');$('#pause').title=v?'재생 (Space)':'일시정지 (Space)';$('#paused-label').hidden=!v;$('#play-state').textContent=v?'EXPERIMENT PAUSED':'LIVE EXPERIMENT';}
$('#pause').onclick=()=>setPaused(!paused);$('#burst').onclick=()=>shower(30);
$('#rain').onclick=()=>{raining=!raining;$('#rain').setAttribute('aria-pressed',raining);$('#rain').textContent=raining?'☂ 공 비 멈추기':'☂ 공 비 내리기';};
$('#trails').onchange=e=>{showTrails=e.target.checked;world.balls.forEach(b=>b.trail=[]);};
$('#clear').onclick=()=>{releaseDrag();world.balls=[];world.holes=[];world.absorbed=0;world.recycled=0;world.exitCursor=0;updateCounts();toast('말끔해졌어요. 다시 시작해볼까요?');};
$('#remove-holes').onclick=()=>{world.holes=[];updateCounts();toast('블랙홀과 화이트홀을 모두 지웠어요.');};
$('#reset').onclick=()=>{releaseDrag();world.balls=[];world.holes=[];world.absorbed=0;world.recycled=0;world.exitCursor=0;raining=false;$('#rain').setAttribute('aria-pressed','false');$('#rain').textContent='☂ 공 비 내리기';setPaused(false);preset('earth');size='random';$('[data-size="random"]').click();$('#attraction').value=1;$('#attraction').dispatchEvent(new Event('input'));$('#trails').checked=false;showTrails=false;selectTool('throw');seed();toast('처음의 놀이터로 돌아왔어요.');};
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{if(watching||e.button!==0||drag)return;e.preventDefault();canvas.focus({preventScroll:true});const p=point(e);if(tool==='hole'||tool==='white'){
 const kind=tool==='white'?'white':'black',name=kind==='white'?'화이트홀':'블랙홀';
 const existing=world.holes.findIndex(h=>Math.hypot(h.x-p.x,h.y-p.y)<34);
 if(existing>=0){world.holes.splice(existing,1);}
 else if(world.holes.filter(h=>(h.kind||'black')===kind).length<6){world.holes.push({...p,kind,r:17,phase:Math.random()*6,pulse:0});toast(kind==='white'?'블랙홀이 삼킨 공이 여기로 나와요.':'작은 블랙홀이 생겼어요.');}
 else toast(name+'은 최대 6개까지 만들 수 있어요.');updateCounts();return;
 }
 canvas.setPointerCapture(e.pointerId);if(tool==='grab'){let ball=[...world.balls].reverse().find(b=>Math.hypot(b.x-p.x,b.y-p.y)<b.r+8);if(!ball)return;ball.held=true;ball.vx=0;ball.vy=0;drag={start:p,current:p,last:p,time:performance.now(),ball,ox:ball.x-p.x,oy:ball.y-p.y,id:e.pointerId};canvas.style.cursor='grabbing';}else drag={start:p,current:p,id:e.pointerId};});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const p=point(e);drag.current=p;if(drag.ball){const b=drag.ball,now=performance.now(),dt=Math.max(.008,(now-drag.time)/1000);b.vx=Math.max(-1500,Math.min(1500,(p.x-drag.last.x)/dt));b.vy=Math.max(-1500,Math.min(1500,(p.y-drag.last.y)/dt));b.x=Math.max(b.r,Math.min(world.width-b.r,p.x+drag.ox));b.y=Math.max(b.r,Math.min(world.height-b.r,p.y+drag.oy));drag.last=p;drag.time=now;}});
canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.ball){if(performance.now()-drag.time>100){drag.ball.vx=0;drag.ball.vy=0;}drag.ball.held=false;canvas.style.cursor='grab';}else{const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;const b=add(drag.start.x,drag.start.y,dx*5,dy*5);if(!b)toast('공이 가득 찼어요! 비우고 다시 놀아보세요.');}drag=null;updateCounts();});
canvas.addEventListener('pointercancel',releaseDrag);canvas.addEventListener('lostpointercapture',releaseDrag);window.addEventListener('blur',()=>{releaseDrag();last=0;});document.addEventListener('visibilitychange',()=>{last=0;acc=0;});
const dialog=$('#help-dialog');$('#help').onclick=()=>{dialog.showModal();$('#help').setAttribute('aria-expanded','true');};function closeHelp(){dialog.close();$('#help').setAttribute('aria-expanded','false');}$('#close-help').onclick=closeHelp;$('#start-playing').onclick=closeHelp;dialog.addEventListener('close',()=>$('#help').setAttribute('aria-expanded','false'));
function setWatching(value){
 releaseDrag();watching=value;document.body.classList.toggle('watch-mode',value);
 $('#watch').setAttribute('aria-pressed',value);
 if(value){canvas.focus({preventScroll:true});toast('그냥 바라보세요. Esc를 누르면 돌아와요.');}
 else $('#watch').focus({preventScroll:true});
}
$('#watch').onclick=()=>setWatching(true);$('#exit-watch').onclick=()=>setWatching(false);
$('#save-layout').onclick=()=>{
 try{localStorage.setItem('mamdaero-scene-v1',JSON.stringify(captureScene(world,{size,direction,gravity:Number($('#gravity').value),raining,showTrails,chaos})));toast('지금의 공과 배치를 저장했어요.');}
 catch{toast('브라우저 저장 공간을 사용할 수 없어요.');}
};
$('#load-layout').onclick=()=>{
 try{const raw=localStorage.getItem('mamdaero-scene-v1');if(!raw){toast('먼저 마음에 드는 배치를 저장해보세요.');return;}
 const settings=restoreScene(world,JSON.parse(raw));releaseDrag();clearPreset();
 $('#gravity').value=settings.gravity;setGravity(settings.direction);setBounce(world.restitution*100);
 $('#attraction').value=world.attraction;$('#attraction').dispatchEvent(new Event('input'));
 $('[data-size="'+settings.size+'"]').click();raining=settings.raining;$('#rain').setAttribute('aria-pressed',raining);$('#rain').textContent=raining?'☂ 공 비 멈추기':'☂ 공 비 내리기';
 showTrails=settings.showTrails;$('#trails').checked=showTrails;chaos=settings.chaos;chaosClock=0;rainClock=0;acc=0;
 if(chaos){$('[data-preset="chaos"]').classList.add('active');$('[data-preset="chaos"]').setAttribute('aria-pressed','true');}
 setPaused(false);updateCounts();toast('저장한 놀이터로 돌아왔어요.');
 }catch{toast('저장한 배치를 읽을 수 없어요. 현재 놀이터는 그대로예요.');}
};
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&watching){e.preventDefault();setWatching(false);return;}
 if(dialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key.toLowerCase()==='f'){e.preventDefault();setWatching(!watching);return;}
 if(e.target.tagName==='BUTTON')return;
 if(watching){if(e.code==='Space'){e.preventDefault();setPaused(!paused);}return;}
if(e.code==='Space'){e.preventDefault();setPaused(!paused);}if(e.key.toLowerCase()==='b'){selectTool('throw');shower(1);}if(e.key.toLowerCase()==='g')selectTool('grab');if(e.key.toLowerCase()==='h')selectTool('hole');if(e.key.toLowerCase()==='w')selectTool('white');});
function drawHole(h,t){if(h.kind==='white'){drawWhiteHole(h,t);return;}ctx.save();ctx.translate(h.x,h.y);const glow=ctx.createRadialGradient(0,0,13,0,0,70);glow.addColorStop(0,'#7c659d55');glow.addColorStop(1,'#9c7fc000');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,70,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){ctx.save();ctx.rotate(t*.35+h.phase+i*1.1);ctx.strokeStyle=['#aa95c8aa','#c3b0df88','#85709c77'][i];ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,0,29+i*6,10+i*4,0,0,Math.PI*2);ctx.stroke();ctx.restore();}ctx.shadowBlur=17;ctx.shadowColor='#9c7fc0';ctx.fillStyle='#302a3a';ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#c0a6de';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();}
function drawWhiteHole(h,t){
 ctx.save();ctx.translate(h.x,h.y);
 const glow=ctx.createRadialGradient(0,0,8,0,0,75);glow.addColorStop(0,'#ffffffee');glow.addColorStop(.35,'#b5e4d780');glow.addColorStop(1,'#b5e4d700');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,75,0,Math.PI*2);ctx.fill();
 for(let i=0;i<3;i++){ctx.save();ctx.rotate(-t*.35+h.phase+i*1.1);ctx.strokeStyle=['#70bba2bb','#9bd2bd99','#ffffffcc'][i];ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,29+i*6,10+i*4,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 ctx.shadowBlur=20;ctx.shadowColor='#e2fff4';ctx.fillStyle='#fffff8';ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#89bfa9';ctx.lineWidth=1.5;ctx.stroke();
 if(h.pulse>0){ctx.globalAlpha=h.pulse*.6;ctx.beginPath();ctx.arc(0,0,22+(1-h.pulse)*35,0,Math.PI*2);ctx.stroke();}ctx.restore();
}
function draw(t){ctx.clearRect(0,0,world.width,world.height);if(showTrails){for(const b of world.balls){if(b.trail.length<2)continue;ctx.beginPath();ctx.moveTo(b.trail[0].x,b.trail[0].y);for(const p of b.trail)ctx.lineTo(p.x,p.y);ctx.strokeStyle=b.color+'65';ctx.lineWidth=Math.max(1,b.r*.18);ctx.stroke();}}for(const h of world.holes)drawHole(h,t);
 for(const b of world.balls){ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#46534318';ctx.shadowBlur=4;ctx.shadowOffsetY=3;const grad=ctx.createRadialGradient(-b.r*.35,-b.r*.4,b.r*.05,0,0,b.r);grad.addColorStop(0,lighten(b.color));grad.addColorStop(.6,b.color);grad.addColorStop(1,b.color);ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#ffffff4d';ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.ellipse(-b.r*.3,-b.r*.4,b.r*.23,b.r*.13,-.6,0,Math.PI*2);ctx.fillStyle='#ffffff45';ctx.fill();if(b.held){ctx.beginPath();ctx.arc(0,0,b.r+5,0,Math.PI*2);ctx.strokeStyle='#657d60';ctx.setLineDash([3,3]);ctx.stroke();}ctx.restore();}
 if(drag&&!drag.ball){const a=drag.start,b=drag.current;ctx.save();ctx.strokeStyle='#6b8170';ctx.fillStyle='#6b817025';ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(a.x,a.y,16,0,Math.PI*2);ctx.fill();ctx.stroke();const angle=Math.atan2(b.y-a.y,b.x-a.x);ctx.beginPath();ctx.moveTo(b.x-10*Math.cos(angle-.5),b.y-10*Math.sin(angle-.5));ctx.lineTo(b.x,b.y);ctx.lineTo(b.x-10*Math.cos(angle+.5),b.y-10*Math.sin(angle+.5));ctx.stroke();ctx.restore();}}
const colorCache=new Map();function lighten(hex){if(colorCache.has(hex))return colorCache.get(hex);const nums=hex.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*.65+255*.35));const result=`rgb(${nums.join(',')})`;colorCache.set(hex,result);return result;}
let simTime=0;function loop(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused&&!dialog.open){simTime+=dt;acc+=dt;if(raining){rainClock+=dt;while(rainClock>.055){rainClock-=.055;add(25+Math.random()*(world.width-50),25,(Math.random()-.5)*200,90);}}if(chaos){chaosClock+=dt;if(chaosClock>3){chaosClock=0;const d=['down','left','up','right'];setGravity(d[(d.indexOf(direction)+1)%4]);}}while(acc>=1/180){world.step(1/180);acc-=1/180;}if(showTrails&&frame%2===0)for(const b of world.balls){b.trail.push({x:b.x,y:b.y});if(b.trail.length>24)b.trail.shift();}}else acc=0;draw(simTime);if(frame++%10===0)updateCounts();requestAnimationFrame(loop);}
setGravity();setBounce(80);paintRange($('#attraction'));selectTool('throw');$$('[data-size]').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('active')));$$('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('active')));seed();requestAnimationFrame(loop);
