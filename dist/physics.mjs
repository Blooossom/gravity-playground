export const MAX_BALLS=350;
export const COLORS=['#ef9279','#a9bfd2','#bbacd3','#e8c570','#9fbea7','#e5a9b4','#f0aa76'];
export class World {
 constructor(width=900,height=600){this.width=width;this.height=height;this.balls=[];this.holes=[];this.gx=0;this.gy=900;this.restitution=.8;this.attraction=1;this.absorbed=0;this.nextId=0;}
 add(x,y,r=12,vx=0,vy=0){if(this.balls.length>=MAX_BALLS)return null;const b={id:++this.nextId,x:Math.max(r,Math.min(this.width-r,x)),y:Math.max(r,Math.min(this.height-r,y)),r,vx,vy,color:COLORS[Math.floor(Math.random()*COLORS.length)],trail:[],held:false};this.balls.push(b);return b;}
 step(dt){const balls=this.balls;const drag=Math.exp(-.055*dt);
 for(let i=balls.length-1;i>=0;i--){const b=balls[i];if(b.held)continue;let ax=this.gx,ay=this.gy;let eaten=false;
 for(const h of this.holes){let dx=h.x-b.x,dy=h.y-b.y,d2=dx*dx+dy*dy;if(d2<(h.r+b.r*.15)**2){balls.splice(i,1);this.absorbed++;eaten=true;break;}const d=Math.sqrt(d2),a=Math.min(14000,22000000*this.attraction/(d2+1500));ax+=dx/d*a;ay+=dy/d*a;}if(eaten)continue;
 b.vx=(b.vx+ax*dt)*drag;b.vy=(b.vy+ay*dt)*drag;const speed=Math.hypot(b.vx,b.vy);if(speed>1800){b.vx*=1800/speed;b.vy*=1800/speed;}b.x+=b.vx*dt;b.y+=b.vy*dt;
 }
 // A spatial grid keeps dense showers responsive; two passes stabilize piles.
 for(let pass=0;pass<2;pass++){const grid=new Map(),cell=64;for(const b of balls){const cx=Math.floor(b.x/cell),cy=Math.floor(b.y/cell);for(let ix=cx-1;ix<=cx+1;ix++)for(let iy=cy-1;iy<=cy+1;iy++){for(const a of grid.get(ix+','+iy)||[])this.collide(a,b);}const key=cx+','+cy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b);}for(const b of balls)this.boundary(b);}
 }
 collide(a,b){let dx=b.x-a.x,dy=b.y-a.y;const rr=a.r+b.r,dist2=dx*dx+dy*dy;if(dist2>=rr*rr)return;let d=Math.sqrt(dist2);if(d<.0001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d,ia=a.held?0:1/(a.r*a.r),ib=b.held?0:1/(b.r*b.r),sum=ia+ib;if(!sum)return;const overlap=Math.max(0,rr-d-.02)*.85;a.x-=nx*overlap*ia/sum;a.y-=ny*overlap*ia/sum;b.x+=nx*overlap*ib/sum;b.y+=ny*overlap*ib/sum;const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)return;const e=Math.abs(rel)<35?0:this.restitution;const impulse=-(1+e)*rel/sum;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;}
 boundary(b){if(b.held)return;const e=this.restitution;const impact=v=>Math.abs(v)<25?0:Math.abs(v)*e;if(b.x<b.r){b.x=b.r;if(b.vx<0)b.vx=impact(b.vx);}if(b.x>this.width-b.r){b.x=this.width-b.r;if(b.vx>0)b.vx=-impact(b.vx);}if(b.y<b.r){b.y=b.r;if(b.vy<0)b.vy=impact(b.vy);}if(b.y>this.height-b.r){b.y=this.height-b.r;if(b.vy>0)b.vy=-impact(b.vy);}}
}
