export const MAX_BALLS=350;
export const COLORS=['#ef9279','#a9bfd2','#bbacd3','#e8c570','#9fbea7','#e5a9b4','#f0aa76'];
export class World {
 constructor(width=900,height=600){this.width=width;this.height=height;this.balls=[];this.holes=[];this.gx=0;this.gy=900;this.restitution=.8;this.attraction=1;this.absorbed=0;this.nextId=0;this.recycled=0;this.exitCursor=0;this.medium='normal';this.elapsed=0;}
 add(x,y,r=12,vx=0,vy=0){if(this.balls.length>=MAX_BALLS)return null;const b={id:++this.nextId,x:Math.max(r,Math.min(this.width-r,x)),y:Math.max(r,Math.min(this.height-r,y)),r,vx,vy,color:COLORS[Math.floor(Math.random()*COLORS.length)],trail:[],held:false,portalCooldown:0};this.balls.push(b);return b;}
 step(dt){const balls=this.balls;this.elapsed+=dt;const drag=Math.exp(-(this.medium==='water'?3.2:this.medium==='storm'?.3:.055)*dt);
 const exits=this.holes.filter(h=>h.kind==='white');
 for(const h of this.holes)h.pulse=Math.max(0,(h.pulse||0)-dt*2);
 for(let i=balls.length-1;i>=0;i--){const b=balls[i];if(b.held)continue;b.portalCooldown=Math.max(0,(b.portalCooldown||0)-dt);let ax=this.gx,ay=this.gy;let eaten=false;
 if(this.medium==='water'){ax+=Math.sin(this.elapsed*.8+b.y*.008)*45;}
 if(this.medium==='storm'){
  const dx=b.x-this.width/2,dy=b.y-this.height/2,d=Math.max(35,Math.hypot(dx,dy));
  ax+=(-dy/d*1800-dx*2.8);ay+=(dx/d*1800-dy*2.8);
 }
 for(const h of this.holes){
  if(h.kind==='white')continue;
  const dx=h.x-b.x,dy=h.y-b.y,d2=dx*dx+dy*dy;
  if(d2<(h.r+b.r*.15)**2&&b.portalCooldown===0){
   this.absorbed++;h.pulse=1;
   if(exits.length){this.emit(b,exits[this.exitCursor++%exits.length]);}else balls.splice(i,1);
   eaten=true;break;
  }
  const d=Math.max(.001,Math.sqrt(d2)),a=Math.min(14000*Math.sqrt(this.attraction),22000000*this.attraction/(d2+1500))*(b.portalCooldown>0?.12:1);
  ax+=dx/d*a;ay+=dy/d*a;
 }if(eaten)continue;
 b.vx=(b.vx+ax*dt)*drag;b.vy=(b.vy+ay*dt)*drag;const speed=Math.hypot(b.vx,b.vy);if(speed>2600){b.vx*=2600/speed;b.vy*=2600/speed;}b.x+=b.vx*dt;b.y+=b.vy*dt;
 }
 // A spatial grid keeps dense showers responsive; two passes stabilize piles.
 for(let pass=0;pass<2;pass++){const grid=new Map(),cell=64;for(const b of balls){const cx=Math.floor(b.x/cell),cy=Math.floor(b.y/cell);for(let ix=cx-1;ix<=cx+1;ix++)for(let iy=cy-1;iy<=cy+1;iy++){for(const a of grid.get(ix+','+iy)||[])this.collide(a,b);}const key=cx+','+cy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b);}for(const b of balls)this.boundary(b);}
 }
 emit(b,h){
  // Reuse the same ball, even at capacity; briefly protect it from reabsorption.
  const base=Math.atan2(this.height/2-h.y,this.width/2-h.x);
  const angle=base+Math.sin(this.recycled*2.399963)*1.15;
  const distance=h.r+b.r+12,speed=360+Math.min(300,Math.hypot(b.vx,b.vy)*.25);
  b.x=Math.max(b.r,Math.min(this.width-b.r,h.x+Math.cos(angle)*distance));
  b.y=Math.max(b.r,Math.min(this.height-b.r,h.y+Math.sin(angle)*distance));
  b.vx=Math.cos(angle)*speed;b.vy=Math.sin(angle)*speed;
  b.trail=[];b.portalCooldown=1.2;h.pulse=1;this.recycled++;
 }
 collide(a,b){let dx=b.x-a.x,dy=b.y-a.y;const rr=a.r+b.r,dist2=dx*dx+dy*dy;if(dist2>=rr*rr)return;let d=Math.sqrt(dist2);if(d<.0001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d,ia=a.held?0:1/(a.r*a.r),ib=b.held?0:1/(b.r*b.r),sum=ia+ib;if(!sum)return;const overlap=Math.max(0,rr-d-.02)*.85;a.x-=nx*overlap*ia/sum;a.y-=ny*overlap*ia/sum;b.x+=nx*overlap*ib/sum;b.y+=ny*overlap*ib/sum;const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)return;const e=Math.abs(rel)<35?0:this.restitution;const impulse=-(1+e)*rel/sum;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;}
 boundary(b){if(b.held)return;const e=this.restitution;const impact=v=>Math.abs(v)<25?0:Math.abs(v)*e;if(b.x<b.r){b.x=b.r;if(b.vx<0)b.vx=impact(b.vx);}if(b.x>this.width-b.r){b.x=this.width-b.r;if(b.vx>0)b.vx=-impact(b.vx);}if(b.y<b.r){b.y=b.r;if(b.vy<0)b.vy=impact(b.vy);}if(b.y>this.height-b.r){b.y=this.height-b.r;if(b.vy>0)b.vy=-impact(b.vy);}}
}
